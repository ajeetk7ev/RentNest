// models/TempSignup.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ITempSignup extends Document {
  identifier: string; // email or phone
  otp: string;
  expiresAt: Date;
  userData: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

const tempSignupSchema = new Schema<ITempSignup>({
  identifier: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  userData: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
  },
});

tempSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ITempSignup>("TempSignup", tempSignupSchema);
