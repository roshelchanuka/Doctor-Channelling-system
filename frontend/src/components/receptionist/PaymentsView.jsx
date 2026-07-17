import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentsView = ({ token, receptionistId }) => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [appointmentId, setAppointmentId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get('http://localhost:8085/api/payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching payments:", error);
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8085/api/payments/record', {
                appointmentId: parseInt(appointmentId),
                paymentMethod: paymentMethod,
                receptionistId: parseInt(receptionistId)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Payment recorded successfully!");
            setAppointmentId('');
            fetchPayments();
        } catch (error) {
            console.error("Error recording payment:", error);
            alert(error.response?.data?.error || "Failed to record payment.");
        }
    };

    const handlePrintBill = (payment) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Receipt - #${payment.paymentId}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0369a1; padding-bottom: 20px; }
                        .header h2 { margin: 0 0 10px 0; color: #0369a1; }
                        .details { margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
                        .details div { margin-bottom: 12px; font-size: 14px; }
                        .details strong { display: inline-block; width: 150px; color: #475569; }
                        .amount { font-size: 24px; font-weight: bold; text-align: center; margin-top: 30px; background: #e0f2fe; padding: 20px; border-radius: 8px; color: #0369a1; border: 1px dashed #0ea5e9;}
                        .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>DocChannel Clinic</h2>
                        <p style="margin:0; color:#64748b;">Official Payment Receipt</p>
                    </div>
                    <div class="details">
                        <div><strong>Receipt No:</strong> #${payment.paymentId}</div>
                        <div><strong>Date:</strong> ${new Date(payment.paymentDate).toLocaleString()}</div>
                        <div><strong>Appointment No:</strong> #${payment.appointment?.appointmentId || 'N/A'}</div>
                        <div><strong>Payment Method:</strong> ${payment.paymentMethod}</div>
                        <div><strong>Status:</strong> ${payment.paymentStatus}</div>
                    </div>
                    <div class="amount">
                        Total Paid: ${parseFloat(payment.amount).toFixed(2)} LKR
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing DocChannel Clinic!</p>
                        <p>This is a computer-generated receipt and does not require a signature.</p>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    if (loading) return <div>Loading payments...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Record Payment Form */}
            <div className="receptionist-form-container" style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)'}}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--receptionist-text-primary)' }}>Record New Payment</h3>
                <form onSubmit={handleRecordPayment} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>Appointment ID</label>
                        <input 
                            type="number" 
                            value={appointmentId} 
                            onChange={(e) => setAppointmentId(e.target.value)} 
                            required 
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--receptionist-border)' }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        <label style={{ fontSize: '14px', color: 'var(--receptionist-text-secondary)' }}>Payment Method</label>
                        <select 
                            value={paymentMethod} 
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--receptionist-border)' }}
                        >
                            <option value="Cash">Cash</option>
                            <option value="Card">Card</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '8px 24px', height: '40px' }}>Record Payment</button>
                </form>
                <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '12px', margin: 0 }}>
                    * The payment amount is automatically fetched from the Doctor's consultation fee.
                </p>
            </div>

            {/* Payments List */}
            <div className="receptionist-form-container" style={{background: 'var(--receptionist-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--receptionist-border)'}}>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--receptionist-text-primary)' }}>Payment History</h3>
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                        <thead>
                            <tr style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                                <th style={{padding: '12px'}}>Payment ID</th>
                                <th style={{padding: '12px'}}>Appointment ID</th>
                                <th style={{padding: '12px'}}>Amount (LKR)</th>
                                <th style={{padding: '12px'}}>Method</th>
                                <th style={{padding: '12px'}}>Status</th>
                                <th style={{padding: '12px'}}>Date</th>
                                <th style={{padding: '12px'}}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr><td colSpan="7" style={{padding: '12px', textAlign: 'center'}}>No payments found.</td></tr>
                            ) : payments.map(pay => (
                                <tr key={pay.paymentId} style={{borderBottom: '1px solid var(--receptionist-border)'}}>
                                    <td style={{padding: '12px'}}>#{pay.paymentId}</td>
                                    <td style={{padding: '12px'}}>#{pay.appointment?.appointmentId}</td>
                                    <td style={{padding: '12px'}}>{pay.amount}</td>
                                    <td style={{padding: '12px'}}>{pay.paymentMethod}</td>
                                    <td style={{padding: '12px'}}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: pay.paymentStatus === 'Completed' ? '#dcfce7' : '#fee2e2',
                                            color: pay.paymentStatus === 'Completed' ? '#15803d' : '#b91c1c'
                                        }}>
                                            {pay.paymentStatus}
                                        </span>
                                    </td>
                                    <td style={{padding: '12px'}}>{new Date(pay.paymentDate).toLocaleString()}</td>
                                    <td style={{padding: '12px'}}>
                                        <button 
                                            onClick={() => handlePrintBill(pay)}
                                            style={{
                                                padding: '6px 12px', 
                                                backgroundColor: '#0f172a', 
                                                color: 'white', 
                                                border: 'none', 
                                                borderRadius: '6px', 
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            🖨️ Print Bill
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentsView;
