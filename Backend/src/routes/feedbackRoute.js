import express from 'express'
import { createFeedback, deleteFeedback, getFeedback } from '../controllers/Feedback.js'

export const router = express.Router()

router.post("/", createFeedback)
router.get("/", getFeedback)
router.delete("/:id", deleteFeedback)