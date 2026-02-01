import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

export default function ResetPasswordLink() {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);
    const [flatNumber, setFlatNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

    // Verify token on component mount
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response = await axios.get(`/api/v1/users/verify-reset-token/${token}`);
                setFlatNumber(response.data.data.flatnumber);
                setTokenValid(true);
            } catch (error) {
                console.error('Token verification failed:', error);
                Swal.fire({
                    title: 'Invalid or Expired Link',
                    text: 'This password reset link is invalid or has expired. Please request a new link from the admin.',
                    icon: 'error',
                    confirmButtonText: 'Go Back'
                }).then(() => {
                    navigate('/');
                });
                setTokenValid(false);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token, navigate]);

    // Countdown timer
    useEffect(() => {
        if (!tokenValid) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    Swal.fire({
                        title: 'Link Expired',
                        text: 'Your password reset link has expired. Please request a new one.',
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        navigate('/');
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [tokenValid, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleResetPassword = async () => {
        if (!newPassword.trim()) {
            Swal.fire({
                title: 'Password Required',
                text: 'Please enter a new password',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (newPassword.length < 6) {
            Swal.fire({
                title: 'Password Too Short',
                text: 'Password must be at least 6 characters long',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: 'Passwords Do Not Match',
                text: 'Please make sure both passwords are the same',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        setVerifying(true);
        try {
            const response = await axios.post('/api/v1/users/complete-password-reset', {
                token,
                newPassword
            });

            Swal.fire({
                title: 'Success!',
                text: 'Your password has been reset successfully. You can now login with your new password.',
                icon: 'success',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                navigate('/log');
            });
        } catch (error) {
            console.error('Password reset failed:', error);
            Swal.fire({
                title: 'Reset Failed',
                text: error?.response?.data?.message || 'Failed to reset password. Please try again.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setVerifying(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <ClipLoader color="#3B82F6" size={50} />
                    <p className="mt-4 text-gray-600">Verifying your reset link...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return null; // Redirect handled in useEffect
    }

    const isTokenExpiring = timeRemaining < 60;
    const isTokenExpired = timeRemaining <= 0;

    return (
        <div className="w-full min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Left Side - Image */}
            <div className="relative w-full md:w-1/2 flex-shrink-0 hidden md:flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 p-8">
                <div className="text-center text-white max-w-md">
                    <FiLock className="w-16 h-16 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-4">Secure Password Reset</h2>
                    <p className="text-blue-100 mb-6">
                        Create a new password for your Pearl Crest Society account
                    </p>
                    <div className="bg-white/20 backdrop-blur p-4 rounded-lg">
                        <p className="text-sm text-blue-100">
                            This reset link is valid for a limited time only. Please complete the process as soon as possible.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-600 mb-6">Enter your new password below</p>

                    {/* Flat Number Display */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-xs text-gray-600 mb-1">Flat Number</p>
                        <p className="text-lg font-semibold text-blue-900">{flatNumber}</p>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center justify-between p-3 rounded-lg mb-6 ${
                        isTokenExpired ? 'bg-red-50 border border-red-200' : isTokenExpiring ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
                    }`}>
                        <div className="flex items-center gap-2">
                            <FiClock className={isTokenExpired ? 'text-red-600' : isTokenExpiring ? 'text-yellow-600' : 'text-green-600'} />
                            <span className={`text-sm font-medium ${isTokenExpired ? 'text-red-900' : isTokenExpiring ? 'text-yellow-900' : 'text-green-900'}`}>
                                Link expires in: <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                            </span>
                        </div>
                        {isTokenExpiring && (
                            <span className="text-xs text-yellow-700 font-semibold">Hurry!</span>
                        )}
                    </div>

                    {isTokenExpired ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                            <FiXCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                            <h3 className="font-semibold text-red-900 mb-1">Link Expired</h3>
                            <p className="text-sm text-red-700">
                                Your password reset link has expired. Please request a new one from the admin.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleResetPassword();
                            }}
                            className="space-y-4"
                        >
                            {/* New Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimum 6 characters
                                </p>
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button
                                        type="button"
                                        onClick={toggleConfirmPasswordVisibility}
                                        className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className={`flex items-center gap-2 p-2 rounded text-sm ${
                                    newPassword === confirmPassword
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                }`}>
                                    {newPassword === confirmPassword ? (
                                        <>
                                            <FiCheckCircle size={16} />
                                            Passwords match
                                        </>
                                    ) : (
                                        <>
                                            <FiXCircle size={16} />
                                            Passwords do not match
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={verifying || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                className={`w-full py-2 rounded-lg font-medium text-white flex items-center justify-center transition-colors duration-200 ${
                                    verifying || !newPassword || !confirmPassword || newPassword !== confirmPassword
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {verifying ? (
                                    <>
                                        <ClipLoader color="#ffffff" size={18} className="mr-2" />
                                        Resetting Password...
                                    </>
                                ) : (
                                    <>
                                        <FiLock className="mr-2" size={18} />
                                        Reset Password
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    <p className="text-xs text-gray-500 text-center mt-6">
                        Pearl Crest Flat Owners Society
                    </p>
                </div>
            </div>
        </div>
    );
}
