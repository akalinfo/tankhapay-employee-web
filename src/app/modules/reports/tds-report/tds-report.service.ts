import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Inline interface
interface TdsReport {
  deducteeName: string;
  pan: string;
  amount: number;
  tdsDeducted: number;
  section: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class TdsReportService {
  // Dummy data for reports
  private dummyReports: { [key: string]: TdsReport[] } = {
    'monthly_01': [
      { deducteeName: 'John Doe', pan: 'ABCDE1234F', amount: 50000, tdsDeducted: 5000, section: '194A', date: '2025-01-15' },
      { deducteeName: 'Jane Smith', pan: 'FGHIJ5678K', amount: 75000, tdsDeducted: 7500, section: '194C', date: '2025-01-20' },
      { deducteeName: 'Acme Corp', pan: 'XYZAB9012C', amount: 100000, tdsDeducted: 10000, section: '194H', date: '2025-01-25' }
    ],
    'monthly_02': [
      { deducteeName: 'John Doe', pan: 'ABCDE1234F', amount: 60000, tdsDeducted: 6000, section: '194A', date: '2025-02-10' },
      { deducteeName: 'Jane Smith', pan: 'FGHIJ5678K', amount: 80000, tdsDeducted: 8000, section: '194C', date: '2025-02-15' }
    ],
    'quarterly_Q1': [
      { deducteeName: 'John Doe', pan: 'ABCDE1234F', amount: 150000, tdsDeducted: 15000, section: '194A', date: '2025-04-30' },
      { deducteeName: 'Jane Smith', pan: 'FGHIJ5678K', amount: 225000, tdsDeducted: 22500, section: '194C', date: '2025-05-15' },
      { deducteeName: 'Acme Corp', pan: 'XYZAB9012C', amount: 300000, tdsDeducted: 30000, section: '194H', date: '2025-06-10' }
    ],
    'quarterly_Q2': [
      { deducteeName: 'John Doe', pan: 'ABCDE1234F', amount: 180000, tdsDeducted: 18000, section: '194A', date: '2025-07-20' },
      { deducteeName: 'Jane Smith', pan: 'FGHIJ5678K', amount: 250000, tdsDeducted: 25000, section: '194C', date: '2025-08-15' }
    ],
    'quarterly_Q3': [
      { deducteeName: 'Acme Corp', pan: 'XYZAB9012C', amount: 350000, tdsDeducted: 35000, section: '194H', date: '2025-10-25' }
    ],
    'quarterly_Q4': [
      { deducteeName: 'John Doe', pan: 'ABCDE1234F', amount: 200000, tdsDeducted: 20000, section: '194A', date: '2025-01-10' }
    ]
  };

  constructor() {}

  getReports(reportType: string, period: string): Observable<TdsReport[]> {
    const key = `${reportType}_${period}`;
    return of(this.dummyReports[key] || []);
  }

  downloadReport(reportType: string, period: string, format: 'pdf' | 'excel'): Observable<Blob> {
    const key = `${reportType}_${period}`;
    const reports = this.dummyReports[key] || [];
    
    if (format === 'pdf') {
      // Simulate PDF generation
      const content = reports.map(r => 
        `Name: ${r.deducteeName}, PAN: ${r.pan}, Amount: ${r.amount}, TDS: ${r.tdsDeducted}, Section: ${r.section}, Date: ${r.date}`
      ).join('\n');
      const blob = new Blob([content], { type: 'application/pdf' });
      return of(blob);
    } else {
      // Simulate Excel generation
      const content = ['Deductee Name,PAN,Amount,TDS Deducted,Section,Date', 
        ...reports.map(r => 
          `${r.deducteeName},${r.pan},${r.amount},${r.tdsDeducted},${r.section},${r.date}`
        )].join('\n');
      const blob = new Blob([content], { type: 'text/csv' });
      return of(blob);
    }
  }
}