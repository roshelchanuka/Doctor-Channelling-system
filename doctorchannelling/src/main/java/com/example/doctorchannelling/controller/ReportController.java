package com.example.doctorchannelling.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> getPdfReport() {
        byte[] pdfBytes = reportService.generatePdfReport();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "monthly_report.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> getExcelReport() {
        byte[] excelBytes = reportService.generateExcelReport();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "monthly_report.xlsx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}
