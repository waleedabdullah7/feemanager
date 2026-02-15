import { useState } from 'react';
import { Search, Download, Printer, Phone, Mail, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getStudents, getClasses, getFeeRecords, formatCurrency } from '@/store';

interface DefaultersReportProps {
  onNavigate: (page: string) => void;
}

export function DefaultersReport({ onNavigate }: DefaultersReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');

  const students = getStudents().filter(s => s.status === 'active');
  const classes = getClasses();
  const feeRecords = getFeeRecords();

  // Get current date info
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Calculate defaulters with proper logic
  const defaulters = students.map(student => {
    const studentRecords = feeRecords.filter(r => r.studentId === student.id && r.feeYear === currentYear);
    
    // Get admission info
    const admissionDate = new Date(student.admissionDate);
    const admissionYear = admissionDate.getFullYear();
    const admissionMonth = admissionDate.getMonth() + 1;
    
    // Determine start month
    let startMonth: number;
    if (admissionYear < currentYear) {
      startMonth = 1;
    } else if (admissionYear === currentYear) {
      startMonth = admissionMonth;
    } else {
      startMonth = currentMonth + 1; // Future admission
    }
    
    // Get paid months
    const paidMonths = studentRecords.filter(r => r.status === 'paid').map(r => r.feeMonth);
    
    // Calculate pending months
    const shouldHavePaid: number[] = [];
    for (let month = startMonth; month <= currentMonth; month++) {
      shouldHavePaid.push(month);
    }
    
    const unpaidMonths = shouldHavePaid.filter(m => !paidMonths.includes(m));
    const monthlyTotal = student.monthlyFee + (student.transportOpted ? student.transportFee : 0);
    const pendingAmount = unpaidMonths.length * monthlyTotal;
    
    // Add partial payment balance
    const partialDue = studentRecords
      .filter(r => r.status === 'partial')
      .reduce((sum, r) => sum + r.balanceDue, 0);
    
    const totalPending = pendingAmount + partialDue;
    
    return {
      ...student,
      pendingAmount: totalPending,
      monthsPending: unpaidMonths.length,
      monthsPaid: paidMonths.length,
      className: classes.find(c => c.id === student.classId)?.className || 'N/A',
    };
  }).filter(s => s.pendingAmount > 0);

  // Apply filters
  const filteredDefaulters = defaulters.filter(d => {
    const matchesSearch = 
      d.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = !classFilter || d.classId === parseInt(classFilter);
    const matchesMinAmount = !minAmount || d.pendingAmount >= parseInt(minAmount);
    
    return matchesSearch && matchesClass && matchesMinAmount;
  }).sort((a, b) => b.pendingAmount - a.pendingAmount);

  const totalPending = filteredDefaulters.reduce((sum, d) => sum + d.pendingAmount, 0);

  // If no defaulters
  if (defaulters.length === 0) {
    return (
      <div className="p-6">
        <Card className="text-center py-16">
          <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
          <h3 className="text-xl font-semibold text-green-700 mb-2">No Defaulters!</h3>
          <p className="text-green-600">All students have paid their fees on time. Great job! 🎉</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total Pending Amount</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200" />
          </div>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Total Defaulters</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{filteredDefaulters.length}</p>
        </Card>
        <Card>
          <p className="text-gray-500 text-sm">Average Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(filteredDefaulters.length > 0 ? Math.round(totalPending / filteredDefaulters.length) : 0)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-40">
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map(c => ({ value: c.id, label: c.className }))
              ]}
            />
          </div>
          <div className="w-40">
            <Input
              placeholder="Min Amount"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
            />
          </div>
          <Button variant="secondary" icon={<Printer className="w-4 h-4" />}>Print</Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>Export</Button>
        </div>
      </Card>

      {/* Defaulters Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Class</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Parent Contact</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Monthly Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Months Pending</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Pending Amount</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDefaulters.map((defaulter, index) => (
                <tr key={defaulter.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold">
                        {defaulter.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{defaulter.firstName} {defaulter.lastName}</p>
                        <p className="text-xs text-gray-500">{defaulter.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{defaulter.className}</td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-900">{defaulter.fatherName}</p>
                      <div className="flex items-center gap-2">
                        {defaulter.fatherPhone && (
                          <a href={`tel:${defaulter.fatherPhone}`} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <Phone className="w-3 h-3" />
                            {defaulter.fatherPhone}
                          </a>
                        )}
                        {defaulter.fatherEmail && (
                          <a href={`mailto:${defaulter.fatherEmail}`} className="p-1 text-gray-400 hover:text-blue-600">
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(defaulter.monthlyFee)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={defaulter.monthsPending > 3 ? 'danger' : 'warning'}>
                      {defaulter.monthsPending} months
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-lg font-bold text-red-600">{formatCurrency(defaulter.pendingAmount)}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button size="sm" onClick={() => onNavigate('fees-collect')}>
                      Collect
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredDefaulters.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No defaulters match your search criteria</p>
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
