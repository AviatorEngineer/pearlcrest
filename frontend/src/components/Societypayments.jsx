import React, { useState, useEffect } from 'react';
import axios from "axios";
import Swal from 'sweetalert2';
import { CircleLoader } from 'react-spinners';
import { FiInfo, FiCreditCard, FiCalendar, FiCheckCircle, FiXCircle, FiDollarSign } from 'react-icons/fi';
import { FaQrcode, FaRupeeSign } from 'react-icons/fa';

const Societypayments = () => {
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [purpose, setPurpose] = useState(null);
  const [monthsPaid, setMonthsPaid] = useState([]);
  const [amountper, setAmountper] = useState(0.0);
  const [paydemand, setpaydemand] = useState([]);
  const [amount, setAmount] = useState(0.0);
  const [qrCodeDataUri, setQrCodeDataUri] = useState('');
  const [qrlink, setQrLink] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'payment'
  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    const getMonthsPaid = async () => {
      try {
        const response = await axios.get("/api/v1/account/get-maintenance-record", { withCredentials: true });
        setMonthsPaid(response.data.data);
      } catch (error) {
        console.error("Error fetching months paid:", error);
      }
    };

    const getDemand = async () => {
      try {
        const response = await axios.get("/api/v1/demand/getpaydemand");
        const filtered = (response.data.data.response.filter((ele) => ele.type !== "FACILITY RESERVATION"));
        setpaydemand(filtered);
      } catch (error) {
        console.error(error.message);
      }
    }

    getMonthsPaid();
    getDemand();
  }, []);

  useEffect(() => {
    const selectedAmount = paydemand.find((ele) => ele.type === purpose)?.amount || 0;
    setAmountper(selectedAmount);
    let newAmount;
    if (purpose === "MAINTENANCE") {
      if(user?.flatnumber === "CG4"){
        newAmount = selectedMonths.length * selectedAmount * 2;
      }
      else {
        newAmount = selectedMonths.length * selectedAmount;
      }
    } else {
      newAmount = selectedAmount;
    }
    setAmount(newAmount);
  }, [selectedMonths, purpose, paydemand]);

  const handlePurposeChange = (e) => {
    const selectedPurpose = e.target.value;
    setPurpose(selectedPurpose);
    setCheckout(false);
    setSelectedMonths([]);
    setActiveTab('details');
  };

  const handleMonthToggle = (month) => {
    const index = selectedMonths.indexOf(month);
    if (index === -1) {
      setSelectedMonths([...selectedMonths, month]);
    } else {
      setSelectedMonths(selectedMonths.filter((m) => m !== month));
    }
    if (checkout === true) {
      setCheckout(!checkout);
    }
  };

  const isMonthSelected = (month) => selectedMonths.includes(month);
  const isMonthPaid = (month) => monthsPaid.includes(month);

  const getMonthYearString = (date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: '2-digit' }).format(date);
  };

  const getAllMonthsOfYear = (year) => {
    const months = [];
    const nextYear = year + 1;

    for (let i = 3; i < 15; i++) { 
      const currentMonth = i % 12; 
      const currentDate = new Date(currentMonth < 3 ? nextYear : year, currentMonth);
      const monthYearString = getMonthYearString(currentDate);
      months.push(monthYearString);
    }
    return months;
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
    setSelectedMonths([]);
  };
  
  const currentyear = new Date().getFullYear();
  const years = [currentyear-4, currentyear-3, currentyear-2, currentyear-1, currentyear, currentyear + 1];
  const months = getAllMonthsOfYear(selectedYear);

  const handleCheckout = async () => {
    if (purpose === "MAINTENANCE" && selectedMonths.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select at least one month',
      });
      return;
    }
    else if (!amount || !purpose) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please complete all required fields',
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post("/api/v1/account/generate-qr", { amount });
      setQrCodeDataUri(response.data.qrCodeDataUri);
      setQrLink(response.data.qrcodeUrl);
      setCheckout(true);
      setActiveTab('payment');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.response?.data?.message || 'Failed to initiate payment',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateTransactionId = (id, mode) => {
    let regex;
    switch (mode) {
      case 'UPI':
        regex = /^[a-zA-Z0-9]{12}$/;
        break;
      case 'NEFT':
      case 'IMPS':
        regex = /^[a-zA-Z0-9]{22}$/;
        break;
      case 'Cheque':
        regex = /^[0-9]{6}$/;
        break;
      default:
        return false;
    }
    return regex.test(id);
  };

  const handleConfirm = async () => {
    if (!paymentMode) {
      Swal.fire({
        icon: 'error',
        title: 'Select Payment Mode',
        text: 'Please select a payment mode.'
      });
      return;
    }
    if (!transactionId || !validateTransactionId(transactionId, paymentMode)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Transaction ID',
        text: `Please enter a valid transaction ID for ${paymentMode}.`
      });
      return;
    }
    
    setLoading(true);
    try {
      const newId = paymentMode+":"+transactionId;
      const response = await axios.post("/api/v1/account/add-untrans", {
        purpose, amount, months: selectedMonths, transactionId: newId
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Payment Confirmed',
        html: `Your payment has been successfully confirmed.<br><br>
               <strong>Payment ID:</strong> ${response?.data?.data?._id}<br>
               <strong>Amount:</strong> ₹${amount}<br>
               <strong>Purpose:</strong> ${purpose}`,
        confirmButtonText: 'Done'
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: error.response?.data?.message || 'An error occurred while confirming payment.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FiCreditCard className="mr-2" /> Society Payments
          </h2>
          <p className="text-blue-100 mt-1">Pay your maintenance and other society charges</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Payment Details
            </button>
            {checkout && (
              <button
                onClick={() => setActiveTab('payment')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'payment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Complete Payment
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Purpose
                </label>
                <select 
                  onChange={handlePurposeChange} 
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={null}>Select Payment Purpose</option>
                  {paydemand.map((ele, index) => (
                    <option key={index} value={ele.type}>{ele.type}</option>
                  ))}
                </select>
              </div>

              {(amountper === 0.0 && purpose) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaRupeeSign className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {purpose === "MAINTENANCE" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Year
                    </label>
                    <select 
                      onChange={handleYearChange} 
                      defaultValue={new Date().getFullYear()} 
                      className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {years.map((year, index) => (
                        <option key={index} value={year}>FY {year}-{(year+1).toString().slice(-2)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Months
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {months.map((month, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 flex items-center justify-between ${
                            isMonthPaid(month) 
                              ? 'bg-green-50 border-green-200' 
                              : isMonthSelected(month) 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                          }`}
                          onClick={() => !isMonthPaid(month) && handleMonthToggle(month)}
                        >
                          <span className={`text-sm ${
                            isMonthPaid(month) ? 'text-green-600' : isMonthSelected(month) ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {month}
                          </span>
                          {isMonthPaid(month) ? (
                            <FiCheckCircle className="text-green-500" />
                          ) : isMonthSelected(month) ? (
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 flex items-center">
                      <FiInfo className="mr-1" /> Green months are already paid
                    </p>
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Total Amount</h3>
                    <p className="text-sm text-gray-600">Payable immediately</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 flex items-center">
                    <FaRupeeSign className="mr-1" /> {amount ? amount.toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCheckout} 
                disabled={!amount || (purpose === "MAINTENANCE" && selectedMonths.length === 0)}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                  (!amount || (purpose === "MAINTENANCE" && selectedMonths.length === 0)) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {activeTab === 'payment' && checkout && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Payment Summary</h3>
                    <p className="text-sm text-gray-600">{purpose}</p>
                    {purpose === "MAINTENANCE" && (
                      <p className="text-sm text-gray-600">
                        {selectedMonths.length} month(s) selected
                      </p>
                    )}
                  </div>
                  <div className="text-xl font-bold text-blue-600 flex items-center">
                    <FaRupeeSign className="mr-1" /> {amount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FaQrcode className="mr-2 text-blue-500" /> UPI Payment
                  </h3>
                  <div className="flex flex-col items-center">
                    <a href={qrlink} target="_blank" rel="noopener noreferrer">
                      <img src={qrCodeDataUri} alt="QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-lg" />
                    </a>
                    <p className="mt-3 text-sm text-center text-gray-600">
                      Scan the QR code or <a href={qrlink} className="text-blue-600 hover:underline">click here</a> to pay via UPI
                    </p>
                    <div className="mt-2 flex justify-center">
                      <img className="h-10" src="/static/images/bhim_sbi.jpeg" alt="bhim_upi" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <FiCreditCard className="mr-2 text-blue-500" /> Bank Transfer
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Number</p>
                      <p className="text-gray-900 font-mono">0939000100236216</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">IFSC Code</p>
                      <p className="text-gray-900 font-mono">PUNB0093900</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Account Name</p>
                      <p className="text-gray-900">PEARL CREST FLAT OWNERS SOCIETY</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Confirmation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Mode
                    </label>
                    <select 
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Payment Mode</option>
                      <option value="UPI">UPI</option>
                      <option value="NEFT">NEFT</option>
                      <option value="IMPS">IMPS</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  {paymentMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        Transaction Reference
                        <button
                          type="button"
                          className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                          title={
                            paymentMode === 'UPI' 
                              ? 'UPI Reference Number should be 12 alphanumeric characters long.' 
                              : paymentMode === 'NEFT' 
                                ? 'NEFT Reference Number should be 8 to 12 alphanumeric characters long.' 
                                : paymentMode === 'IMPS' 
                                  ? 'IMPS Reference Number should be 8 to 12 alphanumeric characters long.' 
                                  : 'Cheque Number should be 6 numeric characters long.'
                          }
                        >
                          <FiInfo />
                        </button>
                      </label>
                      <input
                        type="text"
                        placeholder={
                          paymentMode === 'UPI' 
                            ? 'Enter 12-digit UPI reference' 
                            : paymentMode === 'NEFT' 
                              ? 'Enter 8-12 digit NEFT reference' 
                              : paymentMode === 'IMPS' 
                                ? 'Enter 8-12 digit IMPS reference' 
                                : 'Enter 6-digit cheque number'
                        }
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {paymentMode === 'UPI' && 'Example: 12 alphanumeric characters like ABCD1234EF56'}
                        {paymentMode === 'NEFT' && 'Example: 8-12 alphanumeric characters like NEFT123456'}
                        {paymentMode === 'IMPS' && 'Example: 8-12 alphanumeric characters like IMPS789012'}
                        {paymentMode === 'Cheque' && 'Example: 6 digit cheque number like 123456'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!paymentMode || !transactionId || loading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center ${
                  (!paymentMode || !transactionId || loading) 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <>
                    <CircleLoader color="#ffffff" size={20} className="mr-2" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Societypayments;