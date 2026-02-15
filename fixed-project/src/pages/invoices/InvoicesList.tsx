import { useState } from 'react';
import { Search, Download, Printer, Eye, FileText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getFeeRecords, getStudents, getClasses, getSchoolInfo, formatCurrency } from '@/store';
import { generateFeeReceipt, downloadInvoicesAsCSV } from '@/utils/pdfGenerator';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function InvoicesList() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewInvoice, setViewInvoice] = useState<typeof feeRecords[0] | null>(null);
  const [downloading, setDownloading] = useState(false);

  const feeRecords = getFeeRecords();
  const students = getStudents();
  const classes = getClasses();
  const schoolInfo = getSchoolInfo();

  const filteredRecords = feeRecords.filter(record => {
    const student = students.find(s => s.id === record.studentId);
    const matchesSearch = 
      record.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStudent = (studentId: number) => {
    return students.find(s => s.id === studentId);
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
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Generate and download PDF invoice using the PDF generator
  const handleDownloadInvoice = (record: typeof feeRecords[0]) => {
    setDownloading(true);
    try {
      generateFeeReceipt(record);
      showToast('success', `Invoice ${record.receiptNumber} opened for printing!`);
    } catch (error) {
      showToast('error', 'Failed to generate invoice');
    } finally {
      setDownloading(false);
    }
  };

  // Export all invoices as CSV
  const handleExportAll = () => {
    try {
      downloadInvoicesAsCSV(filteredRecords);
      showToast('success', 'Invoices exported successfully!');
    } catch (error) {
      showToast('error', 'Failed to export invoices');
    }
  };

  const handlePrint = (record: typeof feeRecords[0]) => {
    try {
      generateFeeReceipt(record);
    } catch (error) {
      showToast('error', 'Please allow pop-ups to print invoice');
    }
  };

  if (feeRecords.length === 0) {
    return (
      <div className="p-6">
        <Card className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Found</h3>
          <p className="text-gray-600">Invoices will appear here after fee collection</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search by invoice or student..."
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
              ]}
            />
          </div>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExportAll}>
            Export All CSV
          </Button>
        </div>
      </Card>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.map((record) => {
          const student = getStudent(record.studentId);
          return (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-mono text-sm font-semibold text-blue-600">{record.receiptNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(record.paymentDate).toLocaleDateString('en-PK')}</p>
                </div>
                {getStatusBadge(record.status)}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="font-medium text-gray-900">
                  {student?.firstName} {student?.lastName}
                </p>
                <p className="text-sm text-gray-500">{getClassName(record.studentId)}</p>
                <p className="text-sm text-gray-500">{months[record.feeMonth - 1]} {record.feeYear}</p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-900">{formatCurrency(record.amountPaid)}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setViewInvoice(record)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Invoice"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handlePrint(record)}
                    className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Print Invoice"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDownloadInvoice(record)}
                    disabled={downloading}
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Download Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredRecords.length === 0 && (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No invoices match your search criteria</p>
        </Card>
      )}

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        title="Invoice Preview"
        size="lg"
      >
        {viewInvoice && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">{schoolInfo?.schoolName || 'School Name'}</h2>
              <p className="text-sm text-gray-500">{schoolInfo?.address}</p>
              <p className="text-sm text-gray-500">{schoolInfo?.phonePrimary}</p>
            </div>

            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Receipt No.</p>
                <p className="font-mono font-semibold">{viewInvoice.receiptNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">{new Date(viewInvoice.paymentDate).toLocaleDateString('en-PK')}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Student Details</p>
              <p className="font-semibold">{getStudent(viewInvoice.studentId)?.firstName} {getStudent(viewInvoice.studentId)?.lastName}</p>
              <p className="text-sm text-gray-600">Class: {getClassName(viewInvoice.studentId)}</p>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">Description</th>
                  <th className="text-right py-2 px-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Fee for {months[viewInvoice.feeMonth - 1]} {viewInvoice.feeYear}</td>
                  <td className="py-2 px-3 text-right">{formatCurrency(viewInvoice.totalFee)}</td>
                </tr>
                {viewInvoice.concessionAmount > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Concession</td>
                    <td className="py-2 px-3 text-right text-red-600">-{formatCurrency(viewInvoice.concessionAmount)}</td>
                  </tr>
                )}
                {viewInvoice.lateFee > 0 && (
                  <tr className="border-b">
                    <td className="py-2 px-3">Late Fee</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(viewInvoice.lateFee)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-blue-50">
                <tr>
                  <td className="py-3 px-3 font-bold">Total Paid</td>
                  <td className="py-3 px-3 text-right font-bold text-blue-600">{formatCurrency(viewInvoice.amountPaid)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="text-sm text-gray-500">
              <p><strong>Payment Mode:</strong> {viewInvoice.paymentMode.replace('_', ' ').toUpperCase()}</p>
              {viewInvoice.paymentReference && (
                <p><strong>Reference:</strong> {viewInvoice.paymentReference}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="secondary" className="flex-1" icon={<Printer className="w-4 h-4" />} onClick={() => {
                handlePrint(viewInvoice);
                setViewInvoice(null);
              }}>
                Print
              </Button>
              <Button className="flex-1" icon={<Download className="w-4 h-4" />} onClick={() => {
                handleDownloadInvoice(viewInvoice);
                setViewInvoice(null);
              }}>
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
