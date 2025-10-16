import express from "express";
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./config/db";

const app = express();

app.listen(3000, async() => {
  await dbConnect();
  console.log("Server is running at port 3000");
});
