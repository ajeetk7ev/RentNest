import otpGenerator from "otp-generator";
import { sendSms } from "../utils/smsSender";
import TempSignup from "../models/TempSignup";
import { Request, Response } from "express";
import { sendOtpVerificationEmail } from "../utils/mailSender";
import User from "../models/User";
import jwt from "jsonwebtoken";
import Otp from "../models/Otp";

// Simple email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple phone regex (E.164 format, e.g., +919876543210)
const phoneRegex = /^\+[1-9]\d{9,14}$/;

export const signup = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, phone } = req.body;

    if (!firstname || !lastname) {
      return res
        .status(400)
        .json({ error: "First name and last name are required." });
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
      return res.status(400).json({
        error:
          "Invalid phone number format",
      });
    }

    const identifier = email || phone;

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Save temp signup data
    await TempSignup.create({
      identifier,
      otp,
      expiresAt,
      userData: { firstname, lastname, email, phone },
    });

    let isSent = false;

    if (email) {
      isSent = await sendOtpVerificationEmail(email, otp);
    } else if (phone) {
      isSent = await sendSms(phone, `Your OTP for RentNest is ${otp}`);
    }

    if (!isSent) {
      await TempSignup.deleteOne({ identifier });
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: email ? "OTP sent to your email." : "OTP sent to your phone.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to send OTP." });
  }
};

export const verifySignupOtp = async (req: Request, res: Response) => {
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
    console.log("user data is ", userData);
    const user = await User.create({ ...userData, verified: true });

    // Delete temp record
    await TempSignup.deleteOne({ _id: temp._id });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.json({ success: true, message: "User verified", token, user });
  } catch (error) {
    console.error("Failed to verify otp", error);
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { identifier } = req.body;

    // ✅ 1. Validate identifier
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Phone or email is required.",
      });
    }

    // Validate email or phone format first
    if (identifier.includes("@")) {
      if (!emailRegex.test(identifier)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format.",
        });
      }
    } else {
      if (!phoneRegex.test(identifier)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format.",
        });
      }
    }

    // ✅ 2. Check if user exists
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please sign up first.",
      });
    }

    // ✅ 3. Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ 4. Remove old OTPs for same user
    await Otp.deleteMany({ identifier });

    // ✅ 5. Save OTP
    await Otp.create({ identifier, otp, expiresAt });

    // ✅ 6. Send OTP (email or SMS)
    let isSent = false;

    if (identifier.includes("@")) {
      isSent = await sendOtpVerificationEmail(identifier, otp);
    } else {
      isSent = await sendSms(identifier, `Your OTP for RentNest is ${otp}`);
    }

    // ✅ 8. Handle send failure
    if (!isSent) {
      await Otp.deleteOne({ identifier, otp }); // cleanup
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login OTP sent successfully.",
    });
  } catch (error) {
    console.error("Failed to signin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing signin.",
    });
  }
};

export const verifySigninOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, otp } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.",
      });
    }

    const storedOtp = await Otp.findOne({ identifier, otp });

    if (!storedOtp || storedOtp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Otp is expired.",
      });
    }

    await Otp.deleteOne({ identifier, otp });

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      user,
      token,
      success: true,
      message: "OTP verified.",
    });
  } catch (error) {
    console.log("Failed to verify signin otp ", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
