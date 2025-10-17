import express from "express";
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./config/db";
import authRoutes from './routes/auth.routes'

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use("/api/auth", authRoutes);

app.listen(PORT, async() => {
  await dbConnect();
  console.log(`Server is running at port ${PORT}`);
});
