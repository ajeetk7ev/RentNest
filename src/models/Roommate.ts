import mongoose, { Document, Schema } from "mongoose";

export interface IRoommate extends Document {
  userId: mongoose.Types.ObjectId; 
  title: string;
  age: number;
  gender: "male" | "female" | "other";
  occupation: string;
  city: string;
  budget: number;
  description?: string;
  preferences: string[];
  images: string[];
  createdAt?: Date;
}

const roommateSchema = new Schema<IRoommate>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: [16, "Age must be at least 16"],
      max: [100, "Age must be below 100"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    budget: {
      type: Number,
      required: true,
      min: [0, "Budget must be positive"],
    },
    description: {
      type: String,
      trim: true,
    },
    preferences: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps:true
  }
);

const Roommate = mongoose.model<IRoommate>("Roommate", roommateSchema);

export default Roommate;
