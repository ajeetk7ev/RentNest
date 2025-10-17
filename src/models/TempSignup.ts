// models/TempSignup.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITempSignup extends Document {
  identifier: string; // email or phone
  otp: string;
  expiresAt: Date;
  userData: {
    firstname: string;
    lastname: string;
    email?: string;
    phone?: string;
  };
}

const tempSignupSchema = new Schema<ITempSignup>({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  userData: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
  },
});


export default mongoose.model<ITempSignup>("TempSignup", tempSignupSchema);
