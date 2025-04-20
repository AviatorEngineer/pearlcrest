import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { BarLoader } from 'react-spinners';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaStar } from 'react-icons/fa';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [review, setReview] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    setIsLoading(true);
    axios.post(
      "/api/v1/users/login",
      {
        flatnumber: username,
        password: password,
      },
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      console.log(response);
      localStorage.setItem("user", JSON.stringify(response.data.data.flat));
      setIsLoading(false);
      setShowReviewPopup(true); // Show review popup after successful login
    })
    .catch((error) => {
      Swal.fire({
        title: "Invalid Credentials",
        text: "Check your flatnumber or password",
        icon: "error",
        confirmButtonText: "OK",
      })
      .then(result => {
        if(result.isConfirmed) {
          setIsLoggingIn(false);
          setIsLoading(false);
        }
      });
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = () => {
    setIsLoggingIn(true);
  };

  const submitReview = async () => {
    if (!review) {
      Swal.fire({
        icon: "warning",
        title: "Please complete your review",
        text: "written feedback are required",
      });
      return;
    }

    try {
      const response = await axios.post("/api/v1/review/add-review", {
        flatnumber: username,
        name: "Resident",
        review
      });

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Thank you!",
          text: "Your feedback helps us improve!",
          timer: 1500
        });
        navigate("/db");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Couldn't submit your review. Please try again later.",
      });
    } finally {
      setShowReviewPopup(false);
    }
  };

  const skipReview = () => {
    setShowReviewPopup(false);
    navigate("/db");
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row items-stretch bg-gradient-to-r from-blue-50 to-purple-50">
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
            <h3 className="text-3xl font-semibold mb-4">Login</h3>
            <p className="text-base mb-2">Enter Your login details.</p>
          </div>
          <div className="w-full flex flex-col">
            <div className="relative flex items-center">
              <FaUser className="absolute left-3 text-gray-400" />
              <input
                type="text"
                placeholder="Flat Number"
                className="w-full text-black pl-10 py-2 my-2 bg-transparent border-b border-gray-300 outline-none focus:outline-none focus:border-purple-500 transition-colors"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full text-black pl-10 py-2 my-2 bg-transparent border-b border-gray-300 outline-none focus:outline-none focus:border-purple-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                className="absolute right-4 text-gray-400 hover:text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="w-full flex items-center justify-between mt-4">
            <div className="w-full flex items-center">
              <input type="checkbox" className="w-4 h-4 mr-2" />
              <p className="text-sm">Remember Me</p>
            </div>
            <Link to="/forgot-password">
              <p className="text-sm cursor-pointer underline underline-offset-2 font-medium whitespace-nowrap text-purple-600 hover:text-purple-800">
                Forgot Password
              </p>
            </Link>
          </div>

          <div className="w-full flex flex-col my-4">
            <button
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white w-full rounded-md p-4 text-center flex items-center justify-center my-2 hover:from-purple-700 hover:to-blue-700 transition-all"
              onClick={handleContinue}
            >
              Log In
            </button>
          </div>
        </div>
      </div>


      {/* Review Popup */}
      {showReviewPopup && (
  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="relative bg-white m-4 p-6 sm:p-8 rounded-2xl w-full max-w-md transform transition-all duration-300 animate-scaleIn shadow-2xl border-t-4 border-blue-500">
      {/* New badge */}
      <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
        NEW!
      </div>
      
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          <span className="text-blue-600">Improved</span> Feedback System
        </h2>
        <p className="text-gray-600 mb-3">
          We've fixed the issues! Your feedback now goes directly to our team.
        </p>
        <div className="bg-blue-50 px-4 py-2 rounded-lg inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-blue-700">Working perfectly now</span>
        </div>
      </div>
      
      <textarea
        className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-gray-700"
        placeholder="Example: 'The maintenance team was very quick to respond last week!'"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      ></textarea>
      
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button
          onClick={skipReview}
          className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          Maybe later
        </button>
        <button
          onClick={submitReview}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Send Feedback
        </button>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          Your feedback helps us serve you better
        </p>
      </div>
    </div>
  </div>
)}
    </div>
  );
}