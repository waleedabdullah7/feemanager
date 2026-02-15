import { useState } from 'react';
import { 
  Search, Plus, Edit, Trash2, Eye, Banknote, 
  Phone, Mail, MoreVertical, UserX, UserCheck
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getTeachers, deleteTeacher } from '@/store';
import type { Teacher } from '@/types';

interface TeachersListProps {
  onNavigate: (page: string) => void;
}

export function TeachersList({ onNavigate }: TeachersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [teachers, setTeachers] = useState<Teacher[]>(getTeachers());
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone?.includes(searchTerm) ||
      teacher.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (teacherId: number) => {
    deleteTeacher(teacherId);
    setTeachers(getTeachers());
    setShowDeleteModal(null);
  };

  const getStatusBadge = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'resigned':
        return <Badge variant="warning">Resigned</Badge>;
      case 'terminated':
        return <Badge variant="danger">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Teachers</h1>
          <p className="text-gray-600">Manage teacher records and salary</p>
        </div>
        <Button onClick={() => onNavigate('teachers-add')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="resigned">Resigned</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card padding="none">
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-16">
            <UserX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Found</h3>
            <p className="text-gray-600 mb-6">
              {teachers.length === 0 
                ? "You haven't added any teachers yet. Add your first teacher to get started."
                : "No teachers match your search criteria."}
            </p>
            {teachers.length === 0 && (
              <Button onClick={() => onNavigate('teachers-add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Teacher
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {teacher.firstName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {teacher.firstName} {teacher.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{teacher.teacherId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{teacher.designation}</p>
                      {teacher.department && (
                        <p className="text-sm text-gray-500">{teacher.department}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {teacher.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {teacher.phone}
                        </div>
                      )}
                      {teacher.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail className="w-3 h-3" />
                          {teacher.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        Rs. {teacher.salary.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">per month</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(teacher.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`teachers-view-${teacher.id}`)}
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate(`teachers-edit-${teacher.id}`)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onNavigate('salary-pay')}
                          title="Pay Salary"
                          className="text-green-600 hover:text-green-700"
                        >
                          <Banknote className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDeleteModal(teacher.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Active Teachers</p>
              <p className="text-2xl font-bold text-green-700">
                {teachers.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Banknote className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Total Monthly Salary</p>
              <p className="text-2xl font-bold text-purple-700">
                Rs. {teachers.filter(t => t.status === 'active').reduce((sum, t) => sum + t.salary, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MoreVertical className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Teachers</p>
              <p className="text-2xl font-bold text-blue-700">{teachers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Teacher</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this teacher? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteModal(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteModal)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
