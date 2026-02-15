import { useState } from 'react';
import { Download, Printer, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getStudents, getClasses, getFeeRecords, formatCurrency } from '@/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function ClassReport() {
  const [selectedClass, setSelectedClass] = useState('');

  const students = getStudents().filter(s => s.status === 'active');
  const classes = getClasses();
  const feeRecords = getFeeRecords();

  // Calculate class-wise data
  const classWiseData = classes.map(cls => {
    const classStudents = students.filter(s => s.classId === cls.id);
    const expectedFee = classStudents.reduce((sum, s) => sum + (s.monthlyFee * 10), 0);
    
    const classRecords = feeRecords.filter(r => {
      const student = students.find(s => s.id === r.studentId);
      return student?.classId === cls.id && r.status === 'paid';
    });
    const collectedFee = classRecords.reduce((sum, r) => sum + r.amountPaid, 0);
    
    const percentage = expectedFee > 0 ? Math.round((collectedFee / expectedFee) * 100) : 0;
    
    return {
      className: cls.className,
      classId: cls.id,
      studentCount: classStudents.length,
      expectedFee,
      collectedFee,
      pendingFee: expectedFee - collectedFee,
      percentage,
    };
  }).filter(c => c.studentCount > 0);

  const filteredData = selectedClass 
    ? classWiseData.filter(c => c.classId === parseInt(selectedClass))
    : classWiseData;

  const totalStats = {
    students: filteredData.reduce((sum, c) => sum + c.studentCount, 0),
    expected: filteredData.reduce((sum, c) => sum + c.expectedFee, 0),
    collected: filteredData.reduce((sum, c) => sum + c.collectedFee, 0),
    pending: filteredData.reduce((sum, c) => sum + c.pendingFee, 0),
  };

  const chartData = classWiseData.map(c => ({
    name: c.className.replace('Class ', ''),
    collected: c.collectedFee,
    pending: c.pendingFee,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                options={[
                  { value: '', label: 'All Classes' },
                  ...classes.map(c => ({ value: c.id, label: c.className }))
                ]}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Printer className="w-4 h-4" />}>Print</Button>
            <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export</Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.students}</p>
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Expected Collection</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalStats.expected)}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalStats.collected)}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalStats.pending)}</p>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Collection Overview</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" />
              <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `Rs.${v/1000}K`} />
              <Tooltip 
                formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span className="text-sm text-gray-600">Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
        </div>
      </Card>

      {/* Detailed Table */}
      <Card padding="none">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Class-wise Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Class</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Students</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Expected</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Collected</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Pending</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Collection %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((row) => (
                <tr key={row.classId} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{row.className}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{row.studentCount}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(row.expectedFee)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatCurrency(row.collectedFee)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-red-600">{formatCurrency(row.pendingFee)}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge variant={row.percentage >= 80 ? 'success' : row.percentage >= 50 ? 'warning' : 'danger'}>
                      {row.percentage}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-blue-50">
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Total</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">{totalStats.students}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(totalStats.expected)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600">{formatCurrency(totalStats.collected)}</td>
                <td className="py-3 px-4 text-right font-bold text-red-600">{formatCurrency(totalStats.pending)}</td>
                <td className="py-3 px-4 text-right">
                  <Badge variant="info">
                    {totalStats.expected > 0 ? Math.round((totalStats.collected / totalStats.expected) * 100) : 0}%
                  </Badge>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
