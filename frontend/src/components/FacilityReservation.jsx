import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { CircleLoader } from 'react-spinners';
import { FiCalendar, FiDollarSign, FiInfo, FiCheck, FiX, FiCreditCard } from 'react-icons/fi';
import { FaQrcode, FaRupeeSign } from 'react-icons/fa';

export default function FacilityReservation() {
    const [selectedDates, setSelectedDates] = useState([]);
    const [purpose, setPurpose] = useState('');
    const [facilityType, setFacilityType] = useState('');
    const [amountPerDay, setAmountPerDay] = useState(0);
    const [amount, setAmount] = useState(0);
    const [qrCodeDataUri, setQrCodeDataUri] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [qrlink, setQrLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkout, setCheckout] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [allFacilities, setAllFacilities] = useState([]);
    const [paymentMode, setPaymentMode] = useState('');
    const [activeTab, setActiveTab] = useState('selection'); // 'selection' or 'payment'

    // Fetch facility data and booked dates
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [datesResponse, demandResponse] = await Promise.all([
                    axios.get("/api/v1/booking/trackdates"),
                    axios.get("/api/v1/demand/getpaydemand")
                ]);
                
                // Ensure all dates are Date objects
                const bookedDatesArray = datesResponse.data.data.map(item => ({
                    ...item,
                    dates: item.dates.map(dateStr => new Date(dateStr))
                }));
                setBookedDates(bookedDatesArray);
                
                const facilities = demandResponse.data.data.response
                    .filter(obj => obj.type === "FACILITY RESERVATION");
                setAmountPerDay(facilities.length > 0 ? facilities[0].amount : 0);
                
                // Set available facility types
                setAllFacilities([
                    "Community Hall",
                    "Terrace Block A",
                    "Terrace Block B", 
                    "Terrace Block C",
                    "Basement Area"
                ]);
                
            } catch (error) {
                console.error("Error fetching data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Data Loading Failed',
                    text: 'Could not load facility information. Please try again later.'
                });
            }
        };
        fetchData();
    }, []);

    // Calculate amount when dates change
    useEffect(() => {
        setAmount((selectedDates.length * amountPerDay).toFixed(2));
    }, [selectedDates, amountPerDay]);

    // Get booked dates for selected facility
    const getBookedDatesForFacility = () => {
        if (!facilityType) return [];
        const facility = bookedDates.find((ele) => ele.type === facilityType);
        return facility?.dates || [];
    };

    const handleDateClick = (date) => {
        const dateExists = selectedDates.some(d => d.getTime() === date.getTime());
        if (dateExists) {
            setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
        } else {
            setSelectedDates([...selectedDates, date].sort((a, b) => a - b));
        }
        if (checkout) setCheckout(false);
    };

    const filterAvailableDates = (date) => {
        const facilityBookedDates = getBookedDatesForFacility();
        return !facilityBookedDates.some(bookedDate => 
            bookedDate.getTime() === date.getTime()
        );
    };

    const dayClassName = (date) => {
        const facilityBookedDates = getBookedDatesForFacility();
        const isBooked = facilityBookedDates.some(d => d.getTime() === date.getTime());
        const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
        
        if (isBooked) return 'bg-red-100 text-red-500';
        if (isSelected) return 'bg-blue-500 text-white';
        return '';
    };

    const handleCheckout = async () => {
        if (!facilityType || !purpose || selectedDates.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Incomplete Information',
                text: 'Please select facility, purpose, and at least one date.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        setLoading(true);
        try {
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
                confirmButtonColor: '#3085d6',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!paymentMode) {
            Swal.fire({
                icon: 'error',
                title: 'Select Payment Method',
                text: 'Please select how you made the payment.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        if (!transactionId) {
            Swal.fire({
                icon: 'error',
                title: 'Transaction ID Required',
                text: 'Please provide your payment transaction reference.',
                confirmButtonColor: '#3085d6',
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("/api/v1/booking/book-facility", {
                purpose,
                type: facilityType,
                amount,
                dates: selectedDates,
                transid: `${paymentMode}:${transactionId}`
            });

            await Swal.fire({
                icon: 'success',
                title: 'Booking Confirmed!',
                html: `
                    <div class="text-left">
                        <p><strong>Facility:</strong> ${facilityType}</p>
                        <p><strong>Dates:</strong> ${selectedDates.map(d => d.toLocaleDateString()).join(', ')}</p>
                        <p><strong>Amount Paid:</strong> ₹${amount}</p>
                        <p><strong>Reference ID:</strong> ${response.data.bookingId}</p>
                    </div>
                `,
                confirmButtonColor: '#3085d6',
            });
            
            window.location.reload();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: error.response?.data?.message || 'Could not complete booking',
                confirmButtonColor: '#3085d6',
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
                        <FiCalendar className="mr-2" /> Facility Reservation
                    </h2>
                    <p className="text-blue-100 mt-1">Book society facilities for your events</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('selection')}
                            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'selection' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            Select Facility
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
                    {activeTab === 'selection' && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Facility
                                    </label>
                                    <select
                                        value={facilityType}
                                        onChange={(e) => setFacilityType(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Choose a facility</option>
                                        {allFacilities.map((facility, index) => (
                                            <option key={index} value={facility}>{facility}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Event Purpose
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Birthday Party, Anniversary"
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {facilityType && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Available Dates
                                        </label>
                                        <div className="border rounded-lg p-4">
                                            <DatePicker
                                                selected={null}
                                                onChange={handleDateClick}
                                                inline
                                                minDate={new Date()}
                                                filterDate={filterAvailableDates}
                                                dayClassName={dayClassName}
                                                calendarClassName="w-full"
                                            />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500 flex items-center">
                                            <FiInfo className="mr-1" /> Red dates are already booked
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Booking Summary</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Selected Dates:</span>
                                                <span className="font-medium">
                                                    {selectedDates.length > 0 
                                                        ? selectedDates.map(d => d.toLocaleDateString()).join(', ')
                                                        : 'No dates selected'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Rate per day:</span>
                                                <span className="font-medium flex items-center">
                                                    <FaRupeeSign className="mr-1" /> {amountPerDay.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between border-t border-blue-100 pt-2">
                                                <span className="text-gray-800 font-medium">Total Amount:</span>
                                                <span className="text-blue-600 font-bold flex items-center">
                                                    <FaRupeeSign className="mr-1" /> {amount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={!facilityType || !purpose || selectedDates.length === 0 || loading}
                                className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 ${
                                    (!facilityType || !purpose || selectedDates.length === 0) 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } flex items-center justify-center`}
                            >
                                {loading ? (
                                    <>
                                        <CircleLoader color="#ffffff" size={20} className="mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    'Proceed to Payment'
                                )}
                            </button>
                        </div>
                    )}

                    {activeTab === 'payment' && checkout && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Facility:</span>
                                        <span className="font-medium">{facilityType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dates:</span>
                                        <span className="font-medium">
                                            {selectedDates.map(d => d.toLocaleDateString()).join(', ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-blue-100 pt-2">
                                        <span className="text-gray-800 font-medium">Total Amount:</span>
                                        <span className="text-blue-600 font-bold flex items-center">
                                            <FaRupeeSign className="mr-1" /> {amount}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                                    <FaQrcode className="mr-2 text-blue-500" /> UPI Payment
                                </h3>
                                <div className="flex flex-col items-center">
                                    <a href={qrlink} target="_blank" rel="noopener noreferrer">
                                        <img src={qrCodeDataUri} alt="UPI QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-lg" />
                                    </a>
                                    <p className="mt-3 text-sm text-center text-gray-600">
                                        Scan the QR code or <a href={qrlink} className="text-blue-600 hover:underline">click here</a> to pay via UPI
                                    </p>
                                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                                        <div className="flex flex-col items-center">
                                            <img className="h-10 mb-1" src="/static/images/bhim_sbi.jpeg" alt="BHIM" title="BHIM" />
                                            <span className="text-xs text-gray-600">BHIM</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <img className="h-10 mb-1" src="/static/images/gpay_icon.png" alt="Google Pay" title="Google Pay" />
                                            <span className="text-xs text-gray-600">Google Pay</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <img className="h-10 mb-1" src="/static/images/paytm_icon.png" alt="Paytm" title="Paytm" />
                                            <span className="text-xs text-gray-600">Paytm</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <img className="h-10 mb-1" src="/static/images/amazon_pay.png" alt="Amazon Pay" title="Amazon Pay" />
                                            <span className="text-xs text-gray-600">Amazon Pay</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs text-gray-500 text-center">
                                        All major UPI partners supported
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Confirmation</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Method
                                        </label>
                                        <select 
                                            value={paymentMode}
                                            onChange={(e) => setPaymentMode(e.target.value)}
                                            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select Payment Method</option>
                                            <option value="UPI">UPI</option>
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
                                                    title={`${
                                                        paymentMode === 'UPI' 
                                                            ? 'UPI Reference Number (12 alphanumeric characters)' 
                                                            : 'Cheque Number (6 digits)'
                                                    }`}
                                                >
                                                    <FiInfo />
                                                </button>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder={`Enter ${paymentMode} reference`}
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {paymentMode === 'UPI' && 'Example: 12 character UPI reference like ABCD1234EF56'}
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
                                        Confirming...
                                    </>
                                ) : (
                                    'Confirm Booking'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}