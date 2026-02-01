import {asyncHandler} from "../utils/asynchandler.js"
import {Flat} from "../models/flats.model.js"
import otpverification from "../models/otpverification.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Owner} from "../models/owners.model.js"
import {Renter} from "../models/renters.model.js"
import {ApiError} from "../utils/ApiError.js"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import crypto from "crypto"
import { PasswordResetToken } from "../models/passwordResetToken.model.js"
// for admin to create flat database
// nodemailer stuff

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASSWORD
    }
});
const registerFlat = asyncHandler(async (req, res) => {
    try {
        const flatdet = req.body;
        for (const flat of flatdet) {
            const { flatnumber, currentstay, password, position } = flat;
            console.log(flatnumber, " ", currentstay, " ", password, " ", position);
            if ([flatnumber, currentstay, password, position].some((field) => !field || field.trim() === "")) {
                throw new ApiError(401, "All fields are required");
            }
            const existingFlat = await Flat.findOne({flatnumber});
            console.log(existingFlat);
            if (existingFlat) {
                throw new ApiError(409, "Flat already exists");
            }
            const createdFlat = await Flat.create({
                flatnumber: flatnumber.toUpperCase(),
                password,
                currentstay,
                position
            });
            console.log(createdFlat);
            if (!createdFlat) {
                throw new ApiError(500, "Something went wrong while registering flat");
            }
        }
        return res.status(200).json(new ApiResponse(200, "Flats registered successfully"));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(new ApiResponse(error.status || 500, error.message || "Internal Server Error"));
    }
});
const registerFlatbyAdmin = asyncHandler(async (req, res) => {
    try {
        const { flatnumber, currentstay, password, position } = req.body;
        console.log(flatnumber)
        // Validate all required fields
        if (![flatnumber, currentstay, password, position].every(field => field && field.trim() !== "")) {
            throw new ApiError(401, "All fields are required");
        }

        // Check if the flat already exists
        const existingFlat = await Flat.findOne({ flatnumber });
        if (existingFlat) {
            throw new ApiError(409, "Flat already exists");
        }

        // Create the new flat
        const createdFlat = await Flat.create({
            flatnumber: flatnumber.toUpperCase(),
            password,
            currentstay,
            position
        });

        // Check if flat creation was successful
        if (!createdFlat) {
            throw new ApiError(500, "Something went wrong while registering flat");
        }

        // Respond with success
        return res.status(200).json(new ApiResponse(200, "Flat registered successfully"));
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json(new ApiResponse(error.status || 500, error.message || "Internal Server Error"));
    }
});

// for admin to reset password with a click if owner changes
const adminresetpassword = asyncHandler(async(req, res) => {
    const {flatnumber} = req.body
    // pass flatnumber as value selection from frontend
    const flat = await Flat.findOne({flatnumber})
    if(!flat){
        throw new ApiError(409, "Flatnumber is wrong or Flat not exists")
    }
    flat.password = flatnumber
    await flat.save({validateBeforeSave: false})
    res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset done"))
})
//to generate tokens
const generateAccessandRefreshTokens = asyncHandler(async(flatId) => {
    try {
        const flat = await Flat.findById(flatId)
        const accessToken = await flat.generateAccessToken()
        const refreshToken = await flat.generateRefreshToken()
        flat.refreshToken = refreshToken
        flat.lastLogIn = new Date()
        await flat.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
})
// for log in of flatier

const loginFlat = asyncHandler(async (req, res) => {
    console.log("hello")
    const {flatnumber, password} = req.body
    if([flatnumber, password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "flatnumber or password is missing")
    }
    const flat = await Flat.findOne({flatnumber})
    if(!flat){
        throw new ApiError(404, "flatnumber is invalid or not exists")
    }
    console.log(flat.password)
    const isPasswordCorrect = await bcrypt.compare(password, flat.password)
    console.log(isPasswordCorrect)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid Password")
    }
    const setLoginTime = await Flat.updateOne(
        {flatnumber},
        {$set: { $lastLogIn: new Date() }}
    )
    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(flat._id)
    const loggedInFlat = await Flat.findById(flat._id).select("-password -refreshToken")
    const options= {  
        httpOnly:true,
        secure: true,
        sameSite: 'none' 
    }
    return res
    .status(200)  
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                flat: loggedInFlat, accessToken, refreshToken
            },
            "Flat logged in successfully"
        )
    )
})
// to display all flat data with last login details and password reset button
const displayFlats = asyncHandler(async (req, res) => {
    const flats = await Flat.find().select("-password -_id -refreshToken")
    res
    .status(200)
    .json(new ApiResponse(200, {flats}, "Flats details displayed"))
})
//to get current user
const getCurrentUser = asyncHandler(async(req, res) => {
    const flatid = req?.flat?._id
    if(!flatid) throw new ApiError(401, "User not logged in")
    // console.log(flatid)
    const flat = await Flat.findById({_id: flatid})
    return res
    .status(200)
    .json(
        new ApiResponse(200, flat, "current user fetched successfully")
    )
})
// logout user
const logoutUser = asyncHandler( async(req, res) => {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.json(new ApiResponse(200, "user logged out successfully"))
})

const sendOtpVerificationEmail = asyncHandler(async(req, res) => {
    const {flatnumber, oldpassword} = req.body;
    const flat = await Flat.findOne({flatnumber});
    if(!flat){
        throw new ApiError(404, "Flat Number is invalid")
    }
    const isPasswordCorrect = await bcrypt.compare(oldpassword, flat?.password)
    console.log(isPasswordCorrect)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Incorrect password")
    }
    const flatid = flat?._id;
    const owner = await Owner.findOne({flat: {$in: flatid}})
    const renter = await Renter.findOne({flat: {$in: flatid}})
    const otp = `${Math.floor(Math.random()*9000+1000)}`
    const owneremail = owner?.email
    const renteremail = renter?.email
    const mailOptions = {
        from: '"Pearl Crest Society" <pearlcrestsociety@gmail.com>',
        to: [owneremail, renteremail],
        subject: "Verify Your Account",
        html: `<h3>From Mr. Manish, The Treasurer on behalf of Pearl Crest Flat Owner's Society.</h3><p>Thank you for trusting Pearl Crest Society. Enter <b>${otp}</b> in the website to verify your account</p>
        <p>This code <b>expires in 5 minutes</b>.</p>`
    }
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds)
    const response = await otpverification.create({
        userId: flatid,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 360000
    })
    const info = await transporter.sendMail(mailOptions)
    return res.status(200).json({
        status: "PENDING",
        info,
        message: "Verification otp email sent",
        data: {
            userId: flatid,
            owneremail
        }
    })
})
const changepassword = asyncHandler(async(req, res) => {
    try {
        const {flatnumber, otp, newpassword} = req.body
        if(!flatnumber || !otp || !newpassword)
            throw new ApiError(400, "enter all fields")
        const flat = await Flat.findOne({flatnumber})
        console.log(flat)
        const flatid = flat?._id
        const otpverify = await otpverification.find({
            userId: flatid,
        })
        console.log(otpverify)
        if(otpverify.length<=0){
            throw new ApiError(401, "Account record doesn't exist or has been verified already. please login")
        }
        const {expiresAt} = otpverify[0]
        const hashedOTP = otpverify[0].otp
        if(expiresAt < Date.now()){
            await otpverification.deleteMany({userId: flatid})
            throw new ApiError(400, "Code has expired. Please request again")
        }
        else{
            const validOTP= bcrypt.compare(otp, hashedOTP)
            console.log(validOTP)
            if(!validOTP){
                throw new ApiError("Invalid code. Check your Inbox")
            }
            else {
                const savepass = await bcrypt.hash(newpassword, 10);
                const response = await Flat.updateOne({_id: flatid}, {$set: {password: savepass}})
                await otpverification.deleteMany({userId: flatid})
                return res.json({
                    status: "Verified",
                    message: "user email verified successfully",
                    response
                })
            }
        }
    } catch (error) {
        res.json({
            status: "Failed",
            message: error.message
        })
    }
})

// Forgot Password - Send OTP without old password requirement
const forgotPasswordOtp = asyncHandler(async(req, res) => {
    const {flatnumber} = req.body;
    if(!flatnumber){
        throw new ApiError(400, "Flat number is required")
    }
    const flat = await Flat.findOne({flatnumber});
    if(!flat){
        throw new ApiError(404, "Flat Number is invalid")
    }
    const flatid = flat?._id;
    const owner = await Owner.findOne({flat: {$in: flatid}})
    const renter = await Renter.findOne({flat: {$in: flatid}})
    const otp = `${Math.floor(Math.random()*9000+1000)}`
    const owneremail = owner?.email
    const renteremail = renter?.email
    const mailOptions = {
        from: '"Pearl Crest Society" <pearlcrestsociety@gmail.com>',
        to: [owneremail, renteremail],
        subject: "Password Reset OTP - Pearl Crest Society",
        html: `<h3>From Mr. Manish, The Treasurer on behalf of Pearl Crest Flat Owner's Society.</h3><p>You requested a password reset for your Pearl Crest Society account. Enter <b>${otp}</b> on the website to reset your password</p>
        <p>This code <b>expires in 5 minutes</b>.</p>
        <p>If you did not request this, please ignore this email.</p>`
    }
    const saltRounds = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRounds)
    const response = await otpverification.create({
        userId: flatid,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 360000
    })
    const info = await transporter.sendMail(mailOptions)
    return res.status(200).json({
        status: "PENDING",
        info,
        message: "OTP sent to registered email addresses",
        data: {
            userId: flatid,
            owneremail
        }
    })
})

// Reset Password - Verify OTP and update password
const resetPassword = asyncHandler(async(req, res) => {
    try {
        const {flatnumber, otp, newpassword} = req.body
        if(!flatnumber || !otp || !newpassword)
            throw new ApiError(400, "All fields are required")
        const flat = await Flat.findOne({flatnumber})
        if(!flat) {
            throw new ApiError(404, "Flat not found")
        }
        const flatid = flat?._id
        const otpverify = await otpverification.find({
            userId: flatid,
        })
        if(otpverify.length<=0){
            throw new ApiError(401, "No OTP request found. Please request OTP again")
        }
        const {expiresAt} = otpverify[0]
        const hashedOTP = otpverify[0].otp
        if(expiresAt < Date.now()){
            await otpverification.deleteMany({userId: flatid})
            throw new ApiError(400, "OTP has expired. Please request a new one")
        }
        const validOTP = await bcrypt.compare(otp, hashedOTP)
        if(!validOTP){
            throw new ApiError(401, "Invalid OTP. Please check and try again")
        }
        const savepass = await bcrypt.hash(newpassword, 10);
        const response = await Flat.updateOne({_id: flatid}, {$set: {password: savepass}})
        await otpverification.deleteMany({userId: flatid})
        return res.json({
            status: "Success",
            message: "Password reset successfully",
            response
        })
    } catch (error) {
        res.status(error.status || 500).json({
            status: "Failed",
            message: error.message
        })
    }
})

// Admin send password reset link via email
const sendPasswordResetLink = asyncHandler(async(req, res) => {
    try {
        const {email, flatnumber} = req.body
        
        if(!email || !flatnumber) {
            throw new ApiError(400, "Email and flat number are required")
        }

        const flat = await Flat.findOne({flatnumber: flatnumber.toUpperCase()})
        if(!flat) {
            throw new ApiError(404, "Flat not found")
        }

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Save token to database
        const passwordResetToken = await PasswordResetToken.create({
            flatId: flat._id,
            flatnumber: flat.flatnumber,
            email: email,
            token: resetToken,
            expiresAt: expiresAt
        })

        // Generate reset link
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`

        // Send email with reset link
        const mailOptions = {
            from: '"Pearl Crest Society" <pearlcrestsociety@gmail.com>',
            to: email,
            subject: "Password Reset Link - Pearl Crest Society",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello Resident,</p>
                    <p>A password reset request has been initiated for Flat <strong>${flat.flatnumber}</strong>.</p>
                    <p style="color: #666; font-size: 14px;">This link is valid for <strong>5 minutes only</strong>.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #d32f2f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy this link:</p>
                    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">
                        ${resetLink}
                    </p>
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        If you did not request this, please ignore this email. The link will expire in 5 minutes.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px;">
                        <strong>Pearl Crest Flat Owners Society</strong><br>
                        Argora, Pundag Road, Ranchi - 834002
                    </p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        return res.status(200).json(new ApiResponse(
            200,
            {
                message: "Password reset link sent successfully",
                email: email,
                flatnumber: flat.flatnumber,
                expiresAt: expiresAt
            },
            "Password reset link has been sent"
        ))
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json(new ApiError(error.status || 500, error.message || "Failed to send reset link"))
    }
})

// Verify and use password reset token
const verifyPasswordResetToken = asyncHandler(async(req, res) => {
    try {
        const {token} = req.params
        
        if(!token) {
            throw new ApiError(400, "Reset token is required")
        }

        // Find and verify token
        const resetToken = await PasswordResetToken.findOne({
            token: token,
            used: false,
            expiresAt: {$gt: new Date()}
        })

        if(!resetToken) {
            throw new ApiError(400, "Invalid or expired reset token")
        }

        return res.status(200).json(new ApiResponse(
            200,
            {
                flatnumber: resetToken.flatnumber,
                token: token
            },
            "Token is valid"
        ))
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json(new ApiError(error.status || 500, error.message || "Token verification failed"))
    }
})

// Complete password reset with token
const completePasswordReset = asyncHandler(async(req, res) => {
    try {
        const {token, newPassword} = req.body
        
        if(!token || !newPassword) {
            throw new ApiError(400, "Token and new password are required")
        }

        // Find and verify token
        const resetToken = await PasswordResetToken.findOne({
            token: token,
            used: false,
            expiresAt: {$gt: new Date()}
        })

        if(!resetToken) {
            throw new ApiError(400, "Invalid or expired reset token")
        }

        // Update password
        const flat = await Flat.findById(resetToken.flatId)
        if(!flat) {
            throw new ApiError(404, "Flat not found")
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await Flat.updateOne(
            {_id: resetToken.flatId},
            {$set: {password: hashedPassword}}
        )

        // Mark token as used
        await PasswordResetToken.updateOne(
            {_id: resetToken._id},
            {$set: {used: true}}
        )

        return res.status(200).json(new ApiResponse(
            200,
            {},
            "Password has been reset successfully"
        ))
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json(new ApiError(error.status || 500, error.message || "Password reset failed"))
    }
})

export {registerFlat, adminresetpassword, loginFlat, displayFlats, getCurrentUser, registerFlatbyAdmin, logoutUser, sendOtpVerificationEmail, changepassword, forgotPasswordOtp, resetPassword, sendPasswordResetLink, verifyPasswordResetToken, completePasswordReset}