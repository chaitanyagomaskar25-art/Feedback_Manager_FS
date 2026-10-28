import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const issueToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured.");
  }
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const register = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 1 || name.length > 80) {
      return res.status(400).json({ message: "Name must be between 1 and 80 characters." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters." });
    }

    const existing = await User.exists({ email });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "user",
    });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }
    return res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = (req, res) => res.json({ user: publicUser(req.user) });

export const setupFirstAdmin = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    if (!process.env.ADMIN_SETUP_KEY || body.setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ message: "The administrator setup key is invalid." });
    }
    if (await User.exists({ role: "admin" })) {
      return res.status(409).json({ message: "An administrator account has already been created." });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!name || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Provide a valid name, email, and password of at least 8 characters." });
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
      role: "admin",
    });
    return res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    return next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("_id name email role createdAt").sort({ createdAt: -1 });
    return res.json(users.map((user) => ({ ...publicUser(user), createdAt: user.createdAt })));
  } catch (error) {
    return next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body ?? {};
    if (!["admin", "manager", "user"].includes(role)) {
      return res.status(400).json({ message: "Choose admin, manager, or user." });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found." });
    if (target._id.equals(req.user._id) && role !== "admin") {
      return res.status(400).json({ message: "You can't remove your own administrator role." });
    }
    if (target.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) return res.status(400).json({ message: "The last administrator can't be demoted." });
    }
    target.role = role;
    await target.save();
    return res.json({ user: publicUser(target) });
  } catch (error) {
    return next(error);
  }
};
