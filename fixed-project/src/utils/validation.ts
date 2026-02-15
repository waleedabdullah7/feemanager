// Robust Input Validation for School Fee Manager Pro
import type { Student, Teacher, FeeRecord } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate Student Data
 */
export const validateStudent = (student: Partial<Student>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!student.firstName || student.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name must be at least 2 characters' });
  }
  
  if (!student.fatherName || student.fatherName.trim().length < 2) {
    errors.push({ field: 'fatherName', message: "Father's name is required" });
  }

  if (student.fatherPhone && !/^[\d\s+-]{10,15}$/.test(student.fatherPhone)) {
    errors.push({ field: 'fatherPhone', message: 'Invalid phone number format' });
  }

  if (student.monthlyFee !== undefined && student.monthlyFee < 0) {
    errors.push({ field: 'monthlyFee', message: 'Monthly fee cannot be negative' });
  }

  return errors;
};

/**
 * Validate Teacher Data
 */
export const validateTeacher = (teacher: Partial<Teacher>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!teacher.firstName || teacher.firstName.trim().length < 2) {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }

  if (!teacher.designation || teacher.designation.trim().length < 2) {
    errors.push({ field: 'designation', message: 'Designation is required' });
  }

  if (teacher.salary !== undefined && teacher.salary < 0) {
    errors.push({ field: 'salary', message: 'Salary cannot be negative' });
  }

  return errors;
};

/**
 * Sanitize Input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
