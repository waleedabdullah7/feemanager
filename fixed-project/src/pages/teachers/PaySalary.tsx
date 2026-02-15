import { useState } from 'react';
import { Search, Banknote, Calendar, CreditCard, CheckCircle, User } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  getTeachers, 
  getSalaryPayments, 
  saveSalaryPayment, 
  generatePaymentId,
  getCurrentUser 
} from '@/store';
import type { Teacher, SalaryPayment } from '@/types';

interface PaySalaryProps {
  onNavigate: (page: string) => void;
}

export function PaySalary({ onNavigate }: PaySalaryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [paymentData, setPaymentData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    paymentMode: 'bank_transfer' as SalaryPayment['paymentMode'],
    paymentReference: '',
    remarks: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const teachers = getTeachers().filter(t => t.status === 'active');
  const salaryPayments = getSalaryPayments();

  const filteredTeachers = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setPaymentData(prev => ({
      ...prev,
      basicSalary: teacher.salary,
    }));
  };

  const getNetSalary = () => {
    return paymentData.basicSalary + paymentData.allowances - paymentData.deductions;
  };

  const isAlreadyPaid = () => {
    if (!selectedTeacher) return false;
    return salaryPayments.some(
      p => p.teacherId === selectedTeacher.id && 
           p.month === paymentData.month && 
           p.year === paymentData.year &&
           p.status === 'paid'
    );
  };

  const handlePaySalary = () => {
    if (!selectedTeacher) return;
    
    setProcessing(true);

    const currentUser = getCurrentUser();
    const payment: SalaryPayment = {
      id: salaryPayments.length + 1,
      paymentId: generatePaymentId(),
      teacherId: selectedTeacher.id,
      month: paymentData.month,
      year: paymentData.year,
      basicSalary: paymentData.basicSalary,
      allowances: paymentData.allowances,
      deductions: paymentData.deductions,
      netSalary: getNetSalary(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: paymentData.paymentMode,
      paymentReference: paymentData.paymentReference,
      status: 'paid',
      remarks: paymentData.remarks,
      paidBy: currentUser?.id || 1,
      createdAt: new Date().toISOString(),
    };

    saveSalaryPayment(payment);

    setTimeout(() => {
      setProcessing(false);
      setShowSuccess(true);
    }, 500);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (showSuccess) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[80vh]">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Salary Paid Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Salary of Rs. {getNetSalary().toLocaleString()} has been paid to {selectedTeacher?.firstName} {selectedTeacher?.lastName}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => {
              setShowSuccess(false);
              setSelectedTeacher(null);
              setPaymentData({
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                basicSalary: 0,
                allowances: 0,
                deductions: 0,
                paymentMode: 'bank_transfer',
                paymentReference: '',
                remarks: '',
              });
            }}>
              Pay Another
            </Button>
            <Button onClick={() => onNavigate('salary-history')}>
              View History
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pay Salary</h1>
        <p className="text-gray-600">Process salary payments for teachers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <h2 className="font-semibold text-gray-900 mb-4">Select Teacher</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active teachers found</p>
                </div>
              ) : (
                filteredTeachers.map(teacher => (
                  <div
                    key={teacher.id}
                    onClick={() => handleSelectTeacher(teacher)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedTeacher?.id === teacher.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {teacher.firstName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{teacher.designation}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          Rs. {teacher.salary.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">per month</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedTeacher ? (
            <Card className="text-center py-16">
              <Banknote className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Teacher</h3>
              <p className="text-gray-600">Choose a teacher from the list to process salary payment</p>
            </Card>
          ) : (
            <>
              {/* Teacher Info Card */}
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">{selectedTeacher.firstName.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {selectedTeacher.firstName} {selectedTeacher.lastName}
                    </h3>
                    <p className="text-purple-100">{selectedTeacher.designation}</p>
                    <p className="text-sm text-purple-200">ID: {selectedTeacher.teacherId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-200">Basic Salary</p>
                    <p className="text-2xl font-bold">Rs. {selectedTeacher.salary.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              {/* Payment Period */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Payment Period
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select
                      value={paymentData.month}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select
                      value={paymentData.year}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isAlreadyPaid() && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      ⚠️ Salary for {months[paymentData.month - 1]} {paymentData.year} has already been paid.
                    </p>
                  </div>
                )}
              </Card>

              {/* Salary Details */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-gray-600" />
                  Salary Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (Rs.)</label>
                    <input
                      type="number"
                      value={paymentData.basicSalary}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowances (Rs.)</label>
                    <input
                      type="number"
                      value={paymentData.allowances}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, allowances: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deductions (Rs.)</label>
                    <input
                      type="number"
                      value={paymentData.deductions}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, deductions: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Net Salary Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">Basic Salary</span>
                    <span>Rs. {paymentData.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">+ Allowances</span>
                    <span className="text-green-600">Rs. {paymentData.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-600">- Deductions</span>
                    <span className="text-red-600">Rs. {paymentData.deductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Net Salary</span>
                      <span className="text-xl font-bold text-blue-600">Rs. {getNetSalary().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                    <select
                      value={paymentData.paymentMode}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMode: e.target.value as SalaryPayment['paymentMode'] }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
                    <input
                      type="text"
                      value={paymentData.paymentReference}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentReference: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Transaction/Cheque number"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    value={paymentData.remarks}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, remarks: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional notes..."
                  />
                </div>
              </Card>

              {/* Action Button */}
              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handlePaySalary}
                  disabled={processing || isAlreadyPaid()}
                >
                  {processing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Banknote className="w-5 h-5 mr-2" />
                      Pay Rs. {getNetSalary().toLocaleString()}
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
