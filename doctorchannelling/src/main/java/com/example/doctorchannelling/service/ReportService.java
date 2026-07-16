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

    public byte[] generatePdfReport() {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph("Doctor Channelling System - Monthly Report"));
            document.add(new Paragraph("Patient Count: 150"));
            document.add(new Paragraph("Most Active Day: Monday"));
            document.add(new Paragraph("Total Income: LKR 450,000"));
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
    }

    public byte[] generateExcelReport() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
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

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel", e);
        }
    }
}
