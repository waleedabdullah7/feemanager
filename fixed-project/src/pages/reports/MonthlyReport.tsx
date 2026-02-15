import { useState } from 'react';
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { getFeeRecords } from '@/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function MonthlyReport() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const feeRecords = getFeeRecords();

  const monthlyRecords = feeRecords.filter(r => {
    const recordDate = new Date(r.paymentDate);
    return recordDate.getMonth() + 1 === parseInt(selectedMonth) && 
           recordDate.getFullYear() === parseInt(selectedYear);
  });

  const totalCollection = monthlyRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalReceipts = monthlyRecords.length;
  const avgPerReceipt = totalReceipts > 0 ? Math.round(totalCollection / totalReceipts) : 0;

  // Day-wise breakdown
  const dayWiseData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dayRecords = monthlyRecords.filter(r => {
      const recordDate = new Date(r.paymentDate);
      return recordDate.getDate() === day;
    });
    return {
      day: day.toString(),
      amount: dayRecords.reduce((sum, r) => sum + r.amountPaid, 0),
      count: dayRecords.length,
    };
  }).filter(d => d.amount > 0 || d.count > 0);

  // Payment mode breakdown
  const modeWiseData = monthlyRecords.reduce((acc, r) => {
    const mode = r.paymentMode.replace('_', ' ');
    acc[mode] = (acc[mode] || 0) + r.amountPaid;
    return acc;
  }, {} as Record<string, number>);

  const modeChartData = Object.entries(modeWiseData).map(([name, amount]) => ({ name, amount }));

  // Compare with previous month
  const prevMonth = parseInt(selectedMonth) === 1 ? 12 : parseInt(selectedMonth) - 1;
  const prevYear = parseInt(selectedMonth) === 1 ? parseInt(selectedYear) - 1 : parseInt(selectedYear);
  const prevMonthRecords = feeRecords.filter(r => {
    const recordDate = new Date(r.paymentDate);
    return recordDate.getMonth() + 1 === prevMonth && recordDate.getFullYear() === prevYear;
  });
  const prevMonthTotal = prevMonthRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const growthPercent = prevMonthTotal > 0 ? Math.round(((totalCollection - prevMonthTotal) / prevMonthTotal) * 100) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Month/Year Selector */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-40">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={months.map((m, i) => ({ value: i + 1, label: m }))}
              />
            </div>
            <div className="w-32">
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={[
                  { value: '2023', label: '2023' },
                  { value: '2024', label: '2024' },
                  { value: '2025', label: '2025' },
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
        <StatCard
          title="Total Collection"
          value={`Rs. ${totalCollection.toLocaleString()}`}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
          trend={growthPercent !== 0 ? { value: `${Math.abs(growthPercent)}% vs last month`, positive: growthPercent > 0 } : undefined}
        />
        <Card>
          <p className="text-gray-500 text-sm">Total Receipts</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{totalReceipts}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Average per Receipt</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Rs. {avgPerReceipt.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Previous Month</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">Rs. {prevMonthTotal.toLocaleString()}</p>
          {growthPercent !== 0 && (
            <div className={`flex items-center gap-1 mt-1 ${growthPercent > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {growthPercent > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(growthPercent)}%</span>
            </div>
          )}
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day-wise Collection */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Day-wise Collection</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dayWiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `Rs.${v/1000}K`} />
                <Tooltip 
                  formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Mode Breakdown */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection by Payment Mode</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `Rs.${v/1000}K`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#6B7280" width={80} />
                <Tooltip 
                  formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Summary Table */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Mode Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Payment Mode</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Transactions</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Amount</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(modeWiseData).map(([mode, amount]) => {
                const modeRecords = monthlyRecords.filter(r => r.paymentMode.replace('_', ' ') === mode);
                const percentage = totalCollection > 0 ? Math.round((amount / totalCollection) * 100) : 0;
                return (
                  <tr key={mode} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900 capitalize">{mode}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{modeRecords.length}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">Rs. {amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-blue-50">
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900">Total</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">{totalReceipts}</td>
                <td className="py-3 px-4 text-right font-bold text-blue-600">Rs. {totalCollection.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
