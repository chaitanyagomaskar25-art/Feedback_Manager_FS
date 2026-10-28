import express from "express";
import {
  createFeedback,
  deleteFeedback,
  getDashboard,
  getFeedback,
  updateFeedback,
} from "../controllers/Feedback.js";
import { authenticate } from "../middleware/auth.js";

export const router = express.Router();

router.use(authenticate);
router.get("/dashboard", getDashboard);
router.post("/", createFeedback);
router.get("/", getFeedback);
router.patch("/:id", updateFeedback);
router.delete("/:id", deleteFeedback);
