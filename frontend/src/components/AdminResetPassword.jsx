import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FiMail, FiHome, FiSend, FiClock } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

export default function AdminResetPassword() {
    const [email, setEmail] = useState('');
    const [flatNumber, setFlatNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLinks, setResetLinks] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSendResetLink = async () => {
        // Validation
        if (!email.trim()) {
            Swal.fire({
                title: 'Email Required',
                text: 'Please enter an email address',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!validateEmail(email)) {
            Swal.fire({
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!flatNumber.trim()) {
            Swal.fire({
                title: 'Flat Number Required',
                text: 'Please enter a flat number',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/v1/users/send-password-reset-link', {
                email,
                flatnumber: flatNumber.toUpperCase()
            });

            Swal.fire({
                title: 'Link Sent',
                html: `Password reset link has been sent to <strong>${email}</strong><br><br>
                       <p style="font-size: 0.9em; color: #666;">The link will be valid for 5 minutes only.</p>`,
                icon: 'success',
                confirmButtonText: 'OK'
            });

            // Add to history
            const newLink = {
                id: Date.now(),
                email,
                flatNumber: flatNumber.toUpperCase(),
                sentAt: new Date(),
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                status: 'sent'
            };
            setResetLinks([newLink, ...resetLinks]);

            // Clear form
            setEmail('');
            setFlatNumber('');
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: error?.response?.data?.message || 'Failed to send reset link',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-IN', {
            year: '2-digit',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getTimeRemaining = (expiresAt) => {
        const now = new Date();
        const expires = new Date(expiresAt);
        const secondsRemaining = Math.floor((expires - now) / 1000);
        
        if (secondsRemaining <= 0) {
            return 'Expired';
        }
        
        const minutes = Math.floor(secondsRemaining / 60);
        const seconds = secondsRemaining % 60;
        
        return `${minutes}m ${seconds}s`;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <FiSend className="mr-2" /> Send Password Reset Link
                    </h2>
                    <p className="text-red-100 mt-1">Send a 5-minute password reset link to residents</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setShowHistory(false)}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${!showHistory ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Send Link
                        </button>
                        <button
                            onClick={() => setShowHistory(true)}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${showHistory ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Sent Links ({resetLinks.length})
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!showHistory ? (
                        <div className="space-y-6 max-w-lg">
                            {/* Email Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FiMail className="mr-2 text-red-500" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The reset link will be sent to this email address
                                </p>
                            </div>

                            {/* Flat Number Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <FiHome className="mr-2 text-red-500" /> Flat Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., A104, CG4, D1"
                                    value={flatNumber}
                                    onChange={(e) => setFlatNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    The flat number for which to reset the password
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <FiClock className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-900">Link Validity</h4>
                                        <p className="text-xs text-blue-700 mt-1">
                                            The password reset link will be valid for <strong>5 minutes</strong> only. After that, the user will need to request a new link.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendResetLink}
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-medium text-white flex items-center justify-center transition-colors duration-200 ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <ClipLoader color="#ffffff" size={20} className="mr-2" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="mr-2" />
                                        Send Reset Link
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Sent Links History */}
                            {resetLinks.length === 0 ? (
                                <div className="text-center py-12">
                                    <FiMail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No links sent yet</h3>
                                    <p className="text-gray-600 mt-2">Send your first password reset link to get started</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {resetLinks.map((link) => {
                                        const now = new Date();
                                        const isExpired = new Date(link.expiresAt) < now;
                                        
                                        return (
                                            <div
                                                key={link.id}
                                                className={`border rounded-lg p-4 ${
                                                    isExpired
                                                        ? 'border-gray-200 bg-gray-50'
                                                        : 'border-green-200 bg-green-50'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-gray-900">
                                                                Flat: {link.flatNumber}
                                                            </h4>
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                                    isExpired
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-green-100 text-green-800'
                                                                }`}
                                                            >
                                                                {isExpired ? 'Expired' : 'Active'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            <strong>Email:</strong> {link.email}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <strong>Sent:</strong> {formatTime(link.sentAt)}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            <strong>Expires:</strong> {formatTime(link.expiresAt)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className={`text-lg font-mono font-bold flex items-center gap-1 ${
                                                                isExpired ? 'text-red-600' : 'text-green-600'
                                                            }`}
                                                        >
                                                            <FiClock className="text-sm" />
                                                            {getTimeRemaining(link.expiresAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
