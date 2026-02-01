import { RiDashboardLine } from 'react-icons/ri';
import { FaExchangeAlt, FaFileAlt, FaMoneyBillAlt, FaBalanceScale, FaCheckDouble, FaMoneyCheckAlt, FaHandHoldingUsd, FaBook, FaWarehouse, FaUserFriends, FaPrayingHands, FaCross, FaUser, FaMeetup, FaCarCrash, FaKey } from 'react-icons/fa';
import { MdSecurity, MdLocalParking, MdCloseFullscreen, MdCancel, MdCheck } from 'react-icons/md';

export const admin_navi = [
    {
        key: 'dashboard',
        label: 'Dashboard',
        path: '/db',
        icon: RiDashboardLine
    },
    {
        key: 'dwnlddailyvis',
        label: 'Daily Visitors',
        path: '/db/daily-vis',
        icon: FaUser
    },
    {
        key: 'dwnldvis',
        label: 'Visitor Registers',
        path: '/db/dwnldvis',
        icon: FaUser
    },
    {
        key: 'gbmeet',
        label: 'GB Meeting',
        path: '/db/gbm',
        icon: FaMeetup
    },
    {
        key: 'complains',
        label: 'Manage Complains',
        path: '/db/manage-complains',
        icon: FaCheckDouble
    },
    {
        key: 'challan',
        label: 'Challans',
        path: '/db/adminchallan',
        icon: FaCarCrash
    },
    {
        key: 'reg',
        label: 'Register Flat',
        path: '/db/reg',
        icon: MdCheck
    },
    {
        key: 'add-income',
        label: 'Add Income',
        path: '/db/addincome',
        icon: FaHandHoldingUsd
    },
    {
        key: 'addpv',
        label: 'Issue Payment Voucher',
        path: '/db/addpv',
        icon: FaMoneyCheckAlt
    },
    {
        key: 'demands',
        label: 'Raise Demand',
        path: '/db/raise-demand',
        icon: FaPrayingHands
    },
    {
        key: 'facility-reservation',
        label: 'Booking Request',
        path: '/db/hall-booking',
        icon: MdSecurity
    },
    {
        key: 'booking-details',
        label: 'Booking Cancellation',
        path: '/db/booking-details',
        icon: MdCancel
    },
    {
        key: 'approve-pay',
        label: 'Approve Payments',
        path: '/db/payment-approval',
        icon: MdCheck
    },
    {
        key: 'flat-details',
        label: 'Flat Details',
        path: '/db/flat-details-change-perm',
        icon: FaExchangeAlt
    },
    {
        key: 'income-details',
        label: 'Income Details',
        path: '/db/income-details-deptwise',
        icon: FaMoneyBillAlt
    },
    {
        key: 'expenditure-details',
        label: 'Expenditure Details',
        path: '/db/expenditure-details-deptwise',
        icon: FaMoneyBillAlt
    },
    {
        key: 'income-expenditure',
        label: 'Income/Expenditure',
        path: '/db/income-expenditure-account',
        icon: FaBalanceScale
    },
    {
        key: 'cashbook',
        label: 'Cashbook',
        path: '/db/cashbook',
        icon: FaBook
    },
    {
        key: 'bankbook',
        label: 'Bankbook',
        path: '/db/bankbook',
        icon: FaWarehouse
    },
    {
        key: 'maintenance-tracking',
        label: 'Maintenance',
        path: '/db/maintenance-tracking',
        icon: FaWarehouse
    },
    {
        key: 'findvehicle',
        label: 'Find Vehicle',
        path: '/db/findvehicle',
        icon: MdLocalParking
    },
    {
        key: 'owners',
        label: 'Owners',
        path: '/db/owner-details',
        icon: FaUserFriends
    },
    {
        key: 'renters',
        label: 'Renters',
        path: '/db/renter-details',
        icon: FaUserFriends
    },
    {
        key: 'admin-reset-password',
        label: 'Reset Password',
        path: '/db/admin-reset-password',
        icon: FaKey
    }
];

