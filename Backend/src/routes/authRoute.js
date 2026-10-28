import express from "express";
import {
  getCurrentUser,
  listUsers,
  login,
  register,
  setupFirstAdmin,
  updateUserRole,
} from "../controllers/Auth.js";
import { authenticate, requireRoles } from "../middleware/auth.js";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/setup-admin", setupFirstAdmin);
authRouter.get("/me", authenticate, getCurrentUser);
authRouter.get("/users", authenticate, requireRoles("admin"), listUsers);
authRouter.patch("/users/:id/role", authenticate, requireRoles("admin"), updateUserRole);
