import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDb } from './src/config/db.js'
import { router as feedbackRouter } from './src/routes/feedbackRoute.js'
const app = express()
dotenv.config()

app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use("/feedback",feedbackRouter)

connectDb()

app.listen(5000, ()=>{
    console.log("Server is runnig......")
})