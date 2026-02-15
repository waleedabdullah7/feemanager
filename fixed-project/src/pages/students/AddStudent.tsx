import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, User, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { saveStudent, getClasses, generateStudentId, getStudentById } from '@/store';
import type { Student } from '@/types';

interface AddStudentProps {
  onNavigate: (page: string) => void;
  studentId?: number;
}

export function AddStudent({ onNavigate, studentId }: AddStudentProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const existingStudentRef = useRef<Student | null>(null);
  const classes = getClasses();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    admissionNumber: '',
    rollNumber: '',
    classId: classes[0]?.id?.toString() || '1',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    motherName: '',
    motherPhone: '',
    monthlyFee: '5000',
    transportOpted: false,
    transportFee: '0',
    admissionDate: new Date().toISOString().split('T')[0],
    address: '',
    city: '',
    state: '',
    pincode: '',
    status: 'active',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load existing student data if editing
  useEffect(() => {
    if (studentId) {
      const student = getStudentById(studentId);
      if (student) {
        setIsEditMode(true);
        existingStudentRef.current = student;
        // Populate all form fields with student data
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          gender: student.gender || 'Male',
          dateOfBirth: student.dateOfBirth || '',
          admissionNumber: student.admissionNumber || '',
          rollNumber: student.rollNumber || '',
          classId: student.classId?.toString() || '1',
          fatherName: student.fatherName || '',
          fatherPhone: student.fatherPhone || '',
          fatherEmail: student.fatherEmail || '',
          motherName: student.motherName || '',
          motherPhone: student.motherPhone || '',
          monthlyFee: student.monthlyFee?.toString() || '5000',
          transportOpted: student.transportOpted || false,
          transportFee: student.transportFee?.toString() || '0',
          admissionDate: student.admissionDate || '',
          address: student.address || '',
          city: student.city || '',
          state: student.state || '',
          pincode: student.pincode || '',
          status: student.status || 'active',
          remarks: student.remarks || '',
        });
      }
    }
  }, [studentId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.fatherName.trim()) newErrors.fatherName = "Father's name is required";
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = 'Admission number is required';
    if (!formData.monthlyFee || parseFloat(formData.monthlyFee) <= 0) {
      newErrors.monthlyFee = 'Valid monthly fee is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (isEditMode && existingStudentRef.current) {
        const updatedStudent: Student = {
          ...existingStudentRef.current,
          admissionNumber: formData.admissionNumber,
          rollNumber: formData.rollNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as 'Male' | 'Female' | 'Other',
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          fatherEmail: formData.fatherEmail,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          classId: parseInt(formData.classId),
          admissionDate: formData.admissionDate,
          monthlyFee: parseFloat(formData.monthlyFee),
          transportOpted: formData.transportOpted,
          transportFee: parseFloat(formData.transportFee) || 0,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          status: formData.status as any,
          remarks: formData.remarks,
          updatedAt: new Date().toISOString(),
        };

        saveStudent(updatedStudent);
        showToast('success', 'Student updated successfully!');
      } else {
        const newStudent: Student = {
          id: Date.now(),
          studentId: generateStudentId(),
          admissionNumber: formData.admissionNumber,
          rollNumber: formData.rollNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as 'Male' | 'Female' | 'Other',
          fatherName: formData.fatherName,
          fatherPhone: formData.fatherPhone,
          fatherEmail: formData.fatherEmail,
          motherName: formData.motherName,
          motherPhone: formData.motherPhone,
          academicYearId: 1,
          classId: parseInt(formData.classId),
          admissionDate: formData.admissionDate,
          monthlyFee: parseFloat(formData.monthlyFee),
          feeCategory: 'regular',
          transportOpted: formData.transportOpted,
          transportFee: parseFloat(formData.transportFee) || 0,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          status: formData.status as any,
          remarks: formData.remarks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        saveStudent(newStudent);
        showToast('success', 'Student registered successfully!');
      }
      onNavigate('students-list');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full h-11 px-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => onNavigate('students-list')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back
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
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Edit Student' : 'Add New Student'}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditMode 
                ? `Editing: ${existingStudentRef.current?.firstName} ${existingStudentRef.current?.lastName} (${existingStudentRef.current?.studentId})`
                : 'Fill in the student details below'
              }
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </Card>

          {/* Academic Information */}
          <Card>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Admission Number *</label>
                <input
                  name="admissionNumber"
                  value={formData.admissionNumber}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                {errors.admissionNumber && <p className="text-red-500 text-xs mt-1">{errors.admissionNumber}</p>}
              </div>
              <div>
                <label className={labelClass}>Roll Number</label>
                <input
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Class *</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Admission Date</label>
                <input
                  name="admissionDate"
                  type="date"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="active">Active</option>
                  <option value="left">Left</option>
                  <option value="passed_out">Passed Out</option>
                  <option value="transferred">Transferred</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Parent Information */}
          <Card>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Father's Name *</label>
                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
              </div>
              <div>
                <label className={labelClass}>Father's Phone</label>
                <input
                  name="fatherPhone"
                  value={formData.fatherPhone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Father's Email</label>
                <input
                  name="fatherEmail"
                  type="email"
                  value={formData.fatherEmail}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mother's Name</label>
                <input
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mother's Phone</label>
                <input
                  name="motherPhone"
                  value={formData.motherPhone}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </Card>

          {/* Address */}
          <Card>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Address</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State/Province</label>
                  <input name="state" value={formData.state} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Fee Information */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Fee Information</h3>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Monthly Fee (Rs.) *</label>
                <input
                  name="monthlyFee"
                  type="number"
                  value={formData.monthlyFee}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                {errors.monthlyFee && <p className="text-red-500 text-xs mt-1">{errors.monthlyFee}</p>}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="transportOpted"
                  name="transportOpted"
                  checked={formData.transportOpted}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="transportOpted" className="text-sm text-gray-700 font-medium">Transport Required</label>
              </div>
              {formData.transportOpted && (
                <div>
                  <label className={labelClass}>Transport Fee (Rs.)</label>
                  <input
                    name="transportFee"
                    type="number"
                    value={formData.transportFee}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </Card>

          <Card className={`${isEditMode ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className={`text-md font-semibold mb-2 ${isEditMode ? 'text-amber-900' : 'text-blue-900'}`}>Fee Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={isEditMode ? 'text-amber-700' : 'text-blue-700'}>Monthly Fee</span>
                <span className={`font-medium ${isEditMode ? 'text-amber-900' : 'text-blue-900'}`}>Rs. {parseFloat(formData.monthlyFee) || 0}</span>
              </div>
              {formData.transportOpted && (
                <div className="flex justify-between">
                  <span className={isEditMode ? 'text-amber-700' : 'text-blue-700'}>Transport Fee</span>
                  <span className={`font-medium ${isEditMode ? 'text-amber-900' : 'text-blue-900'}`}>Rs. {parseFloat(formData.transportFee) || 0}</span>
                </div>
              )}
              <div className={`border-t pt-2 flex justify-between ${isEditMode ? 'border-amber-200' : 'border-blue-200'}`}>
                <span className={`font-semibold ${isEditMode ? 'text-amber-800' : 'text-blue-800'}`}>Total Monthly</span>
                <span className={`font-bold ${isEditMode ? 'text-amber-900' : 'text-blue-900'}`}>
                  Rs. {(parseFloat(formData.monthlyFee) || 0) + (formData.transportOpted ? parseFloat(formData.transportFee) || 0 : 0)}
                </span>
              </div>
            </div>
          </Card>

          <Button 
            className="w-full" 
            size="lg" 
            type="submit"
            loading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            {isEditMode ? 'Update Student' : 'Save Student'}
          </Button>

          {isEditMode && (
            <Button 
              className="w-full" 
              size="lg" 
              variant="secondary"
              type="button"
              onClick={() => onNavigate('students-list')}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
