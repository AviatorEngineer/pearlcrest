import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';

export default function ForgotPass() {
    const [showPassword, setShowPassword] = useState(false);
    const [flatNumber, setFlatNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false); // State for loading spinner
    const [otpSent, setOtpSent] = useState(false); // Track if OTP has been sent

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getOtp = async() => {
        if (!flatNumber.trim()) {
            Swal.fire({
                title: 'Flat Number Required',
                text: 'Please enter your flat number',
                icon: 'error',
                showConfirmButton: true
            });
            return;
        }
        
        setLoading(true); // Set loading state to true
        try {
            const response = await axios.post("/api/v1/users/forgot-password-otp", {
                flatnumber: flatNumber
            });
            console.log(response);
            Swal.fire({
                title: 'OTP SENT',
                text: "OTP sent to owner's and renter's email address. Check in your spam folders. It is valid for 5 minutes only.",
                icon: 'success',
                showConfirmButton: true
            });
            setOtpSent(true); // Enable password reset fields
        } catch (error) {
            console.log(error);
            Swal.fire({
                title: "Something went wrong",
                text: error?.response?.data?.message || "Failed to send OTP",
                icon: 'error',
                showConfirmButton: true
            });
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    const resetPassword = async() => {
        if (confirmNewPassword !== newPassword) {
            Swal.fire({
                title: 'Passwords not match',
                text: 'Please reconfirm password',
                icon: 'error',
                showConfirmButton: true
            });
            return;
        }
        
        if (!otp.trim()) {
            Swal.fire({
                title: 'OTP Required',
                text: 'Please enter the OTP sent to your email',
                icon: 'error',
                showConfirmButton: true
            });
            return;
        }
        
        setLoading(true); // Set loading state to true
        try {
            const response = await axios.post("api/v1/users/reset-password", {
                flatnumber: flatNumber,
                newpassword: newPassword,
                otp
            });
            const status = response.data.status;
            const message = response.data.message;
            let icon;
            if (status === "Pending") icon = "Warning";
            else if (status === "Verified" || status === "Success") icon = "Success";
            console.log(status);
            console.log(message);
            Swal.fire({
                title: status.toString(),
                text: message.toString(),
                icon: icon,
                showConfirmButton: true
            });
            setTimeout(() => {
                setConfirmNewPassword('');
                setFlatNumber('');
                setNewPassword('');
                setOtp('');
                setShowPassword('');
                setOtpSent(false);
                window.location.href = '/log';
            }, 1500);
        } catch (error) {
            Swal.fire({
                title: 'Something went wrong',
                text: error?.response?.data?.message || error.message,
                icon: 'error',
                showConfirmButton: true
            });
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row items-stretch">
            <div className="relative w-full md:w-1/2 flex-shrink-0 hidden md:block">
                <img
                    src="/static/images/PC2.jpg"
                    className="w-full h-full object-cover"
                    alt="Background"
                />
            </div>
            <div className="w-full bg-white p-6 md:p-20 justify-between">
                <h3 className="text-xl text-black font-semibold">Pearl Crest</h3>

                <div className="w-full flex flex-col max-w-[500px]">
                    <div className="flex flex-col w-full mb-5">
                        <h3 className="text-3xl font-semibold mb-4">Forgot Password</h3>
                        <p className="text-base mb-2">Enter your flat number to reset your password.</p>
                    </div>
                    
                    {!otpSent ? (
                        <>
                            <input
                                type="text"
                                placeholder="Flat Number"
                                value={flatNumber}
                                onChange={(e) => setFlatNumber(e.target.value)}
                                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                            />
                            <div className="w-full flex flex-col my-4">
                                <button
                                    className={`bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={getOtp}
                                    disabled={loading} // Disable button while loading
                                >
                                    {loading ? (
                                        <ClipLoader color={"#ffffff"} loading={true} size={20} />
                                    ) : (
                                        "Send OTP"
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                />
                                <button
                                    className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? "Hide" : "Show"} Password
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                />
                                <button
                                    className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? "Hide" : "Show"} Password
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    placeholder="OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                                />
                            </div>
                            <div className="w-full flex flex-col my-4">
                                <button
                                    className={`bg-black text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:bg-black/90 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={resetPassword}
                                    disabled={loading} // Disable button while loading
                                >
                                    {loading ? (
                                        <ClipLoader color={"#ffffff"} loading={true} size={20} />
                                    ) : (
                                        "Reset Password"
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                    <div className="w-full flex items-center justify-between">
                        <Link to="/log">
                            <p className="text-sm cursor-pointer underline underline-offset-2 font-medium whitespace-nowrap">
                                Back To Login
                            </p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
