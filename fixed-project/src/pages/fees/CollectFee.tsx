import { useState } from 'react';
import { Search, Receipt, CreditCard, Banknote, Smartphone, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { getStudents, getClasses, saveFeeRecord, generateReceiptNumber, getFeeRecords, getCurrentUser } from '@/store';
import type { Student } from '@/types';

interface CollectFeeProps {
  onNavigate?: (page: string) => void;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function CollectFee({ onNavigate: _onNavigate }: CollectFeeProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<string>('');

  const students = getStudents().filter(s => s.status === 'active');
  const classes = getClasses();

  const filteredStudents = searchTerm.length >= 2 
    ? students.filter(s => 
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fatherPhone?.includes(searchTerm)
      )
    : [];

  const getClassName = (classId: number) => {
    return classes.find(c => c.id === classId)?.className || 'N/A';
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchTerm('');
    setSelectedMonths([]);
  };

  const handleMonthToggle = (month: number) => {
    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month].sort((a, b) => a - b)
    );
  };

  const totalMonthlyFee = selectedStudent 
    ? selectedStudent.monthlyFee + (selectedStudent.transportOpted ? selectedStudent.transportFee : 0)
    : 0;

  const totalAmount = totalMonthlyFee * selectedMonths.length;

  const handleCollectFee = async () => {
    if (!selectedStudent || selectedMonths.length === 0) {
      showToast('error', 'Please select a student and at least one month');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUser = getCurrentUser();
    const feeRecords = getFeeRecords();
    const receiptNumber = generateReceiptNumber();

    selectedMonths.forEach((month, index) => {
      const record = {
        id: feeRecords.length + index + 1,
        receiptNumber: index === 0 ? receiptNumber : `${receiptNumber}-${index + 1}`,
        studentId: selectedStudent.id,
        academicYearId: 1,
        feeMonth: month,
        feeYear: new Date().getFullYear(),
        totalFee: totalMonthlyFee,
        concessionAmount: 0,
        lateFee: 0,
        previousDue: 0,
        netPayable: totalMonthlyFee,
        amountPaid: totalMonthlyFee,
        balanceDue: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMode: paymentMode as 'cash' | 'cheque' | 'upi' | 'card' | 'bank_transfer',
        paymentReference,
        status: 'paid' as const,
        remarks,
        collectedBy: currentUser?.id || 1,
        createdAt: new Date().toISOString(),
      };
      saveFeeRecord(record);
    });

    setLastReceipt(receiptNumber);
    setShowReceipt(true);
    setLoading(false);
    showToast('success', `Fee collected successfully! Receipt: ${receiptNumber}`);
  };

  const handleNewCollection = () => {
    setSelectedStudent(null);
    setSelectedMonths([]);
    setPaymentMode('cash');
    setPaymentReference('');
    setRemarks('');
    setShowReceipt(false);
  };

  if (showReceipt && selectedStudent) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600 mt-1">Receipt Number: <span className="font-semibold">{lastReceipt}</span></p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Student Name</p>
                <p className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
              </div>
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-medium">{getClassName(selectedStudent.classId)}</p>
              </div>
              <div>
                <p className="text-gray-500">Months Paid</p>
                <p className="font-medium">{selectedMonths.map(m => months[m - 1]).join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Mode</p>
                <p className="font-medium capitalize">{paymentMode}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Total Amount Paid</p>
                <p className="text-2xl font-bold text-emerald-600">Rs. {totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => window.print()}>
              Print Receipt
            </Button>
            <Button className="flex-1" onClick={handleNewCollection}>
              Collect Another Fee
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Search & Select Student */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Student</h3>
            <div className="relative">
              <Input
                placeholder="Search by name, ID, or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
              {filteredStudents.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredStudents.map(student => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.studentId} • {getClassName(student.classId)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Selected Student Details */}
          {selectedStudent && (
            <>
              <Card>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
                      {selectedStudent.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <p className="text-gray-500">{selectedStudent.studentId}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>
                    Change Student
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Class</p>
                    <p className="font-medium">{getClassName(selectedStudent.classId)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Father's Name</p>
                    <p className="font-medium">{selectedStudent.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Contact</p>
                    <p className="font-medium">{selectedStudent.fatherPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly Fee</p>
                    <p className="font-medium text-emerald-600">Rs. {selectedStudent.monthlyFee.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              {/* Month Selection */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Months to Pay</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {months.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => handleMonthToggle(index + 1)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedMonths.includes(index + 1)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
                {selectedMonths.length > 0 && (
                  <p className="mt-4 text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedMonths.map(m => months[m - 1]).join(', ')}</span>
                  </p>
                )}
              </Card>

              {/* Payment Details */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'cash', label: 'Cash', icon: Banknote },
                        { id: 'upi', label: 'UPI', icon: Smartphone },
                        { id: 'card', label: 'Card', icon: CreditCard },
                        { id: 'bank_transfer', label: 'Bank', icon: Building2 },
                      ].map(mode => (
                        <button
                          key={mode.id}
                          onClick={() => setPaymentMode(mode.id)}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            paymentMode === mode.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600'
                          }`}
                        >
                          <mode.icon className="w-4 h-4" />
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Input
                      label="Reference / Transaction ID"
                      placeholder="Enter reference number"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                    />
                  </div>
                </div>
                <Textarea
                  label="Remarks (Optional)"
                  placeholder="Any additional notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                />
              </Card>
            </>
          )}
        </div>

        {/* Right Panel - Fee Summary */}
        <div>
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fee Summary</h3>
            
            {selectedStudent ? (
              <div className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuition Fee</span>
                    <span className="font-medium">Rs. {selectedStudent.monthlyFee.toLocaleString()}</span>
                  </div>
                  {selectedStudent.transportOpted && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transport Fee</span>
                      <span className="font-medium">Rs. {selectedStudent.transportFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium text-gray-700">Monthly Total</span>
                    <span className="font-semibold">Rs. {totalMonthlyFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Months Selected</span>
                    <Badge variant="info">{selectedMonths.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Payable</span>
                    <span className="text-2xl font-bold text-blue-600">Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCollectFee}
                  loading={loading}
                  disabled={selectedMonths.length === 0}
                  icon={<Receipt className="w-5 h-5" />}
                >
                  Collect Fee
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Search and select a student to collect fee</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
