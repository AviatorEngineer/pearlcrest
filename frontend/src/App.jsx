import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import FacilityReservation from "./components/FacilityReservation";
import Societypayments from "./components/Societypayments";
import UserProfile from "./components/UserProfile";
import Login from "./components/Login";
import IncomeExpAccount from "./components/IncomeExpAccount";
import Payementhistory from "./components/Payementhistory";
import VisitorsLog from "./components/VisitorsLog";
import AddIncome from "./components/AddIncome";
import FlatDetails from "./components/FlatDetails";
import FindVehicle from "./components/FindVehicle";
import IncomeStatement from "./components/IncomeStatement";
import AddPaymentVoucher from "./components/AddPaymentVoucher";
import ExpenditureStatements from "./components/ExpenditureStatements";
import CashBook from "./components/CashBook";
import BankBook from "./components/BankBook";
import MaintenanceRecord from "./components/MaintenanceRecord";
import PaymentSucess from "./components/PaymentSuccess";
import AddVisitor from "./components/AddVisitor";
import MaidManagement from "./components/MaidManagement";
import MaidLog from "./components/MaidLogs";
import Owners from "./components/Owners";
import Renters from "./components/Renters";
import ForgotPass from "./components/ForgotPass";
import RaiseDemand from "./components/RaiseDemand.";
import HallBooking from "./components/HallBooking";
import BookingDetails from "./components/BookingDetails";
import PaymentApproval from "./components/PaymentApproval";
import MemberCouncil from "./components/MemberCouncil";
import Unauthorised from "./components/Unauthorised"
import RegistrationPage from "./components/RegistrationPage";
import VisitorDownload from "./components/VisitorDownload";
import AddQuestion from "./components/AddQuestion";
import Vote from "./components/Vote";
import ChallanList from "./components/ChallanList";
import AdminChallan from "./components/AdminChallan";
import ExecutiveComplaints from "./components/ManageComplaint";
import SubmitComplaint from "./components/AddComplaint";
import DailyVisitors from "./components/DailyVisitors";
import VoteLogin from "./components/VoteLogin"
import VotingDashboard from "./components/VoteDashboard";
import VoterRegistration from "./components/VoterRegistration";
import VoteLoginOfficer from "./components/OfficerLogin"
import OffDash from "./components/OfficerDash"
import Result from "./components/Results"
import AdminResetPassword from "./components/AdminResetPassword"
import ResetPasswordLink from "./components/ResetPasswordLink"
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/log" element={<Login />} />
          <Route path="/votelog" element={<VoteLogin />} />
          <Route path="/votereg" element={<VoterRegistration/>} />
          <Route path="/vote-dash" element={<VotingDashboard />} />
          <Route path="/votelogoff" element={<VoteLoginOfficer />} />
          <Route path="/offdash" element={<OffDash />} />
          <Route path="/" element={<Home />} />
          <Route path="/paymentsuccess" element={<PaymentSucess />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
          <Route path="/reset-password/:token" element={<ResetPasswordLink />} />
          <Route path="/results" element={<Result />} />
          <Route path="/council" element={<MemberCouncil />} />
          <Route
            path="/db"
            element={<Layout />}
          >
            <Route index element={<Dashboard />} />
            <Route path="reserve" element={<FacilityReservation />} />
            <Route path="payments" element={<Societypayments />} />
            <Route path="unauth" element={<Unauthorised />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="trackpay" element={<Payementhistory />} />
            <Route path="visitor" element={<VisitorsLog />} />
            <Route path="maids" element={<MaidLog />} />
            <Route path="addincome" element={<AddIncome />} />
            <Route path="flat-details-change-perm" element={<FlatDetails />} />
            <Route path="facility-reservation-booking-account" element={<></>} />
            <Route path="income-details-deptwise" element={<IncomeStatement />} />
            <Route path="expenditure-details-deptwise" element={<ExpenditureStatements />} />
            <Route path="income-expenditure-account" element={<IncomeExpAccount />} />
            <Route path="cashbook" element={<CashBook />} />
            <Route path="bankbook" element={<BankBook />} />
            <Route path="maintenance-tracking" element={<MaintenanceRecord />} />
            <Route path="addpv" element={<AddPaymentVoucher />} />
            <Route path="visitor-manage" element={<AddVisitor />} />
            <Route path="maidmanage" element={<MaidManagement />} />
            <Route path="findvehicle" element={<FindVehicle />} />
            <Route path="owner-details" element={<Owners />} />
            <Route path="renter-details" element={<Renters />} />
            <Route path="raise-demand" element={<RaiseDemand />} />
            <Route path="hall-booking" element={<HallBooking />} />
            <Route path="booking-details" element={<BookingDetails />} />
            <Route path="payment-approval" element={<PaymentApproval />} />
            <Route path="reg" element={<RegistrationPage />} />
            <Route path="dwnldvis" element={<VisitorDownload/>} />
            <Route path="gbm" element={<AddQuestion/>} />
            <Route path="vote" element={<Vote/>} />
            <Route path="challan" element={<ChallanList/>} />
            <Route path="adminchallan" element={<AdminChallan/>} />
            <Route path="manage-complains" element={<ExecutiveComplaints/>} />
            <Route path="raise-complains" element={<SubmitComplaint/>} />
            <Route path="daily-vis" element={<DailyVisitors/>} />
            <Route path="admin-reset-password" element={<AdminResetPassword/>} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
