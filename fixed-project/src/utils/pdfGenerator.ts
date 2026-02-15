/**
 * PDF Generator Utility for School Fee Manager Pro
 * Developer: MWA
 * Version: 1.0.0
 * 
 * This module handles all PDF/Receipt generation including:
 * - Fee Receipt generation
 * - Salary Receipt generation  
 * - CSV export functionality
 */

import type { FeeRecord, SalaryPayment, Student } from '../types';
import { getSchoolInfo, getStudentById, getTeacherById, getClasses, formatCurrency } from '../store';

/**
 * Get month name from month number (1-12)
 */
export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Get class name by ID
 */
const getClassName = (classId: number): string => {
  const classes = getClasses();
  const classInfo = classes.find(c => c.id === classId);
  return classInfo?.className || 'N/A';
};

/**
 * Generate professional fee receipt HTML
 */
export const generateFeeReceipt = (record: FeeRecord): void => {
  const schoolInfo = getSchoolInfo();
  const student = getStudentById(record.studentId);
  
  if (!student) {
    alert('Student information not found!');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Receipt - ${record.receiptNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 2px solid #1e40af;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .header p {
      font-size: 12px;
      opacity: 0.9;
    }
    
    .receipt-title {
      background: #f0f9ff;
      padding: 15px;
      text-align: center;
      border-bottom: 2px solid #1e40af;
    }
    
    .receipt-title h2 {
      color: #1e40af;
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    .receipt-info {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      background: #fafafa;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .receipt-info div {
      text-align: center;
    }
    
    .receipt-info label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      display: block;
    }
    
    .receipt-info span {
      font-size: 16px;
      font-weight: 600;
      color: #1e40af;
    }
    
    .content {
      padding: 20px;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .student-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .info-row {
      display: flex;
    }
    
    .info-row label {
      width: 120px;
      color: #6b7280;
      font-size: 12px;
    }
    
    .info-row span {
      font-weight: 500;
    }
    
    .fee-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .fee-table th,
    .fee-table td {
      padding: 12px;
      text-align: left;
      border: 1px solid #e5e7eb;
    }
    
    .fee-table th {
      background: #f3f4f6;
      font-size: 12px;
      text-transform: uppercase;
      color: #374151;
    }
    
    .fee-table td {
      font-size: 14px;
    }
    
    .fee-table .amount {
      text-align: right;
      font-weight: 500;
    }
    
    .fee-table .total-row {
      background: #1e40af;
      color: white;
    }
    
    .fee-table .total-row td {
      font-weight: 700;
      font-size: 16px;
      border-color: #1e40af;
    }
    
    .fee-table .deduction {
      color: #dc2626;
    }
    
    .fee-table .addition {
      color: #16a34a;
    }
    
    .payment-info {
      background: #f0fdf4;
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    
    .payment-info h4 {
      color: #16a34a;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
    }
    
    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .amount-words {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    
    .amount-words label {
      font-size: 11px;
      color: #92400e;
      text-transform: uppercase;
    }
    
    .amount-words p {
      font-size: 14px;
      font-weight: 600;
      color: #78350f;
      margin-top: 5px;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      padding: 30px 20px 20px;
      margin-top: 20px;
      border-top: 1px dashed #d1d5db;
    }
    
    .signature-box {
      text-align: center;
      min-width: 180px;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 12px;
      color: #6b7280;
    }
    
    .stamp {
      width: 100px;
      height: 100px;
      border: 2px dashed #d1d5db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #9ca3af;
      text-transform: uppercase;
    }
    
    .developer-info {
      text-align: center;
      padding: 10px;
      background: #f9fafb;
      font-size: 11px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(30, 64, 175, 0.03);
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .receipt-container {
        box-shadow: none;
        border-width: 1px;
      }
      
      .no-print {
        display: none !important;
      }
      
      .watermark {
        display: none;
      }
    }
    
    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 12px 40px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .print-btn:hover {
      background: #1e3a8a;
    }
  </style>
</head>
<body>
  <div class="watermark">PAID</div>
  
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Receipt</button>
  
  <div class="receipt-container">
    <div class="header">
      <h1>${schoolInfo?.schoolName || 'School Name'}</h1>
      <p>${schoolInfo?.address || ''} ${schoolInfo?.city || ''}</p>
      <p>Phone: ${schoolInfo?.phonePrimary || 'N/A'} | Email: ${schoolInfo?.email || 'N/A'}</p>
    </div>
    
    <div class="receipt-title">
      <h2>📄 Fee Receipt</h2>
    </div>
    
    <div class="receipt-info">
      <div>
        <label>Receipt No</label>
        <span>${record.receiptNumber}</span>
      </div>
      <div>
        <label>Receipt Date</label>
        <span>${formatDate(record.paymentDate)}</span>
      </div>
      <div>
        <label>Fee Month</label>
        <span>${getMonthName(record.feeMonth)} ${record.feeYear}</span>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Student Information</div>
        <div class="student-info">
          <div class="info-row">
            <label>Student ID:</label>
            <span>${student.studentId}</span>
          </div>
          <div class="info-row">
            <label>Name:</label>
            <span>${student.firstName} ${student.lastName || ''}</span>
          </div>
          <div class="info-row">
            <label>Father's Name:</label>
            <span>${student.fatherName}</span>
          </div>
          <div class="info-row">
            <label>Class:</label>
            <span>${getClassName(student.classId)}</span>
          </div>
          <div class="info-row">
            <label>Roll Number:</label>
            <span>${student.rollNumber || 'N/A'}</span>
          </div>
          <div class="info-row">
            <label>Contact:</label>
            <span>${student.fatherPhone || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Fee Details</div>
        <table class="fee-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monthly Tuition Fee</td>
              <td class="amount">${formatCurrency(student.monthlyFee)}</td>
            </tr>
            ${student.transportOpted ? `
            <tr>
              <td>Transport Fee</td>
              <td class="amount">${formatCurrency(student.transportFee)}</td>
            </tr>
            ` : ''}
            ${record.lateFee > 0 ? `
            <tr>
              <td>Late Fee <span class="addition">(+)</span></td>
              <td class="amount addition">+ ${formatCurrency(record.lateFee)}</td>
            </tr>
            ` : ''}
            ${record.previousDue > 0 ? `
            <tr>
              <td>Previous Due <span class="addition">(+)</span></td>
              <td class="amount addition">+ ${formatCurrency(record.previousDue)}</td>
            </tr>
            ` : ''}
            ${record.concessionAmount > 0 ? `
            <tr>
              <td>Concession/Discount <span class="deduction">(-)</span></td>
              <td class="amount deduction">- ${formatCurrency(record.concessionAmount)}</td>
            </tr>
            ` : ''}
            <tr>
              <td><strong>Total Fee</strong></td>
              <td class="amount"><strong>${formatCurrency(record.totalFee)}</strong></td>
            </tr>
            <tr>
              <td><strong>Net Payable</strong></td>
              <td class="amount"><strong>${formatCurrency(record.netPayable)}</strong></td>
            </tr>
            <tr class="total-row">
              <td>✓ Amount Paid</td>
              <td class="amount">${formatCurrency(record.amountPaid)}</td>
            </tr>
            ${record.balanceDue > 0 ? `
            <tr style="background: #fef2f2;">
              <td style="color: #dc2626;">Balance Due</td>
              <td class="amount" style="color: #dc2626;">${formatCurrency(record.balanceDue)}</td>
            </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
      
      <div class="amount-words">
        <label>Amount in Words</label>
        <p>${numberToWords(record.amountPaid)} Rupees Only</p>
      </div>
      
      <div class="payment-info">
        <h4>✓ Payment Information</h4>
        <div class="payment-grid">
          <div class="info-row">
            <label>Payment Mode:</label>
            <span>${record.paymentMode.toUpperCase()}</span>
          </div>
          <div class="info-row">
            <label>Status:</label>
            <span style="color: ${record.status === 'paid' ? '#16a34a' : '#f59e0b'}; font-weight: bold;">
              ${record.status.toUpperCase()}
            </span>
          </div>
          ${record.paymentReference ? `
          <div class="info-row">
            <label>Reference:</label>
            <span>${record.paymentReference}</span>
          </div>
          ` : ''}
          ${record.bankName ? `
          <div class="info-row">
            <label>Bank:</label>
            <span>${record.bankName}</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="signature-box">
        <div class="signature-line">Student/Parent Signature</div>
      </div>
      <div class="stamp">
        School<br/>Stamp
      </div>
      <div class="signature-box">
        <div class="signature-line">Authorized Signature</div>
      </div>
    </div>
    
    <div class="developer-info">
      <p>This is a computer generated receipt | Developed by <strong>M.W.A</strong> | School Fee Manager Pro v1.0.0</p>
    </div>
  </div>
  
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Receipt</button>
  
  <script>
    // Auto-trigger print dialog after a short delay
    window.onload = function() {
      setTimeout(function() {
        // Uncomment the line below to auto-print
        // window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  // Open in new window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Please allow pop-ups to view the receipt');
  }
};

/**
 * Generate professional salary receipt HTML
 */
export const generateSalaryReceipt = (payment: SalaryPayment): void => {
  const schoolInfo = getSchoolInfo();
  const teacher = getTeacherById(payment.teacherId);
  
  if (!teacher) {
    alert('Teacher information not found!');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Salary Receipt - ${payment.paymentId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 2px solid #16a34a;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .header p {
      font-size: 12px;
      opacity: 0.9;
    }
    
    .receipt-title {
      background: #f0fdf4;
      padding: 15px;
      text-align: center;
      border-bottom: 2px solid #16a34a;
    }
    
    .receipt-title h2 {
      color: #16a34a;
      font-size: 20px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    .receipt-info {
      display: flex;
      justify-content: space-between;
      padding: 15px 20px;
      background: #fafafa;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .receipt-info div {
      text-align: center;
    }
    
    .receipt-info label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      display: block;
    }
    
    .receipt-info span {
      font-size: 16px;
      font-weight: 600;
      color: #16a34a;
    }
    
    .content {
      padding: 20px;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .teacher-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .info-row {
      display: flex;
    }
    
    .info-row label {
      width: 120px;
      color: #6b7280;
      font-size: 12px;
    }
    
    .info-row span {
      font-weight: 500;
    }
    
    .salary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    
    .salary-table th,
    .salary-table td {
      padding: 12px;
      text-align: left;
      border: 1px solid #e5e7eb;
    }
    
    .salary-table th {
      background: #f3f4f6;
      font-size: 12px;
      text-transform: uppercase;
      color: #374151;
    }
    
    .salary-table td {
      font-size: 14px;
    }
    
    .salary-table .amount {
      text-align: right;
      font-weight: 500;
    }
    
    .salary-table .total-row {
      background: #16a34a;
      color: white;
    }
    
    .salary-table .total-row td {
      font-weight: 700;
      font-size: 16px;
      border-color: #16a34a;
    }
    
    .salary-table .deduction {
      color: #dc2626;
    }
    
    .salary-table .addition {
      color: #16a34a;
    }
    
    .payment-info {
      background: #f0fdf4;
      border: 1px solid #22c55e;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    
    .payment-info h4 {
      color: #16a34a;
      margin-bottom: 10px;
      font-size: 14px;
      text-transform: uppercase;
    }
    
    .payment-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .amount-words {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    
    .amount-words label {
      font-size: 11px;
      color: #92400e;
      text-transform: uppercase;
    }
    
    .amount-words p {
      font-size: 14px;
      font-weight: 600;
      color: #78350f;
      margin-top: 5px;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      padding: 30px 20px 20px;
      margin-top: 20px;
      border-top: 1px dashed #d1d5db;
    }
    
    .signature-box {
      text-align: center;
      min-width: 180px;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      margin-top: 50px;
      padding-top: 5px;
      font-size: 12px;
      color: #6b7280;
    }
    
    .stamp {
      width: 100px;
      height: 100px;
      border: 2px dashed #d1d5db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #9ca3af;
      text-transform: uppercase;
    }
    
    .developer-info {
      text-align: center;
      padding: 10px;
      background: #f9fafb;
      font-size: 11px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(22, 163, 74, 0.03);
      font-weight: bold;
      pointer-events: none;
      z-index: 0;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .receipt-container {
        box-shadow: none;
        border-width: 1px;
      }
      
      .no-print {
        display: none !important;
      }
      
      .watermark {
        display: none;
      }
    }
    
    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 12px 40px;
      background: #16a34a;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    .print-btn:hover {
      background: #15803d;
    }
  </style>
</head>
<body>
  <div class="watermark">PAID</div>
  
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Receipt</button>
  
  <div class="receipt-container">
    <div class="header">
      <h1>${schoolInfo?.schoolName || 'School Name'}</h1>
      <p>${schoolInfo?.address || ''} ${schoolInfo?.city || ''}</p>
      <p>Phone: ${schoolInfo?.phonePrimary || 'N/A'} | Email: ${schoolInfo?.email || 'N/A'}</p>
    </div>
    
    <div class="receipt-title">
      <h2>💰 Salary Payment Receipt</h2>
    </div>
    
    <div class="receipt-info">
      <div>
        <label>Payment ID</label>
        <span>${payment.paymentId}</span>
      </div>
      <div>
        <label>Payment Date</label>
        <span>${formatDate(payment.paymentDate)}</span>
      </div>
      <div>
        <label>Salary Month</label>
        <span>${getMonthName(payment.month)} ${payment.year}</span>
      </div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Teacher Information</div>
        <div class="teacher-info">
          <div class="info-row">
            <label>Teacher ID:</label>
            <span>${teacher.teacherId}</span>
          </div>
          <div class="info-row">
            <label>Name:</label>
            <span>${teacher.firstName} ${teacher.lastName || ''}</span>
          </div>
          <div class="info-row">
            <label>Designation:</label>
            <span>${teacher.designation}</span>
          </div>
          <div class="info-row">
            <label>Department:</label>
            <span>${teacher.department || 'N/A'}</span>
          </div>
          <div class="info-row">
            <label>Contact:</label>
            <span>${teacher.phone || 'N/A'}</span>
          </div>
          <div class="info-row">
            <label>Bank Account:</label>
            <span>${teacher.accountNumber || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Salary Breakdown</div>
        <table class="salary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="amount">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td class="amount">${formatCurrency(payment.basicSalary)}</td>
            </tr>
            ${payment.allowances > 0 ? `
            <tr>
              <td>Allowances (Bonus, Incentives, etc.) <span class="addition">(+)</span></td>
              <td class="amount addition">+ ${formatCurrency(payment.allowances)}</td>
            </tr>
            ` : ''}
            ${payment.deductions > 0 ? `
            <tr>
              <td>Deductions (Tax, Advance, Absent, etc.) <span class="deduction">(-)</span></td>
              <td class="amount deduction">- ${formatCurrency(payment.deductions)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
              <td>✓ Net Salary Paid</td>
              <td class="amount">${formatCurrency(payment.netSalary)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="amount-words">
        <label>Amount in Words</label>
        <p>${numberToWords(payment.netSalary)} Rupees Only</p>
      </div>
      
      <div class="payment-info">
        <h4>✓ Payment Details</h4>
        <div class="payment-grid">
          <div class="info-row">
            <label>Payment Mode:</label>
            <span>${payment.paymentMode.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div class="info-row">
            <label>Status:</label>
            <span style="color: #16a34a; font-weight: bold;">
              ${payment.status.toUpperCase()}
            </span>
          </div>
          ${payment.paymentReference ? `
          <div class="info-row">
            <label>Reference:</label>
            <span>${payment.paymentReference}</span>
          </div>
          ` : ''}
          ${payment.remarks ? `
          <div class="info-row">
            <label>Remarks:</label>
            <span>${payment.remarks}</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="signature-box">
        <div class="signature-line">Employee Signature</div>
      </div>
      <div class="stamp">
        School<br/>Stamp
      </div>
      <div class="signature-box">
        <div class="signature-line">Authorized Signature</div>
      </div>
    </div>
    
    <div class="developer-info">
      <p>This is a computer generated receipt | Developed by <strong>M.W.A</strong> | School Fee Manager Pro v1.0.0</p>
    </div>
  </div>
  
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Receipt</button>
  
  <script>
    window.onload = function() {
      setTimeout(function() {
        // window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  // Open in new window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Please allow pop-ups to view the receipt');
  }
};

/**
 * Download invoices as CSV file
 */
export const downloadInvoicesAsCSV = (invoices: FeeRecord[]): void => {
  if (invoices.length === 0) {
    alert('No invoices to export!');
    return;
  }

  // CSV Headers
  const headers = [
    'Receipt Number',
    'Student ID',
    'Student Name',
    'Class',
    'Father Name',
    'Fee Month',
    'Fee Year',
    'Total Fee (PKR)',
    'Concession (PKR)',
    'Late Fee (PKR)',
    'Previous Due (PKR)',
    'Net Payable (PKR)',
    'Amount Paid (PKR)',
    'Balance Due (PKR)',
    'Payment Date',
    'Payment Mode',
    'Payment Reference',
    'Status',
    'Remarks'
  ];

  // Build CSV rows
  const rows = invoices.map(inv => {
    const student = getStudentById(inv.studentId);
    return [
      inv.receiptNumber,
      student?.studentId || 'N/A',
      student ? `${student.firstName} ${student.lastName || ''}` : 'N/A',
      student ? getClassName(student.classId) : 'N/A',
      student?.fatherName || 'N/A',
      getMonthName(inv.feeMonth),
      inv.feeYear,
      inv.totalFee,
      inv.concessionAmount,
      inv.lateFee,
      inv.previousDue,
      inv.netPayable,
      inv.amountPaid,
      inv.balanceDue,
      inv.paymentDate,
      inv.paymentMode,
      inv.paymentReference || '',
      inv.status,
      inv.remarks || ''
    ];
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if needed
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `invoices-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Download salary records as CSV file
 */
export const downloadSalaryRecordsAsCSV = (records: SalaryPayment[]): void => {
  if (records.length === 0) {
    alert('No salary records to export!');
    return;
  }

  // CSV Headers
  const headers = [
    'Payment ID',
    'Teacher ID',
    'Teacher Name',
    'Designation',
    'Month',
    'Year',
    'Basic Salary (PKR)',
    'Allowances (PKR)',
    'Deductions (PKR)',
    'Net Salary (PKR)',
    'Payment Date',
    'Payment Mode',
    'Payment Reference',
    'Status',
    'Remarks'
  ];

  // Build CSV rows
  const rows = records.map(rec => {
    const teacher = getTeacherById(rec.teacherId);
    return [
      rec.paymentId,
      teacher?.teacherId || 'N/A',
      teacher ? `${teacher.firstName} ${teacher.lastName || ''}` : 'N/A',
      teacher?.designation || 'N/A',
      getMonthName(rec.month),
      rec.year,
      rec.basicSalary,
      rec.allowances,
      rec.deductions,
      rec.netSalary,
      rec.paymentDate,
      rec.paymentMode,
      rec.paymentReference || '',
      rec.status,
      rec.remarks || ''
    ];
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `salary-records-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert number to words (for amount in words)
 */
const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + numberToWords(Math.abs(num));
  
  let words = '';
  
  // Crore (10 million)
  if (Math.floor(num / 10000000) > 0) {
    words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }
  
  // Lakh (100 thousand)
  if (Math.floor(num / 100000) > 0) {
    words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }
  
  // Thousand
  if (Math.floor(num / 1000) > 0) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }
  
  // Hundred
  if (Math.floor(num / 100) > 0) {
    words += numberToWords(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }
  
  if (num > 0) {
    if (words !== '') words += 'and ';
    
    if (num < 20) {
      words += ones[Math.floor(num)];
    } else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) {
        words += ' ' + ones[Math.floor(num % 10)];
      }
    }
  }
  
  return words.trim();
};

/**
 * Generate and download a student fee ledger
 */
export const generateStudentLedger = (student: Student, feeRecords: FeeRecord[]): void => {
  const schoolInfo = getSchoolInfo();
  const studentRecords = feeRecords.filter(r => r.studentId === student.id);
  
  const totalPaid = studentRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalDue = studentRecords.reduce((sum, r) => sum + r.balanceDue, 0);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fee Ledger - ${student.studentId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #333;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border: 1px solid #ddd;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #1e40af;
    }
    .header h1 { font-size: 20px; color: #1e40af; }
    .header p { font-size: 11px; color: #666; }
    .title {
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      margin: 15px 0;
      text-transform: uppercase;
    }
    .student-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .info-item { display: flex; }
    .info-item label { width: 100px; color: #666; font-size: 11px; }
    .info-item span { font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 8px; border: 1px solid #e5e7eb; text-align: left; font-size: 11px; }
    th { background: #f3f4f6; font-weight: 600; text-transform: uppercase; }
    .amount { text-align: right; }
    .summary {
      display: flex;
      justify-content: flex-end;
      gap: 20px;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #e5e7eb;
    }
    .summary-item {
      text-align: center;
      padding: 10px 20px;
      border-radius: 8px;
    }
    .summary-item.paid { background: #dcfce7; color: #16a34a; }
    .summary-item.due { background: #fee2e2; color: #dc2626; }
    .summary-item label { font-size: 10px; display: block; }
    .summary-item span { font-size: 18px; font-weight: bold; }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #999;
    }
    .print-btn {
      display: block;
      margin: 20px auto;
      padding: 10px 30px;
      background: #1e40af;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    @media print {
      .no-print { display: none !important; }
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Ledger</button>
  
  <div class="container">
    <div class="header">
      <h1>${schoolInfo?.schoolName || 'School Name'}</h1>
      <p>${schoolInfo?.address || ''} | Phone: ${schoolInfo?.phonePrimary || 'N/A'}</p>
    </div>
    
    <div class="title">📋 Student Fee Ledger</div>
    
    <div class="student-info">
      <div class="info-item"><label>Student ID:</label><span>${student.studentId}</span></div>
      <div class="info-item"><label>Name:</label><span>${student.firstName} ${student.lastName || ''}</span></div>
      <div class="info-item"><label>Father:</label><span>${student.fatherName}</span></div>
      <div class="info-item"><label>Class:</label><span>${getClassName(student.classId)}</span></div>
      <div class="info-item"><label>Admission:</label><span>${formatDate(student.admissionDate)}</span></div>
      <div class="info-item"><label>Monthly Fee:</label><span>${formatCurrency(student.monthlyFee)}</span></div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Receipt #</th>
          <th>Month</th>
          <th>Year</th>
          <th class="amount">Total Fee</th>
          <th class="amount">Paid</th>
          <th class="amount">Balance</th>
          <th>Date</th>
          <th>Mode</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${studentRecords.length === 0 ? `
        <tr><td colspan="9" style="text-align: center; padding: 20px; color: #999;">No fee records found</td></tr>
        ` : studentRecords.map(r => `
        <tr>
          <td>${r.receiptNumber}</td>
          <td>${getMonthName(r.feeMonth)}</td>
          <td>${r.feeYear}</td>
          <td class="amount">${formatCurrency(r.netPayable)}</td>
          <td class="amount">${formatCurrency(r.amountPaid)}</td>
          <td class="amount">${formatCurrency(r.balanceDue)}</td>
          <td>${formatDate(r.paymentDate)}</td>
          <td>${r.paymentMode}</td>
          <td style="color: ${r.status === 'paid' ? '#16a34a' : '#f59e0b'}">${r.status.toUpperCase()}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="summary">
      <div class="summary-item paid">
        <label>Total Paid</label>
        <span>${formatCurrency(totalPaid)}</span>
      </div>
      <div class="summary-item due">
        <label>Total Due</label>
        <span>${formatCurrency(totalDue)}</span>
      </div>
    </div>
    
    <div class="footer">
      Generated on ${new Date().toLocaleDateString('en-PK')} | Developed by <strong>M.W.A</strong> | School Fee Manager Pro v1.0.0
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Please allow pop-ups to view the ledger');
  }
};
