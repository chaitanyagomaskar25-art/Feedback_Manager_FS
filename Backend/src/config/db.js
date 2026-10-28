import mongoose from "mongoose";

let connectionPromise;

export const connectDb = async () => {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (connectionPromise) return connectionPromise;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not configured.");
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI)
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });

  try {
    await connectionPromise;
    console.log("MongoDB connected successfully");
    return mongoose;
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);
    throw error;
  }
};