import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { saveTeacher, generateTeacherId, getTeachers, getTeacherById } from '@/store';
import type { Teacher } from '@/types';

interface AddTeacherProps {
  onNavigate: (page: string) => void;
  teacherId?: number;
}

export function AddTeacher({ onNavigate, teacherId }: AddTeacherProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [existingTeacher, setExistingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male' as Teacher['gender'],
    dateOfBirth: '',
    joiningDate: new Date().toISOString().split('T')[0],
    designation: '',
    department: '',
    qualification: '',
    salary: '',
    bankName: '',
    accountNumber: '',
    address: '',
    city: '',
    status: 'active' as Teacher['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Load existing teacher data if editing
  useEffect(() => {
    if (teacherId) {
      const teacher = getTeacherById(teacherId);
      if (teacher) {
        setIsEditMode(true);
        setExistingTeacher(teacher);
        setFormData({
          firstName: teacher.firstName || '',
          lastName: teacher.lastName || '',
          email: teacher.email || '',
          phone: teacher.phone || '',
          gender: teacher.gender || 'Male',
          dateOfBirth: teacher.dateOfBirth || '',
          joiningDate: teacher.joiningDate || new Date().toISOString().split('T')[0],
          designation: teacher.designation || '',
          department: teacher.department || '',
          qualification: teacher.qualification || '',
          salary: teacher.salary?.toString() || '',
          bankName: teacher.bankName || '',
          accountNumber: teacher.accountNumber || '',
          address: teacher.address || '',
          city: teacher.city || '',
          status: teacher.status || 'active',
        });
      }
    }
  }, [teacherId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.joiningDate) {
      newErrors.joiningDate = 'Joining date is required';
    }
    if (!formData.salary || parseFloat(formData.salary) <= 0) {
      newErrors.salary = 'Valid salary amount is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.phone && !/^[\d\s+-]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setSaving(true);
    
    if (isEditMode && existingTeacher) {
      // UPDATE existing teacher
      const updatedTeacher: Teacher = {
        ...existingTeacher,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        joiningDate: formData.joiningDate,
        designation: formData.designation,
        department: formData.department,
        qualification: formData.qualification,
        salary: parseFloat(formData.salary),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        address: formData.address,
        city: formData.city,
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };

      saveTeacher(updatedTeacher);
    } else {
      // CREATE new teacher
      const teachers = getTeachers();
      const newTeacher: Teacher = {
        id: teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1,
        teacherId: generateTeacherId(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        joiningDate: formData.joiningDate,
        designation: formData.designation,
        department: formData.department,
        qualification: formData.qualification,
        salary: parseFloat(formData.salary),
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        address: formData.address,
        city: formData.city,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveTeacher(newTeacher);
    }
    
    setTimeout(() => {
      setSaving(false);
      onNavigate('teachers-list');
    }, 500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => onNavigate('teachers-list')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEditMode ? 'bg-amber-100' : 'bg-blue-100'}`}>
            {isEditMode ? (
              <UserCheck className="w-6 h-6 text-amber-600" />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
            </h1>
            <p className="text-gray-600">
              {isEditMode 
                ? `Editing: ${existingTeacher?.firstName} ${existingTeacher?.lastName} (${existingTeacher?.teacherId})`
                : 'Enter teacher details and salary information'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <UserCheck className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-800">Editing Existing Teacher</p>
            <p className="text-sm text-amber-600">
              Teacher ID: {existingTeacher?.teacherId} | Joined: {existingTeacher?.joiningDate ? new Date(existingTeacher.joiningDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.designation ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="e.g., Senior Teacher, HOD"
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-500">{errors.designation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Mathematics, Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Qualification
              </label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., M.Sc., B.Ed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.joiningDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.joiningDate && (
                <p className="mt-1 text-sm text-red-500">{errors.joiningDate}</p>
              )}
            </div>

            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="resigned">Resigned</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Salary & Bank Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary & Bank Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Salary (Rs.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.salary ? 'border-red-500' : 'border-gray-200'
                }`}
                placeholder="Enter monthly salary"
                min="0"
              />
              {errors.salary && (
                <p className="mt-1 text-sm text-red-500">{errors.salary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter bank name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter account number"
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onNavigate('teachers-list')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {isEditMode ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Teacher' : 'Save Teacher'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
