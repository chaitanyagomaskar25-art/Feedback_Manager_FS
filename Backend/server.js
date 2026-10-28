import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDb } from './src/config/db.js'
import { router as feedbackRouter } from './src/routes/feedbackRoute.js'
import { authRouter } from './src/routes/authRoute.js'
const app = express()
dotenv.config()

app.use(express.json({ limit: '20kb' }))

app.use(cors({
    origin: process.env.FRONTEND_ORIGIN?.split(',').map((origin) => origin.trim()) || true,
}))

app.get("/", (req, res) => {
    res.json({ message: "Feedback Manager API is running." })
});

app.use(async (req, res, next) => {
    if (process.env.NODE_ENV === 'test') return next()
    try {
        await connectDb()
        return next()
    } catch (error) {
        return next(error)
    }
})

app.use("/auth", authRouter)
app.use("/feedback", feedbackRouter)

app.use((error, req, res, next) => {
    console.error("API request failed:", error.message)
    if (res.headersSent) return next(error)
    return res.status(500).json({ message: "An unexpected server error occurred." })
})

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    connectDb()
        .then(() => app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running on port ${process.env.PORT || 5000}.`)
        }))
        .catch((error) => {
            console.error("Server could not connect to MongoDB:", error.message)
            process.exitCode = 1
        })
}

export default app;