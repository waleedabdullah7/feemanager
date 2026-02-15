import { useState } from 'react';
import { Search, Download, Calendar, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getFeeRecords, getStudents, getClasses } from '@/store';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function FeeHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');

  const feeRecords = getFeeRecords();
  const students = getStudents();
  const classes = getClasses();

  const filteredRecords = feeRecords.filter(record => {
    const student = students.find(s => s.id === record.studentId);
    const matchesSearch = 
      record.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    const matchesMode = !paymentModeFilter || record.paymentMode === paymentModeFilter;
    
    return matchesSearch && matchesStatus && matchesMode;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName || ''}` : 'Unknown';
  };

  const getClassName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return 'N/A';
    return classes.find(c => c.id === student.classId)?.className || 'N/A';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      case 'partial':
        return <Badge variant="warning">Partial</Badge>;
      case 'unpaid':
        return <Badge variant="danger">Unpaid</Badge>;
      case 'cancelled':
        return <Badge variant="default">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const totalCollected = filteredRecords.reduce((sum, r) => sum + r.amountPaid, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-gray-500 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{filteredRecords.length}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">Rs. {totalCollected.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Average Transaction</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            Rs. {filteredRecords.length > 0 ? Math.round(totalCollected / filteredRecords.length).toLocaleString() : 0}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search by receipt or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'paid', label: 'Paid' },
                { value: 'partial', label: 'Partial' },
                { value: 'unpaid', label: 'Unpaid' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Modes' },
                { value: 'cash', label: 'Cash' },
                { value: 'upi', label: 'UPI' },
                { value: 'card', label: 'Card' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'bank_transfer', label: 'Bank Transfer' },
              ]}
            />
          </div>
          <Button variant="ghost" icon={<Calendar className="w-4 h-4" />}>
            Date Range
          </Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </Card>

      {/* Records Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt #</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm font-medium text-blue-600">{record.receiptNumber}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{getStudentName(record.studentId)}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{getClassName(record.studentId)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{months[record.feeMonth - 1]} {record.feeYear}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900">Rs. {record.amountPaid.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600 capitalize">{record.paymentMode.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{record.paymentDate}</td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <Filter className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No fee records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
