import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email?: string;
  phone?: string;
  image?: string; 
  verified:boolean;
  listings?:mongoose.Types.ObjectId[]
  roommates?:mongoose.Types.ObjectId[]
}

const userSchema = new Schema<IUser>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, unique: true },
    phone: { type: String, unique: true},
    image: { type: String, default: "" }, 
    verified:{type:Boolean, default:false},
    listings:[{
        type:Schema.Types.ObjectId,
        ref:"Listing"
    }],
    roommates:[{
        type:Schema.Types.ObjectId,
        ref:"Roommate"
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);