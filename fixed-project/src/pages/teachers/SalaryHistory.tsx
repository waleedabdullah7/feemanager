import { useState } from 'react';
import { Search, Download, Calendar, Banknote, FileText, Printer } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getTeachers, getSalaryPayments, formatCurrency } from '@/store';
import { generateSalaryReceipt, downloadSalaryRecordsAsCSV } from '@/utils/pdfGenerator';

export function SalaryHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState<number>(0);
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());

  const teachers = getTeachers();
  const salaryPayments = getSalaryPayments();

  const months = [
    'All Months', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  const filteredPayments = salaryPayments.filter(payment => {
    const teacher = teachers.find(t => t.id === payment.teacherId);
    const matchesSearch = !searchTerm || 
      teacher?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = monthFilter === 0 || payment.month === monthFilter;
    const matchesYear = payment.year === yearFilter;

    return matchesSearch && matchesMonth && matchesYear;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPaid = filteredPayments.reduce((sum, p) => sum + p.netSalary, 0);

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName || ''}`.trim() : 'Unknown';
  };

  const getPaymentModeBadge = (mode: string) => {
    switch (mode) {
      case 'bank_transfer':
        return <Badge variant="info">Bank Transfer</Badge>;
      case 'cash':
        return <Badge variant="success">Cash</Badge>;
      case 'cheque':
        return <Badge variant="warning">Cheque</Badge>;
      default:
        return <Badge>{mode}</Badge>;
    }
  };

  const downloadCSV = () => {
    downloadSalaryRecordsAsCSV(filteredPayments);
  };

  const handlePrintReceipt = (payment: typeof salaryPayments[0]) => {
    generateSalaryReceipt(payment);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary History</h1>
          <p className="text-gray-600">View all salary payment records</p>
        </div>
        <Button variant="secondary" onClick={downloadCSV} disabled={filteredPayments.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-100">Total Paid ({yearFilter})</p>
              <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-100">Total Payments</p>
              <p className="text-2xl font-bold">{filteredPayments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-purple-100">Active Teachers</p>
              <p className="text-2xl font-bold">{teachers.filter(t => t.status === 'active').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by teacher name or payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(parseInt(e.target.value))}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(parseInt(e.target.value))}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      <Card padding="none">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-16">
            <Banknote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Salary Payments Found</h3>
            <p className="text-gray-600">
              {salaryPayments.length === 0
                ? "No salary payments have been made yet."
                : "No payments match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Basic
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Allowances
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{payment.paymentId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{getTeacherName(payment.teacherId)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{months[payment.month]} {payment.year}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{formatCurrency(payment.basicSalary)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-600">+ {formatCurrency(payment.allowances)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-600">- {formatCurrency(payment.deductions)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{formatCurrency(payment.netSalary)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentModeBadge(payment.paymentMode)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePrintReceipt(payment)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
