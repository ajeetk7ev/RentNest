import mongoose from "mongoose";


const dbConnect = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        console.log("DB Connected Successfully!")
    } catch (error) {
        console.log("Failed to connect db", error);
        process.exit(1);
    }
}

export default dbConnect;