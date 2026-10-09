import { Router } from "express";
import { OtpController } from "./otp.controller.js";
import validateRequest from "../../middleware/validateRequest.js";
import { OtpValidation } from "./otp.validation.js";
import { rateLimitMiddleware } from "../../middleware/rateLimitMiddleware.js";

const router = Router();
router.post("/send", validateRequest(OtpValidation.sendOtpSchema), OtpController.sendOtp);
router.post("/verify", rateLimitMiddleware, validateRequest(OtpValidation.verifyOtpSchema), OtpController.verifyOtp);

export const OtpRouter = router;