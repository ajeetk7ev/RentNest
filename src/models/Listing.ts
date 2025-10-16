import mongoose, { Document, Schema } from "mongoose";

export interface IListing extends Document {
  title: string;
  description: string;
  city: string;
  address: string;
  price: number;
  type: "room" | "flat" | "pg";
  furnished: boolean;
  images: string[];
  available: boolean;
  ownerId: mongoose.Types.ObjectId; 
  createdAt?: Date;
  updatedAt?: Date;
}


const listingSchema = new Schema<IListing>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["room", "flat", "pg"],
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    available: {
      type: Boolean,
      default: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);


const Listing = mongoose.model<IListing>("Listing", listingSchema);

export default Listing;
