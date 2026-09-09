import mongoose from "mongoose";

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("Mongo Db conected properly")
    } catch (error) {
        console.log("Mongo Db connection fail",error)
    }
} 