import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, Download, Filter } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getStudents, getClasses, deleteStudent } from '@/store';
import type { Student } from '@/types';

interface StudentsListProps {
  onNavigate: (page: string) => void;
}

export function StudentsList({ onNavigate }: StudentsListProps) {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState<Student | null>(null);
  const [viewModal, setViewModal] = useState<Student | null>(null);

  const students = getStudents();
  const classes = getClasses();

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.fatherPhone?.includes(searchTerm);
    
    const matchesClass = !classFilter || student.classId === parseInt(classFilter);
    const matchesStatus = !statusFilter || student.status === statusFilter;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getClassName = (classId: number) => {
    return classes.find(c => c.id === classId)?.className || 'N/A';
  };

  const handleDelete = () => {
    if (deleteModal) {
      deleteStudent(deleteModal.id);
      showToast('success', 'Student deleted successfully');
      setDeleteModal(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'left':
        return <Badge variant="danger">Left</Badge>;
      case 'passed_out':
        return <Badge variant="info">Passed Out</Badge>;
      case 'transferred':
        return <Badge variant="warning">Transferred</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Student Directory</h2>
          <p className="text-sm text-gray-500">{filteredStudents.length} students found</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => onNavigate('students-add')}>
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
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
                ...classes.map(c => ({ value: c.id, label: c.className }))
              ]}
            />
          </div>
          <div className="w-40">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'left', label: 'Left' },
                { value: 'passed_out', label: 'Passed Out' },
                { value: 'transferred', label: 'Transferred' },
              ]}
            />
          </div>
          <Button variant="ghost" icon={<Filter className="w-4 h-4" />}>
            More Filters
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Class</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Father's Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Monthly Fee</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {student.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500">{student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{getClassName(student.classId)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{student.fatherName}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{student.fatherPhone || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">Rs. {student.monthlyFee.toLocaleString()}</td>
                  <td className="py-3 px-4">{getStatusBadge(student.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => setViewModal(student)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onNavigate(`students-edit-${student.id}`)}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteModal(student)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No students found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={!!viewModal}
        onClose={() => setViewModal(null)}
        title="Student Details"
        size="lg"
      >
        {viewModal && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                {viewModal.firstName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{viewModal.firstName} {viewModal.lastName}</h3>
                <p className="text-gray-500">{viewModal.studentId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Class</p>
                <p className="font-medium">{getClassName(viewModal.classId)}</p>
              </div>
              <div>
                <p className="text-gray-500">Admission Number</p>
                <p className="font-medium">{viewModal.admissionNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">Father's Name</p>
                <p className="font-medium">{viewModal.fatherName}</p>
              </div>
              <div>
                <p className="text-gray-500">Contact</p>
                <p className="font-medium">{viewModal.fatherPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500">Monthly Fee</p>
                <p className="font-medium text-emerald-600">Rs. {viewModal.monthlyFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Transport Fee</p>
                <p className="font-medium">Rs. {viewModal.transportFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Admission Date</p>
                <p className="font-medium">{viewModal.admissionDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                {getStatusBadge(viewModal.status)}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={() => onNavigate('fees-collect')}>
                Collect Fee
              </Button>
              <Button variant="secondary" onClick={() => setViewModal(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Student"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteModal?.firstName} {deleteModal?.lastName}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete} className="flex-1">
              Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeleteModal(null)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
