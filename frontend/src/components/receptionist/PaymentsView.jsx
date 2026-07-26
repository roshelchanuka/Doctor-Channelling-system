import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsView = ({ token, receptionistId }) => {
    const [payments, setPayments] = useState([]);
    const [pendingBills, setPendingBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('walkin'); // 'walkin', 'billing' or 'history'
    
    // Search states for billing & history
    const [pendingSearch, setPendingSearch] = useState('');
    const [historySearch, setHistorySearch] = useState('');

    // --- POS Walk-In States ---
    const [specializationSearch, setSpecializationSearch] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorSlots, setDoctorSlots] = useState([]);
    
    // Walk-in form
    const [walkInForm, setWalkInForm] = useState({
        patientName: '',
        patientMobile: '',
        slotId: '',
        paymentMethod: 'Cash',
        cashGiven: ''
    });
    const [isProcessingWalkIn, setIsProcessingWalkIn] = useState(false);

    // --- POS Pending Bill States ---
    const [selectedBill, setSelectedBill] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [cashGiven, setCashGiven] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pendingRes, historyRes] = await Promise.all([
                axios.get('http://localhost:8085/api/payments/pending', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8085/api/payments', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPendingBills(pendingRes.data);
            setPayments(historyRes.data);
        } catch (error) {
            console.error("Error fetching billing data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Also fetch initial list of all doctors for Walk-In tab
        fetchDoctors('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Walk-In Booking Logic ---
    const fetchDoctors = async (spec) => {
        try {
            const res = await axios.get(`http://localhost:8085/api/doctors?specialization=${spec}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setDoctors(res.data);
        } catch (err) {
            console.error("Error fetching doctors:", err);
        }
    };

    const handleSpecializationChange = (e) => {
        const val = e.target.value;
        setSpecializationSearch(val);
        fetchDoctors(val);
    };

    const handleSelectDoctor = async (doc) => {
        setSelectedDoctor(doc);
        setWalkInForm(prev => ({ ...prev, slotId: '' })); // reset slot
        try {
            const res = await axios.get(`http://localhost:8085/api/slots/doctor/${doc.doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctorSlots(res.data);
        } catch (err) {
            console.error("Error fetching slots:", err);
            setDoctorSlots([]);
        }
    };

    const handleWalkInBooking = async (e) => {
        e.preventDefault();
        if (!selectedDoctor || !walkInForm.slotId || !walkInForm.patientName || !walkInForm.patientMobile) {
            alert("Please fill all patient details and select a time slot.");
            return;
        }

        if (walkInForm.paymentMethod === 'Cash') {
            const amountGiven = parseFloat(walkInForm.cashGiven);
            const totalDue = parseFloat(selectedDoctor.consultationFee);
            if (isNaN(amountGiven) || amountGiven < totalDue) {
                alert("Please enter a valid cash amount that covers the total due.");
                return;
            }
        }

        setIsProcessingWalkIn(true);
        try {
            const payload = {
                patientName: walkInForm.patientName,
                patientMobile: walkInForm.patientMobile,
                slotId: parseInt(walkInForm.slotId),
                paymentMethod: walkInForm.paymentMethod,
                receptionistId: parseInt(receptionistId)
            };

            const response = await axios.post('http://localhost:8085/api/receptionists/walkin-book', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert("Walk-In Appointment Booked & Paid successfully!");
            
            // Print Receipt
            const resultData = response.data;
            handlePrintWalkInReceipt(resultData, selectedDoctor, walkInForm.cashGiven);
            
            // Reset form
            setSelectedDoctor(null);
            setWalkInForm({ patientName: '', patientMobile: '', slotId: '', paymentMethod: 'Cash', cashGiven: '' });
            fetchData();
        } catch (error) {
            console.error("Error walkin booking:", error);
            alert(error.response?.data?.error || "Failed to book walk-in appointment.");
        } finally {
            setIsProcessingWalkIn(false);
        }
    };

    const handlePrintWalkInReceipt = (resultData, doctorDetails, cashGivenAmt) => {
        const printWindow = window.open('', '_blank');
        const paymentRecord = resultData.payment;
        const totalAmount = doctorDetails.consultationFee;
        
        let receiptHtml = `
            <html>
                <head>
                    <title>Walk-In Receipt - Appt #${resultData.appointmentId}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 400px; margin: 0 auto; color: #000; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                        .header h2 { margin: 0 0 5px 0; font-size: 20px; }
                        .header p { margin: 0; font-size: 12px; }
                        .queue-box { margin: 15px 0; padding: 15px; border: 2px solid #000; text-align: center; }
                        .queue-box h1 { margin: 0; font-size: 36px; }
                        .queue-box p { margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; }
                        .details { margin-bottom: 20px; font-size: 14px; }
                        .details table { width: 100%; }
                        .details td { padding: 4px 0; }
                        .details td:last-child { text-align: right; }
                        .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 20px; }
                        .items table { width: 100%; font-size: 14px; }
                        .items th { text-align: left; padding-bottom: 5px; }
                        .items td { padding: 4px 0; }
                        .items td:last-child, .items th:last-child { text-align: right; }
                        .totals { width: 100%; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
                        .totals td { padding: 5px 0; }
                        .totals td:last-child { text-align: right; }
                        .footer { text-align: center; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>DOC-CHANNEL CLINIC</h2>
                        <p>123 Medical Center Way</p>
                        <p>Tel: +94 11 234 5678</p>
                        <p style="margin-top: 10px; font-weight: bold;">WALK-IN OFFICIAL RECEIPT</p>
                    </div>

                    <div class="queue-box">
                        <p>Your Queue Number</p>
                        <h1>#${resultData.queueNumber}</h1>
                    </div>
                    
                    <div class="details">
                        <table>
                            <tr><td>Date:</td><td>${new Date(paymentRecord.paymentDate).toLocaleString()}</td></tr>
                            <tr><td>Receipt No:</td><td>#${paymentRecord.paymentId}</td></tr>
                            <tr><td>Appt No:</td><td>#${resultData.appointmentId}</td></tr>
                            <tr><td>Patient:</td><td>${resultData.patientName}</td></tr>
                            <tr><td>Doctor:</td><td>Dr. ${doctorDetails.doctorName}</td></tr>
                            <tr><td>Pay Method:</td><td>${paymentRecord.paymentMethod}</td></tr>
                        </table>
                    </div>
                    
                    <div class="items">
                        <table>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                            <tr>
                                <td>Doctor Consultation Fee</td>
                                <td>${parseFloat(totalAmount).toFixed(2)} LKR</td>
                            </tr>
                        </table>
                    </div>
                    
                    <table class="totals">
                        <tr>
                            <td>TOTAL DUE:</td>
                            <td>${parseFloat(totalAmount).toFixed(2)} LKR</td>
                        </tr>
                        ${paymentRecord.paymentMethod === 'Cash' && cashGivenAmt ? `
                        <tr style="font-size: 14px; font-weight: normal;">
                            <td>Cash Tendered:</td>
                            <td>${parseFloat(cashGivenAmt).toFixed(2)} LKR</td>
                        </tr>
                        <tr style="font-size: 14px; font-weight: normal;">
                            <td>Change/Balance:</td>
                            <td>${(parseFloat(cashGivenAmt) - parseFloat(totalAmount)).toFixed(2)} LKR</td>
                        </tr>
                        ` : ''}
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for choosing Doc-Channel!</p>
                        <p>Please wait in the seating area until your queue number is called.</p>
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    // --- End Walk-In Booking Logic ---

    const handleSelectBill = (bill) => {
        setSelectedBill(bill);
        setPaymentMethod('Cash');
        setCashGiven('');
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!selectedBill) return;

        if (paymentMethod === 'Cash') {
            const amountGiven = parseFloat(cashGiven);
            const totalDue = parseFloat(selectedBill.consultationFee);
            if (isNaN(amountGiven) || amountGiven < totalDue) {
                alert("Please enter a valid cash amount that covers the total due.");
                return;
            }
        }

        setIsProcessing(true);
        try {
            const response = await axios.post('http://localhost:8085/api/payments/record', {
                appointmentId: selectedBill.appointmentId,
                paymentMethod: paymentMethod,
                receptionistId: parseInt(receptionistId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            alert("Payment completed successfully!");
            const savedPayment = response.data;
            handlePrintBill(savedPayment, true, selectedBill);
            
            setSelectedBill(null);
            setCashGiven('');
            fetchData();
        } catch (error) {
            console.error("Error recording payment:", error);
            alert(error.response?.data?.error || "Failed to record payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintBill = (paymentRecord, isReceipt = true, invoiceDetails = null) => {
        const printWindow = window.open('', '_blank');
        const apptId = isReceipt ? paymentRecord.appointment?.appointmentId : invoiceDetails.appointmentId;
        const ptName = isReceipt ? 'Patient' : invoiceDetails.patientName;
        const docName = isReceipt ? '' : invoiceDetails.doctorName;
        const totalAmount = isReceipt ? paymentRecord.amount : invoiceDetails.consultationFee;
        const dateStr = isReceipt ? new Date(paymentRecord.paymentDate).toLocaleString() : new Date().toLocaleString();
        
        let receiptHtml = `
            <html>
                <head>
                    <title>${isReceipt ? 'Official Receipt' : 'Proforma Invoice'} - Appt #${apptId}</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; max-width: 400px; margin: 0 auto; color: #000; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                        .header h2 { margin: 0 0 5px 0; font-size: 20px; }
                        .header p { margin: 0; font-size: 12px; }
                        .details { margin-bottom: 20px; font-size: 14px; }
                        .details table { width: 100%; }
                        .details td { padding: 4px 0; }
                        .details td:last-child { text-align: right; }
                        .items { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin-bottom: 20px; }
                        .items table { width: 100%; font-size: 14px; }
                        .items th { text-align: left; padding-bottom: 5px; }
                        .items td { padding: 4px 0; }
                        .items td:last-child, .items th:last-child { text-align: right; }
                        .totals { width: 100%; font-size: 16px; font-weight: bold; margin-bottom: 20px; }
                        .totals td { padding: 5px 0; }
                        .totals td:last-child { text-align: right; }
                        .footer { text-align: center; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>DOC-CHANNEL CLINIC</h2>
                        <p>123 Medical Center Way</p>
                        <p>Tel: +94 11 234 5678</p>
                        <p style="margin-top: 10px; font-weight: bold;">${isReceipt ? 'OFFICIAL RECEIPT' : 'PROFORMA INVOICE'}</p>
                    </div>
                    
                    <div class="details">
                        <table>
                            <tr><td>Date:</td><td>${dateStr}</td></tr>
                            ${isReceipt ? `<tr><td>Receipt No:</td><td>#${paymentRecord.paymentId}</td></tr>` : ''}
                            <tr><td>Appt No:</td><td>#${apptId}</td></tr>
                            ${!isReceipt ? `<tr><td>Patient:</td><td>${ptName}</td></tr>` : ''}
                            ${!isReceipt ? `<tr><td>Doctor:</td><td>Dr. ${docName}</td></tr>` : ''}
                            ${isReceipt ? `<tr><td>Pay Method:</td><td>${paymentRecord.paymentMethod}</td></tr>` : ''}
                        </table>
                    </div>
                    
                    <div class="items">
                        <table>
                            <tr>
                                <th>Description</th>
                                <th>Amount</th>
                            </tr>
                            <tr>
                                <td>Doctor Consultation Fee</td>
                                <td>${parseFloat(totalAmount).toFixed(2)} LKR</td>
                            </tr>
                        </table>
                    </div>
                    
                    <table class="totals">
                        <tr>
                            <td>TOTAL DUE:</td>
                            <td>${parseFloat(totalAmount).toFixed(2)} LKR</td>
                        </tr>
                        ${isReceipt && paymentRecord.paymentMethod === 'Cash' && invoiceDetails && cashGiven ? `
                        <tr style="font-size: 14px; font-weight: normal;">
                            <td>Cash Tendered:</td>
                            <td>${parseFloat(cashGiven).toFixed(2)} LKR</td>
                        </tr>
                        <tr style="font-size: 14px; font-weight: normal;">
                            <td>Change/Balance:</td>
                            <td>${(parseFloat(cashGiven) - parseFloat(totalAmount)).toFixed(2)} LKR</td>
                        </tr>
                        ` : ''}
                    </table>
                    
                    <div class="footer">
                        <p>Thank you for choosing Doc-Channel!</p>
                        <p>Get well soon.</p>
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const filteredPendingBills = pendingBills.filter(bill => 
        bill.patientName?.toLowerCase().includes(pendingSearch.toLowerCase()) || 
        bill.patientMobile?.includes(pendingSearch) ||
        bill.appointmentId?.toString().includes(pendingSearch)
    );

    const filteredHistory = payments.filter(pay => 
        pay.appointment?.appointmentId?.toString().includes(historySearch) ||
        pay.paymentId?.toString().includes(historySearch)
    );

    if (loading) return <div style={{padding: '24px', textAlign: 'center', fontSize: '18px'}}>Loading POS Terminal...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Top Navigation */}
            <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid var(--receptionist-border)', paddingBottom: '12px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('walkin')}
                    style={{
                        padding: '10px 24px', fontSize: '16px', fontWeight: 'bold',
                        backgroundColor: activeTab === 'walkin' ? '#0ea5e9' : 'transparent',
                        color: activeTab === 'walkin' ? 'white' : 'var(--receptionist-text-secondary)',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    🚶 Walk-In Booking
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    style={{
                        padding: '10px 24px', fontSize: '16px', fontWeight: 'bold',
                        backgroundColor: activeTab === 'billing' ? '#0ea5e9' : 'transparent',
                        color: activeTab === 'billing' ? 'white' : 'var(--receptionist-text-secondary)',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    📠 Pending Online Bills
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '10px 24px', fontSize: '16px', fontWeight: 'bold',
                        backgroundColor: activeTab === 'history' ? '#0ea5e9' : 'transparent',
                        color: activeTab === 'history' ? 'white' : 'var(--receptionist-text-secondary)',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    📋 Payment History
                </button>
            </div>

            {/* --- 1. Walk-In Booking Tab --- */}
            {activeTab === 'walkin' && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    
                    {/* LEFT PANEL: Search & Select Doctor */}
                    <div style={{ 
                        flex: '1', background: 'var(--receptionist-card)', padding: '20px', 
                        borderRadius: '12px', border: '1px solid var(--receptionist-border)',
                        height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--receptionist-text-primary)' }}>Find Doctor by Specialization</h3>
                        <input 
                            type="text" 
                            placeholder="e.g. Eye, Cardiologist..." 
                            value={specializationSearch}
                            onChange={handleSpecializationChange}
                            style={{ 
                                padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                                width: '100%', boxSizing: 'border-box', marginBottom: '15px', fontSize: '15px'
                            }}
                        />
                        
                        <div style={{ overflowY: 'auto', flex: '1', paddingRight: '5px' }}>
                            {doctors.length === 0 ? (
                                <div style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>No doctors found.</div>
                            ) : doctors.map(doc => (
                                <div 
                                    key={doc.doctorId}
                                    onClick={() => handleSelectDoctor(doc)}
                                    style={{
                                        padding: '15px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer',
                                        border: selectedDoctor?.doctorId === doc.doctorId ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                                        backgroundColor: selectedDoctor?.doctorId === doc.doctorId ? '#f0f9ff' : 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>Dr. {doc.doctorName}</span>
                                        <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{doc.specialization}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>Fee: {doc.consultationFee} LKR</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT PANEL: Walk-In Booking Form */}
                    <div style={{ 
                        flex: '1.2', background: 'var(--receptionist-card)', padding: '0', 
                        borderRadius: '12px', border: '1px solid var(--receptionist-border)',
                        overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ background: '#0f172a', padding: '15px 20px', color: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>Walk-In Booking & Billing</h2>
                        </div>
                        
                        {!selectedDoctor ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🧑‍⚕️</div>
                                <h2>No Doctor Selected</h2>
                                <p>Search and select a doctor to begin walk-in registration.</p>
                            </div>
                        ) : (
                            <div style={{ padding: '20px' }}>
                                
                                {/* Doctor Summary */}
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ color: '#64748b' }}>Doctor:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Dr. {selectedDoctor.doctorName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Due:</span>
                                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
                                            {parseFloat(selectedDoctor.consultationFee).toFixed(2)} LKR
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleWalkInBooking}>
                                    
                                    {/* Patient Details */}
                                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#ffffff' }}>
                                        <h4 style={{ margin: '0 0 15px 0', color: '#334155' }}>Patient & Appointment Details</h4>
                                        
                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Mobile Number</label>
                                                <input 
                                                    type="text" 
                                                    required 
                                                    value={walkInForm.patientMobile}
                                                    onChange={e => setWalkInForm({...walkInForm, patientMobile: e.target.value})}
                                                    placeholder="07XXXXXXXX"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Patient Name</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={walkInForm.patientName}
                                                    onChange={e => setWalkInForm({...walkInForm, patientName: e.target.value})}
                                                    placeholder="Full Name"
                                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Time Slot Dropdown */}
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '5px' }}>Select Time Slot</label>
                                            <select 
                                                required
                                                value={walkInForm.slotId}
                                                onChange={e => setWalkInForm({...walkInForm, slotId: e.target.value})}
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                                            >
                                                <option value="">-- Choose an Available Slot --</option>
                                                {doctorSlots.map(slot => (
                                                    <option key={slot.slotId} value={slot.slotId}>
                                                        {slot.dayOfWeek} | {slot.startTime} - {slot.endTime} 
                                                        (Max: {slot.maxPatients})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>Payment Method</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {['Cash', 'Card'].map(method => (
                                                <button 
                                                    key={method} 
                                                    type="button"
                                                    onClick={() => {
                                                        setWalkInForm({...walkInForm, paymentMethod: method, cashGiven: ''});
                                                    }}
                                                    style={{
                                                        flex: 1, padding: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                                                        border: walkInForm.paymentMethod === method ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                                                        borderRadius: '8px',
                                                        backgroundColor: walkInForm.paymentMethod === method ? '#e0f2fe' : 'white',
                                                        color: walkInForm.paymentMethod === method ? '#0369a1' : '#64748b',
                                                    }}
                                                >
                                                    {method === 'Cash' ? '💵' : '💳'} {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cash Calculator Box */}
                                    {walkInForm.paymentMethod === 'Cash' && (
                                        <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <label style={{ fontWeight: 'bold', color: '#065f46', fontSize: '16px' }}>Cash Given (LKR):</label>
                                                <input 
                                                    type="number" 
                                                    value={walkInForm.cashGiven} 
                                                    onChange={(e) => setWalkInForm({...walkInForm, cashGiven: e.target.value})} 
                                                    placeholder="Enter amount..."
                                                    required
                                                    style={{ 
                                                        padding: '10px 15px', borderRadius: '8px', border: '2px solid #10b981', 
                                                        fontSize: '20px', fontWeight: 'bold', width: '150px', textAlign: 'right'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '16px' }}>Balance (Change):</span>
                                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: (parseFloat(walkInForm.cashGiven || 0) - parseFloat(selectedDoctor.consultationFee)) >= 0 ? '#059669' : '#ef4444' }}>
                                                    {walkInForm.cashGiven 
                                                        ? (parseFloat(walkInForm.cashGiven) - parseFloat(selectedDoctor.consultationFee)).toFixed(2)
                                                        : '0.00'
                                                    } LKR
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={isProcessingWalkIn}
                                        style={{
                                            width: '100%', padding: '18px', background: '#10b981', color: 'white', 
                                            border: 'none', borderRadius: '8px', cursor: 'pointer', 
                                            fontSize: '18px', fontWeight: 'bold',
                                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
                                            opacity: isProcessingWalkIn ? 0.7 : 1
                                        }}
                                    >
                                        {isProcessingWalkIn ? 'Processing...' : `Book Appointment & Print Receipt`}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- 2. POS Pending Online Bills --- */}
            {activeTab === 'billing' && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ 
                        flex: '1', background: 'var(--receptionist-card)', padding: '20px', 
                        borderRadius: '12px', border: '1px solid var(--receptionist-border)',
                        height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', color: 'var(--receptionist-text-primary)' }}>Select Patient to Bill</h3>
                        <input 
                            type="text" 
                            placeholder="Search Name, Phone, Appt ID..." 
                            value={pendingSearch}
                            onChange={(e) => setPendingSearch(e.target.value)}
                            style={{ 
                                padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', 
                                width: '100%', boxSizing: 'border-box', marginBottom: '15px', fontSize: '15px'
                            }}
                        />
                        
                        <div style={{ overflowY: 'auto', flex: '1', paddingRight: '5px' }}>
                            {filteredPendingBills.length === 0 ? (
                                <div style={{textAlign: 'center', color: '#94a3b8', padding: '20px'}}>No pending bills found.</div>
                            ) : filteredPendingBills.map(bill => (
                                <div 
                                    key={bill.appointmentId}
                                    onClick={() => handleSelectBill(bill)}
                                    style={{
                                        padding: '15px', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer',
                                        border: selectedBill?.appointmentId === bill.appointmentId ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                                        backgroundColor: selectedBill?.appointmentId === bill.appointmentId ? '#f0f9ff' : 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#0f172a' }}>{bill.patientName}</span>
                                        <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>#{bill.appointmentId}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '5px' }}>📞 {bill.patientMobile}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b' }}>👨‍⚕️ Dr. {bill.doctorName}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ 
                        flex: '1.2', background: 'var(--receptionist-card)', padding: '0', 
                        borderRadius: '12px', border: '1px solid var(--receptionist-border)',
                        overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ background: '#0f172a', padding: '15px 20px', color: 'white' }}>
                            <h2 style={{ margin: 0, fontSize: '20px' }}>Active Bill</h2>
                        </div>
                        
                        {!selectedBill ? (
                            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛒</div>
                                <h2>No Patient Selected</h2>
                                <p>Select a patient from the queue to start billing.</p>
                            </div>
                        ) : (
                            <div style={{ padding: '20px' }}>
                                {/* Invoice Summary */}
                                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #cbd5e1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ color: '#64748b' }}>Patient:</span>
                                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{selectedBill.patientName}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <span style={{ color: '#64748b' }}>Appointment ID:</span>
                                        <span style={{ fontWeight: 'bold' }}>#{selectedBill.appointmentId}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                        <span style={{ color: '#64748b' }}>Doctor:</span>
                                        <span>Dr. {selectedBill.doctorName}</span>
                                    </div>
                                    <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '0 0 15px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Due:</span>
                                        <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
                                            {parseFloat(selectedBill.consultationFee).toFixed(2)} LKR
                                        </span>
                                    </div>
                                </div>

                                <form onSubmit={handleRecordPayment}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>Payment Method</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {['Cash', 'Card', 'Online'].map(method => (
                                                <button 
                                                    key={method} 
                                                    type="button"
                                                    onClick={() => {
                                                        setPaymentMethod(method);
                                                        setCashGiven('');
                                                    }}
                                                    style={{
                                                        flex: 1, padding: '15px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px',
                                                        border: paymentMethod === method ? '2px solid #0ea5e9' : '1px solid #cbd5e1',
                                                        borderRadius: '8px',
                                                        backgroundColor: paymentMethod === method ? '#e0f2fe' : 'white',
                                                        color: paymentMethod === method ? '#0369a1' : '#64748b',
                                                    }}
                                                >
                                                    {method === 'Cash' ? '💵' : method === 'Card' ? '💳' : '🌐'} {method}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {paymentMethod === 'Cash' && (
                                        <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <label style={{ fontWeight: 'bold', color: '#065f46', fontSize: '16px' }}>Cash Given (LKR):</label>
                                                <input 
                                                    type="number" 
                                                    value={cashGiven} 
                                                    onChange={(e) => setCashGiven(e.target.value)} 
                                                    placeholder="Enter amount..."
                                                    required
                                                    style={{ 
                                                        padding: '10px 15px', borderRadius: '8px', border: '2px solid #10b981', 
                                                        fontSize: '20px', fontWeight: 'bold', width: '150px', textAlign: 'right'
                                                    }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 'bold', color: '#065f46', fontSize: '16px' }}>Balance (Change):</span>
                                                <span style={{ fontSize: '24px', fontWeight: 'bold', color: (parseFloat(cashGiven || 0) - parseFloat(selectedBill.consultationFee)) >= 0 ? '#059669' : '#ef4444' }}>
                                                    {cashGiven 
                                                        ? (parseFloat(cashGiven) - parseFloat(selectedBill.consultationFee)).toFixed(2)
                                                        : '0.00'
                                                    } LKR
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        type="submit" 
                                        disabled={isProcessing}
                                        style={{
                                            width: '100%', padding: '18px', background: '#10b981', color: 'white', 
                                            border: 'none', borderRadius: '8px', cursor: 'pointer', 
                                            fontSize: '18px', fontWeight: 'bold',
                                            boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)',
                                            opacity: isProcessing ? 0.7 : 1
                                        }}
                                    >
                                        {isProcessing ? 'Processing...' : `Complete Billing & Print Receipt`}
                                    </button>
                                    
                                    <div style={{textAlign: 'center', marginTop: '15px'}}>
                                        <button 
                                            type="button" 
                                            onClick={() => handlePrintBill(null, false, selectedBill)}
                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            Print Proforma Invoice Only (No Payment)
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- 3. Payment History Tab --- */}
            {activeTab === 'history' && (
                <div style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--receptionist-border)'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: '0', color: 'var(--receptionist-text-primary)' }}>Payment History</h2>
                        <input 
                            type="text" 
                            placeholder="Search Receipt # or Appt #..." 
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--receptionist-border)', width: '300px' }}
                        />
                    </div>
                    <div style={{overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid var(--receptionist-border)', background: '#f8fafc'}}>
                                    <th style={{padding: '15px'}}>Receipt #</th>
                                    <th style={{padding: '15px'}}>Appt #</th>
                                    <th style={{padding: '15px'}}>Amount (LKR)</th>
                                    <th style={{padding: '15px'}}>Method</th>
                                    <th style={{padding: '15px'}}>Status</th>
                                    <th style={{padding: '15px'}}>Date & Time</th>
                                    <th style={{padding: '15px'}}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr><td colSpan="7" style={{padding: '24px', textAlign: 'center', color: '#94a3b8'}}>No payments found.</td></tr>
                                ) : filteredHistory.map(pay => (
                                    <tr key={pay.paymentId} style={{borderBottom: '1px solid #f1f5f9', '&:hover': { background: '#f8fafc' }}}>
                                        <td style={{padding: '15px', fontWeight: 'bold'}}>#{pay.paymentId}</td>
                                        <td style={{padding: '15px'}}>#{pay.appointment?.appointmentId}</td>
                                        <td style={{padding: '15px', fontWeight: 'bold', color: '#0f172a'}}>{parseFloat(pay.amount).toFixed(2)}</td>
                                        <td style={{padding: '15px'}}>
                                            <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                                                {pay.paymentMethod}
                                            </span>
                                        </td>
                                        <td style={{padding: '15px'}}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                                backgroundColor: pay.paymentStatus === 'Completed' ? '#dcfce7' : '#fee2e2',
                                                color: pay.paymentStatus === 'Completed' ? '#15803d' : '#b91c1c'
                                            }}>
                                                {pay.paymentStatus}
                                            </span>
                                        </td>
                                        <td style={{padding: '15px'}}>{new Date(pay.paymentDate).toLocaleString()}</td>
                                        <td style={{padding: '15px'}}>
                                            <button 
                                                onClick={() => handlePrintBill(pay, true, null)}
                                                style={{
                                                    padding: '8px 12px', backgroundColor: '#0f172a', color: 'white', 
                                                    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold'
                                                }}
                                            >
                                                🖨️ Re-print Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentsView;
