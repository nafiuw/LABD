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
const currentYearEl = document.getElementById('currentYear');

// Current meter being processed for payment
let currentPaymentMeter = null;

// Initialize the application
function init() {
    renderMeters();
    setupEventListeners();
    startLiveUpdates();
    updateTotalOutstanding();
    updateCurrentYear();
}

// Render meters to the DOM
function renderMeters() {
    metersContainer.innerHTML = '';
    
    if (meters.length === 0) {
        metersContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bolt" style="font-size: 3rem; color: var(--gray); margin-bottom: 1rem;"></i>
                <h3>No Meters Added</h3>
                <p>Get started by adding your first electricity meter</p>
                <button class="btn btn-primary" onclick="openAddMeterModal()">
                    <i class="fas fa-plus"></i> Add First Meter
                </button>
            </div>
        `;
        return;
    }
    
    meters.forEach(meter => {
        const meterCard = document.createElement('div');
        meterCard.className = 'meter-card';
        
        if (meter.type === 'prepaid') {
            meterCard.innerHTML = `
                <div class="meter-header">
                    <div class="meter-name">${meter.name}</div>
                    <div class="meter-type prepaid">Prepaid</div>
                </div>
                <div class="meter-details">
                    <div class="meter-detail">
                        <span class="meter-detail-label">Meter No:</span>
                        <span>${meter.meterNo}</span>
                    </div>
                    <div class="meter-detail">
                        <span class="meter-detail-label">Consumer No:</span>
                        <span>${meter.consumerNo}</span>
                    </div>
                    <div class="meter-detail">
                        <span class="meter-detail-label">Current Credit:</span>
                        <span class="stat-value">৳ ${meter.credit.toFixed(2)}</span>
                    </div>
                    <div class="meter-detail">
                        <span class="meter-detail-label">Last Updated:</span>
                        <span>${meter.lastUpdated}</span>
                    </div>
                </div>
                <div class="meter-actions">
                    <button class="btn btn-primary" onclick="viewMeterDetails(${meter.id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    <button class="btn btn-success" onclick="initiatePayment(${meter.id}, 'prepaid')">
                        <i class="fas fa-credit-card"></i> Top Up
                    </button>
                </div>
            `;
        } else {
            meterCard.innerHTML = `
                <div class="meter-header">
                    <div class="meter-name">${meter.name}</div>
                    <div class="meter-type postpaid">Postpaid</div>
                </div>
                <div class="meter-details">
                    <div class="meter-detail">
                        <span class="meter-detail-label">Meter No:</span>
                        <span>${meter.meterNo}</span>
                    </div>
                    <div class="meter-detail">
                        <span class="meter-detail-label">Consumer No:</span>
                        <span>${meter.consumerNo}</span>
                    </div>
                    <div class="meter-detail">
                        <span class="meter-detail-label">Outstanding Bill:</span>
                        <span class="stat-value" style="color: var(--danger);">৳ ${meter.outstanding.toFixed(2)}</span>
                    </div>
                    <div class="meter-detail">
                        <span class="meter-detail-label">Due Date:</span>
                        <span>${meter.dueDate}</span>
                    </div>
                </div>
                <div class="meter-actions">
                    <button class="btn btn-primary" onclick="viewMeterDetails(${meter.id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    <button class="btn btn-success" onclick="initiatePayment(${meter.id}, 'postpaid')">
                        <i class="fas fa-credit-card"></i> Pay Bill
                    </button>
                </div>
            `;
        }
        
        metersContainer.appendChild(meterCard);
    });
    
    totalMetersEl.textContent = meters.length;
}

// Set up event listeners
function setupEventListeners() {
    // Add meter buttons
    document.getElementById('addMeterBtn').addEventListener('click', openAddMeterModal);
    document.getElementById('addMeterNav').addEventListener('click', openAddMeterModal);

    // Refresh data button
    refreshDataBtn.addEventListener('click', () => {
        refreshDataBtn.innerHTML = '<div class="loading"></div> Refreshing...';
        setTimeout(() => {
            fetchMeterData();
            refreshDataBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        }, 1000);
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });

    // Tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Payment channel selection
    document.querySelectorAll('.payment-channel').forEach(channel => {
        channel.addEventListener('click', () => {
            document.querySelectorAll('.payment-channel').forEach(c => c.classList.remove('selected'));
            channel.classList.add('selected');
            
            const channelType = channel.getAttribute('data-channel');
            showChannelDetails(channelType);
        });
    });

    // Meter form submission
    document.getElementById('meterForm').addEventListener('submit', handleMeterSubmit);

    // Payment form submission
    paymentFormElement.addEventListener('submit', processPayment);

    // Wi-Fi form submission
    document.getElementById('wifiForm').addEventListener('submit', handleWifiSubmit);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addMeterModal) {
            addMeterModal.style.display = 'none';
        }
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
}

// Open add meter modal
function openAddMeterModal() {
    addMeterModal.style.display = 'flex';
    document.getElementById('meterForm').reset();
}

// Handle meter form submission
function handleMeterSubmit(e) {
    e.preventDefault();
    
    const activeTab = document.querySelector('.tab.active').getAttribute('data-tab');
    let meterData;
    
    if (activeTab === 'prepaid') {
        meterData = {
            id: Date.now(),
            name: document.getElementById('prepaidName').value,
            type: 'prepaid',
            meterNo: document.getElementById('prepaidMeterNo').value,
            consumerNo: document.getElementById('prepaidConsumerNo').value,
            credit: 0,
            lastUpdated: "Just now",
            status: "active"
        };
    } else {
        meterData = {
            id: Date.now(),
            name: document.getElementById('postpaidName').value,
            type: 'postpaid',
            meterNo: document.getElementById('postpaidMeterNo').value,
            consumerNo: document.getElementById('postpaidConsumerNo').value,
            outstanding: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
            lastUpdated: "Just now",
            status: "active"
        };
    }
    
    meters.push(meterData);
    renderMeters();
    addMeterModal.style.display = 'none';
    showToast('Meter added successfully!');
}

// Handle Wi-Fi form submission
function handleWifiSubmit(e) {
    e.preventDefault();
    showToast('Wi-Fi bill information saved successfully!');
}

// Show payment channel details
function showChannelDetails(channelType) {
    const channel = paymentChannels[channelType];
    const channelDetails = document.getElementById('channelDetails');
    const channelLabel = document.getElementById('channelLabel');
    const channelInput = document.getElementById('channelInput');
    
    channelLabel.textContent = channel.label;
    channelInput.placeholder = channel.placeholder;
    channelDetails.style.display = 'block';
}

// Initiate payment process
function initiatePayment(meterId, type) {
    const meter = meters.find(m => m.id === meterId);
    currentPaymentMeter = meter;
    
    const paymentTitle = document.getElementById('paymentTitle');
    const paymentMeter = document.getElementById('paymentMeter');
    const paymentAmount = document.getElementById('paymentAmount');
    
    if (type === 'prepaid') {
        paymentTitle.textContent = 'Prepaid Top Up';
        paymentAmount.value = '';
        paymentAmount.readOnly = false;
        paymentAmount.placeholder = 'Enter top-up amount';
    } else {
        paymentTitle.textContent = 'Postpaid Bill Payment';
        paymentAmount.value = `${meter.outstanding.toFixed(2)}`;
        paymentAmount.readOnly = true;
    }
    
    paymentMeter.value = `${meter.name} (${meter.meterNo})`;
    
    // Reset form
    document.querySelectorAll('.payment-channel').forEach(c => c.classList.remove('selected'));
    document.getElementById('channelDetails').style.display = 'none';
    document.getElementById('channelInput').value = '';
    
    paymentModal.style.display = 'flex';
    paymentFormElement.style.display = 'block';
    paymentProcessing.style.display = 'none';
}

// Process payment
function processPayment(e) {
    e.preventDefault();
    
    const selectedChannel = document.querySelector('.payment-channel.selected');
    
    if (!selectedChannel) {
        showToast('Please select a payment method', true);
        return;
    }
    
    const channelInput = document.getElementById('channelInput').value;
    if (!channelInput) {
        showToast('Please provide required information', true);
        return;
    }
    
    const paymentAmount = document.getElementById('paymentAmount').value;
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
        showToast('Please enter a valid payment amount', true);
        return;
    }
    
    // Show processing state
    paymentFormElement.style.display = 'none';
    paymentProcessing.style.display = 'block';
    
    // Simulate API call
    setTimeout(() => {
        paymentModal.style.display = 'none';
        showToast('Payment processed successfully!');
        
        // Update the meter data from the API response
        updateMeterAfterPayment(parseFloat(paymentAmount));
    }, 3000);
}

// Update meter after payment
function updateMeterAfterPayment(amount) {
    if (currentPaymentMeter) {
        if (currentPaymentMeter.type === 'postpaid') {
            currentPaymentMeter.outstanding = 0;
            showToast(`Bill payment of ৳${amount} successful! Outstanding balance cleared.`);
        } else {
            currentPaymentMeter.credit += amount;
            showToast(`Top-up of ৳${amount} successful! New credit balance: ৳${currentPaymentMeter.credit.toFixed(2)}`);
        }
        
        currentPaymentMeter.lastUpdated = "Just now";
        renderMeters();
        updateTotalOutstanding();
    }
}

// View meter details
function viewMeterDetails(meterId) {
    const meter = meters.find(m => m.id === meterId);
    const details = `
Meter Details:

Name: ${meter.name}
Type: ${meter.type}
Meter No: ${meter.meterNo}
Consumer No: ${meter.consumerNo}
${meter.type === 'prepaid' ? 'Credit: ৳ ' + meter.credit.toFixed(2) : 'Outstanding: ৳ ' + meter.outstanding.toFixed(2)}
Last Updated: ${meter.lastUpdated}
Status: ${meter.status}
${meter.type === 'postpaid' ? 'Due Date: ' + meter.dueDate : ''}
    `.trim();
    
    alert(details);
}

// Show toast notification
function showToast(message, isError = false) {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Start live updates
function startLiveUpdates() {
    // Update every minute
    setInterval(() => {
        fetchMeterData();
    }, 60000);
    
    // Initial update
    updateLastUpdatedTime();
}

// Fetch meter data from API
function fetchMeterData() {
    // In a real application, this would fetch data from the NESCO API
    // For demo purposes, we'll simulate API calls with realistic data
    
    // Simulate API call delay
    setTimeout(() => {
        // Update meter data with realistic changes
        meters.forEach(meter => {
            if (meter.type === 'prepaid') {
                // Simulate realistic credit decrease for prepaid (based on usage)
                const usageRate = 0.15 + (Math.random() * 0.1); // 0.15-0.25 BDT per minute
                meter.credit = Math.max(0, meter.credit - usageRate);
            } else {
                // For postpaid, we might get updated bill information
                // Simulate small random fluctuation
                const fluctuation = (Math.random() - 0.5) * 5;
                meter.outstanding = Math.max(0, meter.outstanding + fluctuation);
            }
            
            meter.lastUpdated = "Just now";
        });
        
        renderMeters();
        updateTotalOutstanding();
        updateLastUpdatedTime();
        
        // Show success notification occasionally
        if (Math.random() > 0.7) {
            showToast('Meter data updated successfully');
        }
    }, 1000);
}

// Update total outstanding amount
function updateTotalOutstanding() {
    const total = meters
        .filter(meter => meter.type === 'postpaid')
        .reduce((sum, meter) => sum + meter.outstanding, 0);
    
    totalOutstandingEl.textContent = total.toFixed(2);
}

// Update last updated time
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    lastUpdatedEl.textContent = `${timeString}`;
}

// Update current year in footer
function updateCurrentYear() {
    currentYearEl.textContent = new Date().getFullYear();
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
