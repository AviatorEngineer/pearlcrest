import {Router} from "express"
const router = Router();
import { adminresetpassword, changepassword, displayFlats, getCurrentUser, loginFlat, logoutUser, registerFlat, registerFlatbyAdmin, sendOtpVerificationEmail, forgotPasswordOtp, resetPassword, sendPasswordResetLink, verifyPasswordResetToken, completePasswordReset } from "../controllers/flat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"
router.route("/register").post(registerFlat)
router.route("/admin-reset-password").patch(adminresetpassword)
router.route("/login").post(loginFlat)
router.route("/display-flat").get(displayFlats)
router.route("/get-current-user").get(verifyJWT, getCurrentUser)
router.route("/logout-user").get(verifyJWT, logoutUser)
router.route("/send-otp").post(sendOtpVerificationEmail)
router.route("/change-password").post(changepassword)
router.route("/forgot-password-otp").post(forgotPasswordOtp)
router.route("/reset-password").post(resetPassword)
router.route("/send-password-reset-link").post(sendPasswordResetLink)
router.route("/verify-reset-token/:token").get(verifyPasswordResetToken)
router.route("/complete-password-reset").post(completePasswordReset)
router.route("/reg").post(registerFlatbyAdmin)

export default router