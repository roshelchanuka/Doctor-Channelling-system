package com.example.doctorchannelling.service;

import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

@Service
public class ReportService {

    public byte[] generatePdfReport(String category) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            
            if ("patient".equals(category)) {
                document.add(new Paragraph("Doctor Channelling System - Patient Demographics Report"));
                document.add(new Paragraph("Total Patients: 1200"));
                document.add(new Paragraph("Male: 600"));
                document.add(new Paragraph("Female: 600"));
            } else if ("doctor".equals(category)) {
                document.add(new Paragraph("Doctor Channelling System - Doctor Performance Report"));
                document.add(new Paragraph("Top Doctor: Dr. Smith"));
                document.add(new Paragraph("Total Appointments: 350"));
                document.add(new Paragraph("Average Rating: 4.8/5"));
            } else {
                document.add(new Paragraph("Doctor Channelling System - Monthly Report"));
                document.add(new Paragraph("Patient Count: 150"));
                document.add(new Paragraph("Most Active Day: Monday"));
                document.add(new Paragraph("Total Income: LKR 450,000"));
            }
            
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] generateExcelReport(String category) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            if ("patient".equals(category)) {
                var sheet = workbook.createSheet("Patient Demographics");
                var row = sheet.createRow(0);
                row.createCell(0).setCellValue("Metric");
                row.createCell(1).setCellValue("Value");

                row = sheet.createRow(1);
                row.createCell(0).setCellValue("Total Patients");
                row.createCell(1).setCellValue("1200");

                row = sheet.createRow(2);
                row.createCell(0).setCellValue("Male");
                row.createCell(1).setCellValue("600");

                row = sheet.createRow(3);
                row.createCell(0).setCellValue("Female");
                row.createCell(1).setCellValue("600");
            } else if ("doctor".equals(category)) {
                var sheet = workbook.createSheet("Doctor Performance");
                var row = sheet.createRow(0);
                row.createCell(0).setCellValue("Metric");
                row.createCell(1).setCellValue("Value");

                row = sheet.createRow(1);
                row.createCell(0).setCellValue("Top Doctor");
                row.createCell(1).setCellValue("Dr. Smith");

                row = sheet.createRow(2);
                row.createCell(0).setCellValue("Total Appointments");
                row.createCell(1).setCellValue("350");

                row = sheet.createRow(3);
                row.createCell(0).setCellValue("Average Rating");
                row.createCell(1).setCellValue("4.8/5");
            } else {
                var sheet = workbook.createSheet("Monthly Report");
                var row = sheet.createRow(0);
                row.createCell(0).setCellValue("Metric");
                row.createCell(1).setCellValue("Value");

                row = sheet.createRow(1);
                row.createCell(0).setCellValue("Patient Count");
                row.createCell(1).setCellValue("150");

                row = sheet.createRow(2);
                row.createCell(0).setCellValue("Total Income (LKR)");
                row.createCell(1).setCellValue("450000");
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }
}
