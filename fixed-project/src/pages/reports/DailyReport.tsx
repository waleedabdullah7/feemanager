import { useState } from 'react';
import { Calendar, Download, Printer, TrendingUp } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getFeeRecords, getStudents } from '@/store';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const feeRecords = getFeeRecords();
  const students = getStudents();

  const dailyRecords = feeRecords.filter(r => r.paymentDate === selectedDate);
  
  const totalCollection = dailyRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  
  const modeWiseCollection = dailyRecords.reduce((acc, r) => {
    acc[r.paymentMode] = (acc[r.paymentMode] || 0) + r.amountPaid;
    return acc;
  }, {} as Record<string, number>);

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName || ''}` : 'Unknown';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Date Selector */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                icon={<Calendar className="w-5 h-5" />}
              />
            </div>
            <p className="text-gray-600">
              Showing report for <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer className="w-4 h-4" />}>Print</Button>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export</Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Collection"
          value={`Rs. ${totalCollection.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <Card>
          <p className="text-gray-500 text-sm">Total Receipts</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{dailyRecords.length}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Cash Collection</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Rs. {(modeWiseCollection['cash'] || 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Digital Collection</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            Rs. {((modeWiseCollection['upi'] || 0) + (modeWiseCollection['card'] || 0) + (modeWiseCollection['bank_transfer'] || 0)).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Payment Mode Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection by Payment Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(modeWiseCollection).map(([mode, amount]) => (
            <div key={mode} className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-500 capitalize">{mode.replace('_', ' ')}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">Rs. {amount.toLocaleString()}</p>
            </div>
          ))}
          {Object.keys(modeWiseCollection).length === 0 && (
            <p className="col-span-5 text-center text-gray-500 py-4">No collections for this date</p>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transaction Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Receipt No.</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Month</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Mode</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyRecords.map((record, index) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4 font-mono text-sm text-blue-600">{record.receiptNumber}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{getStudentName(record.studentId)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{months[record.feeMonth - 1]}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{record.paymentMode.replace('_', ' ')}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">Rs. {record.amountPaid.toLocaleString()}</td>
                </tr>
              ))}
              {dailyRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No transactions found for this date
                  </td>
                </tr>
              )}
            </tbody>
            {dailyRecords.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={5} className="py-3 px-4 font-bold text-gray-900">Total</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-600 text-lg">Rs. {totalCollection.toLocaleString()}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>
    </div>
  );
}
