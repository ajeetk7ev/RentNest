import { Router } from "express";
import { signin, signup, verifySigninOtp, verifySignupOtp } from "../controllers/auth.controller";
const router = Router();


router.post("/signup", signup);
router.post("signin", signin);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/verify-signin-otp", verifySigninOtp)


export default router;