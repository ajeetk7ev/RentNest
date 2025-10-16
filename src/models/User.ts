import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  contactNo?: string;
  image?: string; 
  resetPasswordToken?: string | null;
  resetPasswordExpire?: Date | null;
  listings?:mongoose.Types.ObjectId[]
}

const userSchema = new Schema<IUser>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contactNo: { type: String, default: "" },
    image: { type: String, default: "" }, 
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpire: { type: Date, default: null },
    listings:[{
        type:Schema.Types.ObjectId,
        ref:"Listing"
    }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);