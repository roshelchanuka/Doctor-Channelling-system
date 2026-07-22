package com.example.doctorchannelling.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import com.example.doctorchannelling.repository.PatientRepository;
import com.example.doctorchannelling.repository.AppointmentRepository;
import com.example.doctorchannelling.repository.PaymentRepository;
import com.example.doctorchannelling.repository.ReviewRepository;

@Service
public class ReportService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public byte[] generatePdfReport(String category, LocalDate startDate, LocalDate endDate) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            
            LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
            LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

            if ("patient".equals(category)) {
                long totalPatients = patientRepository.countTotalPatientsByDateRange(startDateTime, endDateTime);
                long activePatients = patientRepository.countPatientsByActiveStatusAndDateRange(true, startDateTime, endDateTime);
                long inactivePatients = patientRepository.countPatientsByActiveStatusAndDateRange(false, startDateTime, endDateTime);

                document.add(new Paragraph("Doctor Channelling System - Patient Demographics Report"));
                addDateRangeText(document, startDate, endDate);
                document.add(new Paragraph("Total Patients: " + totalPatients));
                document.add(new Paragraph("Active Patients: " + activePatients));
                document.add(new Paragraph("Inactive Patients: " + inactivePatients));
            } else if ("doctor".equals(category)) {
                List<Object[]> topDoctors = appointmentRepository.findTopDoctorsByAppointmentCount(startDate, endDate, PageRequest.of(0, 1));
                String topDoctor = topDoctors.isEmpty() ? "N/A" : (String) topDoctors.get(0)[0];
                long totalAppointments = appointmentRepository.countAppointmentsByDateRange(startDate, endDate);
                Double avgRatingObj = reviewRepository.getAverageRatingByDateRange(startDateTime, endDateTime);
                double avgRating = avgRatingObj != null ? avgRatingObj : 0.0;

                document.add(new Paragraph("Doctor Channelling System - Doctor Performance Report"));
                addDateRangeText(document, startDate, endDate);
                document.add(new Paragraph("Top Doctor: " + topDoctor));
                document.add(new Paragraph("Total Appointments: " + totalAppointments));
                document.add(new Paragraph("Average Rating: " + String.format("%.2f", avgRating) + "/5"));
            } else {
                long patientCount = appointmentRepository.countUniquePatientsByDateRange(startDate, endDate);
                BigDecimal totalIncomeObj = paymentRepository.sumCompletedPayments(startDateTime, endDateTime);
                BigDecimal totalIncome = totalIncomeObj != null ? totalIncomeObj : BigDecimal.ZERO;

                document.add(new Paragraph("Doctor Channelling System - Monthly Report"));
                addDateRangeText(document, startDate, endDate);
                document.add(new Paragraph("Unique Patients Count: " + patientCount));
                document.add(new Paragraph("Total Income: LKR " + totalIncome));
            }
            
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] generateExcelReport(String category, LocalDate startDate, LocalDate endDate) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
            LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

            if ("patient".equals(category)) {
                long totalPatients = patientRepository.countTotalPatientsByDateRange(startDateTime, endDateTime);
                long activePatients = patientRepository.countPatientsByActiveStatusAndDateRange(true, startDateTime, endDateTime);
                long inactivePatients = patientRepository.countPatientsByActiveStatusAndDateRange(false, startDateTime, endDateTime);

                var sheet = workbook.createSheet("Patient Demographics");
                var row = sheet.createRow(0);
                row.createCell(0).setCellValue("Metric");
                row.createCell(1).setCellValue("Value");

                row = sheet.createRow(1);
                row.createCell(0).setCellValue("Date Range");
                row.createCell(1).setCellValue(getDateRangeString(startDate, endDate));

                row = sheet.createRow(2);
                row.createCell(0).setCellValue("Total Patients");
                row.createCell(1).setCellValue(String.valueOf(totalPatients));

                row = sheet.createRow(3);
                row.createCell(0).setCellValue("Active Patients");
                row.createCell(1).setCellValue(String.valueOf(activePatients));

                row = sheet.createRow(4);
                row.createCell(0).setCellValue("Inactive Patients");
                row.createCell(1).setCellValue(String.valueOf(inactivePatients));
            } else if ("doctor".equals(category)) {
                List<Object[]> topDoctors = appointmentRepository.findTopDoctorsByAppointmentCount(startDate, endDate, PageRequest.of(0, 1));
                String topDoctor = topDoctors.isEmpty() ? "N/A" : (String) topDoctors.get(0)[0];
                long totalAppointments = appointmentRepository.countAppointmentsByDateRange(startDate, endDate);
                Double avgRatingObj = reviewRepository.getAverageRatingByDateRange(startDateTime, endDateTime);
                double avgRating = avgRatingObj != null ? avgRatingObj : 0.0;

                var sheet = workbook.createSheet("Doctor Performance");
                var row = sheet.createRow(0);
                row.createCell(0).setCellValue("Metric");
                row.createCell(1).setCellValue("Value");

                row = sheet.createRow(1);
                row.createCell(0).setCellValue("Date Range");
                row.createCell(1).setCellValue(getDateRangeString(startDate, endDate));

                row = sheet.createRow(2);
                row.createCell(0).setCellValue("Top Doctor");
                row.createCell(1).setCellValue(topDoctor);

                row = sheet.createRow(3);
                row.createCell(0).setCellValue("Total Appointments");
                row.createCell(1).setCellValue(String.valueOf(totalAppointments));

                row = sheet.createRow(4);
                row.createCell(0).setCellValue("Average Rating");
                row.createCell(1).setCellValue(String.format("%.2f", avgRating) + "/5");
            } else {
                long patientCount = appointmentRepository.countUniquePatientsByDateRange(startDate, endDate);
                BigDecimal totalIncomeObj = paymentRepository.sumCompletedPayments(startDateTime, endDateTime);
                BigDecimal totalIncome = totalIncomeObj != null ? totalIncomeObj : BigDecimal.ZERO;

                var sheet = workbook.createSheet("Monthly Report");
                var row = sheet.createRow(0);
                row.createCell(0).setCellValue("Metric");
                row.createCell(1).setCellValue("Value");

                row = sheet.createRow(1);
                row.createCell(0).setCellValue("Date Range");
                row.createCell(1).setCellValue(getDateRangeString(startDate, endDate));

                row = sheet.createRow(2);
                row.createCell(0).setCellValue("Unique Patients Count");
                row.createCell(1).setCellValue(String.valueOf(patientCount));

                row = sheet.createRow(3);
                row.createCell(0).setCellValue("Total Income (LKR)");
                row.createCell(1).setCellValue(totalIncome.toString());
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }

    private void addDateRangeText(Document document, LocalDate startDate, LocalDate endDate) throws Exception {
        String range = getDateRangeString(startDate, endDate);
        document.add(new Paragraph("Date Range: " + range));
        document.add(new Paragraph(" "));
    }

    private String getDateRangeString(LocalDate startDate, LocalDate endDate) {
        if (startDate == null && endDate == null) return "All Time";
        if (startDate != null && endDate == null) return "From " + startDate.toString();
        if (startDate == null && endDate != null) return "Until " + endDate.toString();
        return startDate.toString() + " to " + endDate.toString();
    }
}
