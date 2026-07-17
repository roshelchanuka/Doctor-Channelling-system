package com.example.doctorchannelling.controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.service.ReportService;
@RestController
@RequestMapping("/api/reports")
public class ReportController {
    @Autowired
    private ReportService reportService;
    @GetMapping("/{category}/pdf")
    public ResponseEntity<byte[]> getPdfReport(@PathVariable("category") String category) {
        byte[] pdfBytes = reportService.generatePdfReport(category);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", category + "_report.pdf");
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    @GetMapping("/{category}/excel")
    public ResponseEntity<byte[]> getExcelReport(@PathVariable("category") String category) {
        byte[] excelBytes = reportService.generateExcelReport(category);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", category + "_report.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}
