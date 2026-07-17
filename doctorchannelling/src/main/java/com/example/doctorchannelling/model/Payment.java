package com.example.doctorchannelling.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PaymentID")
    private Integer paymentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "AppointmentID", nullable = false)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ReceptionistID")
    private Receptionist receptionist;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "Currency", nullable = false, length = 3)
    private String currency = "LKR";

    @Column(name = "PaymentMethod", nullable = false, length = 50)
    private String paymentMethod;

    @Column(name = "PaymentGateway", length = 50)
    private String paymentGateway;

    @Column(name = "GatewayTransactionID", length = 150)
    private String gatewayTransactionId;

    @Column(name = "IdempotencyKey", nullable = false, updatable = false)
    private String idempotencyKey = java.util.UUID.randomUUID().toString();

    @Column(name = "PaymentStatus", nullable = false, length = 50)
    private String paymentStatus = "Pending";

    @Column(name = "RefundedAmount", nullable = false)
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    @Column(name = "RefundReason")
    private String refundReason;

    @Column(name = "RefundedAt")
    private LocalDateTime refundedAt;

    @Column(name = "PaymentDate", updatable = false)
    private LocalDateTime paymentDate;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        paymentDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (idempotencyKey == null) {
            idempotencyKey = java.util.UUID.randomUUID().toString();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public Receptionist getReceptionist() {
        return receptionist;
    }

    public void setReceptionist(Receptionist receptionist) {
        this.receptionist = receptionist;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentGateway() {
        return paymentGateway;
    }

    public void setPaymentGateway(String paymentGateway) {
        this.paymentGateway = paymentGateway;
    }

    public String getGatewayTransactionId() {
        return gatewayTransactionId;
    }

    public void setGatewayTransactionId(String gatewayTransactionId) {
        this.gatewayTransactionId = gatewayTransactionId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public BigDecimal getRefundedAmount() {
        return refundedAmount;
    }

    public void setRefundedAmount(BigDecimal refundedAmount) {
        this.refundedAmount = refundedAmount;
    }

    public String getRefundReason() {
        return refundReason;
    }

    public void setRefundReason(String refundReason) {
        this.refundReason = refundReason;
    }

    public LocalDateTime getRefundedAt() {
        return refundedAt;
    }

    public void setRefundedAt(LocalDateTime refundedAt) {
        this.refundedAt = refundedAt;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
