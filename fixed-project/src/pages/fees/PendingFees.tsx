import { useState, useMemo } from 'react';
import { Search, Filter, AlertTriangle, Phone, Mail, Users, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getStudents, getClasses, getFeeRecords, formatCurrency } from '@/store';
import type { Student, FeeRecord } from '@/types';

interface PendingFeesProps {
  onNavigate: (page: string) => void;
}

interface StudentWithPending extends Student {
  pendingAmount: number;
  monthsPaid: number;
  monthsPending: number;
  monthlyTotal: number;
  lastPaymentDate: string | null;
  paidMonths: number[];
  unpaidMonths: number[];
}

export function PendingFees({ onNavigate }: PendingFeesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  const students = getStudents().filter(s => s.status === 'active');
  const classes = getClasses();
  const feeRecords = getFeeRecords();

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();

  // Calculate pending for each student using useMemo for performance
  const studentsWithPending = useMemo(() => {
    return students.map((student): StudentWithPending => {
      // Get all fee records for this student
      const studentRecords: FeeRecord[] = feeRecords.filter(
        (r: FeeRecord) => r.studentId === student.id && r.feeYear === currentYear
      );
      
      // Get admission date
      const admissionDate = new Date(student.admissionDate);
      const admissionYear = admissionDate.getFullYear();
      const admissionMonth = admissionDate.getMonth() + 1; // 1-12
      
      // Determine which months should be paid based on admission date
      let startMonth: number;
      if (admissionYear < currentYear) {
        // Student was admitted in a previous year, so they should have paid from January
        startMonth = 1;
      } else if (admissionYear === currentYear) {
        // Student was admitted this year, start from admission month
        startMonth = admissionMonth;
      } else {
        // Student admitted in future - shouldn't have any pending
        startMonth = currentMonth + 1;
      }
      
      // Get list of months that have been paid (status = 'paid')
      const paidMonths: number[] = studentRecords
        .filter((r: FeeRecord) => r.status === 'paid')
        .map((r: FeeRecord) => r.feeMonth);
      
      // Determine which months should have been paid (from start month to current month)
      const shouldHavePaidMonths: number[] = [];
      for (let month = startMonth; month <= currentMonth; month++) {
        shouldHavePaidMonths.push(month);
      }
      
      // Find unpaid months
      const unpaidMonths = shouldHavePaidMonths.filter(month => !paidMonths.includes(month));
      
      // Calculate monthly fee including transport
      const monthlyTotal = (student.monthlyFee || 0) + (student.transportOpted ? (student.transportFee || 0) : 0);
      
      // Calculate pending amount for unpaid months
      const pendingFromMonths = unpaidMonths.length * monthlyTotal;
      
      // Get any partial payments balance
      const partialRecords = studentRecords.filter((r: FeeRecord) => r.status === 'partial');
      const totalPartialDue = partialRecords.reduce((sum: number, r: FeeRecord) => sum + (r.balanceDue || 0), 0);
      
      // Final pending amount
      const totalPending = pendingFromMonths + totalPartialDue;
      
      // Get last payment date
      const paidRecords = studentRecords.filter((r: FeeRecord) => r.status === 'paid' || r.status === 'partial');
      const lastPaymentDate = paidRecords.length > 0 
        ? paidRecords.sort((a: FeeRecord, b: FeeRecord) => 
            new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
          )[0].paymentDate
        : null;
      
      return {
        ...student,
        pendingAmount: totalPending,
        monthsPaid: paidMonths.length,
        monthsPending: unpaidMonths.length,
        monthlyTotal,
        lastPaymentDate,
        paidMonths,
        unpaidMonths
      };
    }).filter((s: StudentWithPending) => s.pendingAmount > 0); // ONLY show students with ACTUAL pending > 0
  }, [students, feeRecords, currentMonth, currentYear]);

  // Apply search and class filters
  const filteredStudents = useMemo(() => {
    return studentsWithPending.filter((student: StudentWithPending) => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.lastName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.fatherPhone || '').includes(searchTerm);
      
      const matchesClass = !classFilter || student.classId === parseInt(classFilter);
      
      return matchesSearch && matchesClass;
    }).sort((a: StudentWithPending, b: StudentWithPending) => b.pendingAmount - a.pendingAmount);
  }, [studentsWithPending, searchTerm, classFilter]);

  const getClassName = (classId: number) => {
    return classes.find(c => c.id === classId)?.className || 'N/A';
  };

  const totalPending = filteredStudents.reduce((sum: number, s: StudentWithPending) => sum + s.pendingAmount, 0);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // If no students exist at all
  if (students.length === 0) {
    return (
      <div className="p-6">
        <Card className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600 mb-6">Add students first to track pending fees</p>
          <Button onClick={() => onNavigate('students-add')}>Add First Student</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Fees</h1>
        <p className="text-gray-600">Track and manage student fee dues</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Total Pending</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-amber-200" />
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 text-sm">Students with Dues</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{filteredStudents.length}</p>
          <p className="text-xs text-gray-400 mt-1">of {students.length} total students</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 text-sm">Average Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(filteredStudents.length > 0 ? Math.round(totalPending / filteredStudents.length) : 0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">per student</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search by name, ID, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
          </div>
          <div className="w-48">
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={[
                { value: '', label: 'All Classes' },
                ...classes.map(c => ({ value: String(c.id), label: c.className }))
              ]}
            />
          </div>
          <Button variant="ghost" icon={<Filter className="w-4 h-4" />}>
            More Filters
          </Button>
        </div>
      </Card>

      {/* Pending List */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Monthly Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Unpaid Months</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount Due</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Payment</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student: StudentWithPending) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-semibold">
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{getClassName(student.classId)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {student.fatherPhone && (
                        <a href={`tel:${student.fatherPhone}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Call">
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                      {student.fatherEmail && (
                        <a href={`mailto:${student.fatherEmail}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Email">
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                      <span className="text-sm text-gray-600">{student.fatherPhone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatCurrency(student.monthlyTotal)}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.unpaidMonths.length > 0 ? (
                        student.unpaidMonths.slice(0, 4).map(month => (
                          <Badge key={month} variant="danger" size="sm">
                            {monthNames[month - 1]}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="success" size="sm">All Paid</Badge>
                      )}
                      {student.unpaidMonths.length > 4 && (
                        <Badge variant="default" size="sm">
                          +{student.unpaidMonths.length - 4} more
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {student.monthsPending} month{student.monthsPending !== 1 ? 's' : ''} pending
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-lg font-semibold text-red-600">{formatCurrency(student.pendingAmount)}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {student.lastPaymentDate 
                      ? new Date(student.lastPaymentDate).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : <span className="text-red-500">Never Paid</span>
                    }
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => onNavigate('fees-collect')}>
                        Collect Fee
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                    <p className="text-lg font-semibold text-green-700">No Pending Fees!</p>
                    <p className="text-sm mt-1 text-green-600">
                      {students.length > 0 
                        ? 'All students have paid their fees on time. Great job! 🎉' 
                        : 'Add students to start tracking fees.'}
                    </p>
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
