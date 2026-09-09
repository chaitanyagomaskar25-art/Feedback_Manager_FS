import { Feedback } from "../models/FeedbackModel.js"

export const createFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.create({
            name: req.body.name, 
            comment: req.body.comment,
            rating: req.body.rating
        })
        res.status(201).json(feedback)
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "success"
        })
    }
}


export const getFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
        res.status(200).json(feedbacks)
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: "Failed"
        })
    }
}

export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params

        console.log(id)
        const feedback = await Feedback.deleteOne({_id: id})
        if(feedback.deletedCount ===0){
            return res.status(404).json({
                message: "Feedback not found",
                status: "failed"
            })
        }
       return res.status(200).json({message: "Feedback deleted successfully", ...feedback})
    } catch (error) {
                return res.status(500).json({ message: "Server error", error: error.message })

    }
}