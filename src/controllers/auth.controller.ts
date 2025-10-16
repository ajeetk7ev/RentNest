import otpGenerator from "otp-generator";
import { sendSms } from "../utils/smsSender";
import TempSignup from "../models/TempSignup";
import { Request, Response } from "express";
import { sendOtpVerificationEmail } from "../utils/mailSender";
import User from "../models/User";
import jwt from 'jsonwebtoken'

// Simple email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple phone regex (E.164 format, e.g., +919876543210)
const phoneRegex = /^\+[1-9]\d{9,14}$/;

export const signup = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: "First name and last name are required." });
    }

    if (!email && !phone) {
      return res.status(400).json({ error: "Email or phone required." });
    }

    // Validate email if provided
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Validate phone if provided
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format. Include country code, e.g., +919876543210" });
    }

    const identifier = email || phone;

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save temp signup data
    await TempSignup.findOneAndUpdate(
      { identifier },
      { identifier, otp, expiresAt, userData: { firstName, lastName, email, phone } },
      { upsert: true }
    );

    // Send OTP
    if (email) {
      await sendOtpVerificationEmail(email, otp);
    } else if (phone) {
      await sendSms(phone, `Your OTP for RentNest is ${otp}`);
    }

    res.json({ success: true, message: "OTP sent. Please verify to complete signup." });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};


export const verifySignupOtp = async (req:Request, res:Response) => {
  try {
    const { identifier, otp } = req.body;

    const temp = await TempSignup.findOne({ identifier, otp });
    if (!temp) return res.status(400).json({ error: "Invalid OTP" });

    if (temp.expiresAt < new Date()) {
      await TempSignup.deleteOne({ _id: temp._id });
      return res.status(400).json({ error: "OTP expired" });
    }

    // Save user permanently
    const { userData } = temp;
    const user = await User.create({ ...userData, verified: true });

    // Delete temp record
    await TempSignup.deleteOne({ _id: temp._id });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.json({success:true, message:"User verified", token, user });
  } catch (error) {
    console.error("Failed to verify otp", error);
    res.status(500).json({success:false,  message: "OTP verification failed"});
  }
};

