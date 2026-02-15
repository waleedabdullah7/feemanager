// Types for School Fee Manager Pro

export interface SchoolInfo {
  id?: number;
  schoolName: string;
  schoolCode?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phonePrimary?: string;
  phoneSecondary?: string;
  email?: string;
  website?: string;
  logoPath?: string;
  principalName?: string;
  affiliationBoard?: string;
  affiliationNumber?: string;
  establishedYear?: string;
  motto?: string;
}

export interface Teacher {
  id: number;
  teacherId: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth?: string;
  joiningDate: string;
  designation: string;
  department?: string;
  qualification?: string;
  salary: number;
  bankName?: string;
  accountNumber?: string;
  address?: string;
  city?: string;
  status: 'active' | 'resigned' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface SalaryPayment {
  id: number;
  paymentId: string;
  teacherId: number;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  paymentMode: 'cash' | 'cheque' | 'bank_transfer';
  paymentReference?: string;
  status: 'paid' | 'pending';
  remarks?: string;
  paidBy: number;
  createdAt: string;
}

export interface User {
  id: number;
  userId: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'admin' | 'accountant' | 'staff' | 'viewer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AcademicYear {
  id: number;
  yearName: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isActive: boolean;
}

export interface ClassInfo {
  id: number;
  className: string;
  classCode: string;
  displayOrder: number;
  isActive: boolean;
  sections: Section[];
}

export interface Section {
  id: number;
  classId: number;
  sectionName: string;
  capacity: number;
  isActive: boolean;
}

export interface FeeHead {
  id: number;
  headName: string;
  headCode: string;
  description?: string;
  isRecurring: boolean;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  isMandatory: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface FeeStructure {
  id: number;
  academicYearId: number;
  classId: number;
  feeHeadId: number;
  amount: number;
  dueDay: number;
  lateFeePerDay: number;
  maxLateFee: number;
  isActive: boolean;
}

export interface Student {
  id: number;
  studentId: string;
  admissionNumber: string;
  rollNumber?: string;
  firstName: string;
  lastName?: string;
  dateOfBirth?: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  photoPath?: string;
  fatherName: string;
  fatherPhone?: string;
  fatherEmail?: string;
  motherName?: string;
  motherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  academicYearId: number;
  classId: number;
  sectionId?: number;
  admissionDate: string;
  monthlyFee: number;
  feeCategory: 'regular' | 'sibling' | 'scholarship' | 'staff';
  transportOpted: boolean;
  transportFee: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: 'active' | 'left' | 'passed_out' | 'transferred';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeRecord {
  id: number;
  receiptNumber: string;
  studentId: number;
  academicYearId: number;
  feeMonth: number;
  feeYear: number;
  totalFee: number;
  concessionAmount: number;
  lateFee: number;
  previousDue: number;
  netPayable: number;
  amountPaid: number;
  balanceDue: number;
  paymentDate: string;
  paymentMode: 'cash' | 'cheque' | 'upi' | 'card' | 'bank_transfer' | 'online';
  paymentReference?: string;
  bankName?: string;
  chequeNumber?: string;
  status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  remarks?: string;
  collectedBy: number;
  createdAt: string;
}

export interface GoogleApiConfig {
  isEnabled: boolean;
  credentialsJson?: string;
  clientEmail?: string;
  privateKey?: string;
  spreadsheetId?: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  driveFolderId?: string;
  driveFolderName?: string;
  lastSyncAt?: string;
  syncFrequency: number;
  autoSyncEnabled: boolean;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncError?: string;
}

export interface BackupFile {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  type: 'local' | 'cloud';
  driveFileId?: string;
  driveUrl?: string;
}

export interface AppState {
  isSetupComplete: boolean;
  currentUser: User | null;
  schoolInfo: SchoolInfo | null;
  theme: 'light' | 'dark';
}

export interface DashboardStats {
  totalStudents: number;
  totalCollected: number;
  pendingFees: number;
  todayCollection: number;
  recentTransactions: FeeRecord[];
  topDefaulters: { student: Student; amount: number }[];
  classWiseCollection: { className: string; collected: number; total: number }[];
}
