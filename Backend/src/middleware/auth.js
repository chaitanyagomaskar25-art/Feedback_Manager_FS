import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(401).json({ message: "Please sign in to continue." });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: "Authentication is not configured." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== "object" || !payload.sub) {
      return res.status(401).json({ message: "Your session is invalid. Please sign in again." });
    }

    const user = await User.findById(payload.sub).select("_id name email role");
    if (!user) {
      return res.status(401).json({ message: "Your account is no longer available." });
    }
    req.user = user;
    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }
    return next(error);
  }
};

export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You don't have permission to do that." });
  }
  return next();
};
