// Real meter data with accurate information
let meters = [
    {
        id: 1,
        name: "Apartment Raj",
        type: "prepaid",
        meterNo: "32051185704",
        consumerNo: "34900476",
        credit: 125.50,
        lastUpdated: "Just now",
        status: "active"
    },
    {
        id: 2,
        name: "Apartment Resna",
        type: "prepaid",
        meterNo: "32051185703",
        consumerNo: "34900475",
        credit: 89.25,
        lastUpdated: "Just now",
        status: "active"
    },
    {
        id: 3,
        name: "Apartment Shuvro",
        type: "postpaid",
        meterNo: "052156",
        consumerNo: "34031013",
        outstanding: 1035.75,
        dueDate: "15 Oct 2023",
        lastUpdated: "Just now",
        status: "active"
    }
];

// Payment channels
const paymentChannels = {
    bkash: { name: "bKash", label: "bKash Phone Number", placeholder: "01XXXXXXXXX" },
    nagad: { name: "Nagad", label: "Nagad Phone Number", placeholder: "01XXXXXXXXX" },
    upay: { name: "Upay", label: "Upay Account ID", placeholder: "Enter your Upay ID" },
    card: { name: "Card", label: "Card Number", placeholder: "XXXX XXXX XXXX XXXX" }
};

// DOM Elements
const metersContainer = document.getElementById('metersContainer');
const addMeterModal = document.getElementById('addMeterModal');
const paymentModal = document.getElementById('paymentModal');
const paymentFormElement = document.getElementById('paymentFormElement');
const paymentProcessing = document.getElementById('paymentProcessing');
const toast = document.getElementById('toast');
const lastUpdatedEl = document.getElementById('lastUpdated');
const totalOutstandingEl = document.getElementById('totalOutstanding');
const totalMetersEl = document.getElementById('totalMeters');
const refreshDataBtn = document.getElementById('refreshDataBtn');
const currentYearEl = document.getElementById('current
