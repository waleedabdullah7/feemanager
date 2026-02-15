// CORRECTED Store for School Fee Manager Pro - Using localStorage for persistence
// All critical bugs fixed - Version 2.0
import type { 
  SchoolInfo, User, AcademicYear, ClassInfo, 
  FeeHead, Student, FeeRecord, GoogleApiConfig,
  Teacher, SalaryPayment
} from '../types';

// Helper functions with error handling for quota
const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    const jsonString = JSON.stringify(value);
    
    // Check approximate size (roughly 1 char = 1-2 bytes)
    const sizeInMB = (jsonString.length * 2) / (1024 * 1024);
    if (sizeInMB > 4.5) {
      console.warn(`Storage for "${key}" is approaching limit: ${sizeInMB.toFixed(2)}MB`);
    }

    localStorage.setItem(key, jsonString);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      const storageInfo = getStorageInfo();
      const message = `❌ Storage Full! (${storageInfo.usedMB}MB / ${storageInfo.totalMB}MB)\n\n` +
                     `Failed to save: ${key}\n\n` +
                     `Immediate Actions Required:\n` +
                     `1. Export backup immediately\n` +
                     `2. Delete old records\n` +
                     `3. Clear browser cache`;
      alert(message);
      throw new Error(`Storage quota exceeded for: ${key}`);
    } else {
      console.error(`Error saving key "${key}" to localStorage:`, error);
      throw error;
    }
  }
};

// FIXED: Storage Health Monitoring
export const getStorageInfo = () => {
  let used = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += (localStorage[key].length + key.length) * 2;
    }
  }
  const usedMB = used / (1024 * 1024);
  const totalMB = 5; // Usual limit is 5MB
  const percentage = Math.min(100, (usedMB / totalMB) * 100);
  
  return {
    usedMB: usedMB.toFixed(2),
    totalMB,
    percentage: percentage.toFixed(1),
    isCritical: percentage > 90
  };
};

// School Info Management
export const getSchoolInfo = (): SchoolInfo | null => {
  return getItem<SchoolInfo | null>('school_info', null);
};

export const saveSchoolInfo = (info: SchoolInfo): void => {
  setItem('school_info', info);
  logAuditAction('UPDATE', 'SchoolInfo', 0, 'Updated school settings');
};

// FIXED: ID Generation with Persistent Counter (Issue #1)
const getNextId = (entity: string): number => {
  const key = `last_${entity}_id`;
  const lastId = getItem<number>(key, 0);
  const nextId = lastId + 1;
  setItem(key, nextId);
  return nextId;
};

// User Management
export const getUsers = (): User[] => {
  return getItem<User[]>('users', []);
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  
  // Check for unique username (case insensitive)
  const duplicate = users.find(u => 
    u.username.toLowerCase() === user.username.toLowerCase() && u.id !== user.id
  );
  if (duplicate) {
    throw new Error(`Username "${user.username}" is already taken.`);
  }

  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
    logAuditAction('UPDATE', 'User', user.id, `Updated user: ${user.username}`);
  } else {
    users.push(user);
    logAuditAction('CREATE', 'User', user.id, `Created user: ${user.username}`);
  }
  setItem('users', users);
};

export const deleteUser = (userId: number): void => {
  const user = getUsers().find(u => u.id === userId);
  if (!user) return;
  
  // Soft delete - just mark as inactive
  const updatedUser = { ...user, isActive: false };
  saveUser(updatedUser);
  logAuditAction('DELETE_SOFT', 'User', userId, `Deactivated user: ${user.username}`);
};

export const getUserByUsername = (username: string): User | undefined => {
  return getUsers().find(u => 
    u.username.toLowerCase() === username.toLowerCase() && u.isActive
  );
};

// FIXED: Proper Password Hashing using Web Crypto API (Issue #2)
const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

const hexToArrayBuffer = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

export const hashPassword = async (password: string, saltHex?: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = saltHex ? hexToArrayBuffer(saltHex) : generateSalt();
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );
  
  const hashHex = arrayBufferToHex(derivedBits);
  const saltHexStr = arrayBufferToHex(salt);
  
  return `${saltHexStr}:${hashHex}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
  // Migration for old hashes
  if (!storedHash.includes(':')) {
    // Old btoa hash - force password reset
    return false;
  }
  
  const [saltHex] = storedHash.split(':');
  const newHash = await hashPassword(password, saltHex);
  return newHash === storedHash;
};

export const createAdminUser = async (
  username: string, 
  password: string, 
  fullName: string, 
  email: string
): Promise<User> => {
  // FIXED: Use persistent ID counter
  const nextId = getNextId('user');

  const newUser: User = {
    id: nextId,
    userId: `USR-${String(nextId).padStart(3, '0')}`,
    username,
    passwordHash: await hashPassword(password),
    fullName,
    email,
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString()
  };
  saveUser(newUser);
  return newUser;
};

// Session Management
export const getCurrentUser = (): User | null => {
  return getItem<User | null>('current_user', null);
};

export const setCurrentUser = (user: User | null): void => {
  setItem('current_user', user);
};

export const login = async (username: string, password: string): Promise<User | null> => {
  const user = getUserByUsername(username);
  if (user && user.isActive) {
    const isValid = await verifyPassword(password, user.passwordHash);
    if (isValid) {
      // Auto-upgrade old password hash if needed
      if (!user.passwordHash.includes(':')) {
        user.passwordHash = await hashPassword(password);
        saveUser(user);
      }

      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      saveUser(updatedUser);
      setCurrentUser(updatedUser);
      logAuditAction('LOGIN', 'User', user.id, `User logged in: ${user.username}`);
      return updatedUser;
    }
  }
  return null;
};

export const logout = (): void => {
  const user = getCurrentUser();
  if (user) logAuditAction('LOGOUT', 'User', user.id, `User logged out: ${user.username}`);
  setCurrentUser(null);
};

// Academic Year Management
export const getAcademicYears = (): AcademicYear[] => {
  return getItem<AcademicYear[]>('academic_years', []);
};

export const saveAcademicYear = (year: AcademicYear): void => {
  const years = getAcademicYears();
  if (year.isCurrent) {
    years.forEach(y => y.isCurrent = false);
  }
  const existingIndex = years.findIndex(y => y.id === year.id);
  if (existingIndex >= 0) {
    years[existingIndex] = year;
  } else {
    years.push(year);
  }
  setItem('academic_years', years);
};

export const getCurrentAcademicYear = (): AcademicYear | undefined => {
  return getAcademicYears().find(y => y.isCurrent);
};

// Class Management
export const getClasses = (): ClassInfo[] => {
  return getItem<ClassInfo[]>('classes', []);
};

export const saveClass = (classInfo: ClassInfo): void => {
  const classes = getClasses();
  const existingIndex = classes.findIndex(c => c.id === classInfo.id);
  if (existingIndex >= 0) {
    classes[existingIndex] = classInfo;
  } else {
    classes.push(classInfo);
  }
  setItem('classes', classes);
};

export const deleteClass = (classId: number): void => {
  const classes = getClasses().filter(c => c.id !== classId);
  setItem('classes', classes);
};

// Fee Heads
export const getFeeHeads = (): FeeHead[] => {
  return getItem<FeeHead[]>('fee_heads', []);
};

export const saveFeeHead = (feeHead: FeeHead): void => {
  const feeHeads = getFeeHeads();
  const existingIndex = feeHeads.findIndex(f => f.id === feeHead.id);
  if (existingIndex >= 0) {
    feeHeads[existingIndex] = feeHead;
  } else {
    feeHeads.push(feeHead);
  }
  setItem('fee_heads', feeHeads);
};

// Students
export const getStudents = (): Student[] => {
  return getItem<Student[]>('students', []);
};

export const saveStudent = (student: Student): void => {
  const students = getStudents();
  const existingIndex = students.findIndex(s => s.id === student.id);
  if (existingIndex >= 0) {
    students[existingIndex] = { ...student, updatedAt: new Date().toISOString() };
    logAuditAction('UPDATE', 'Student', student.id, `Updated student: ${student.firstName}`);
  } else {
    students.push(student);
    logAuditAction('CREATE', 'Student', student.id, `Admitted student: ${student.firstName}`);
  }
  setItem('students', students);
};

// FIXED: Soft delete students (Issue #10)
export const deleteStudent = (studentId: number): void => {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;
  
  // Soft delete - change status instead of removing
  const updatedStudent = { 
    ...student, 
    status: 'left' as const,
    updatedAt: new Date().toISOString() 
  };
  saveStudent(updatedStudent);
  
  logAuditAction('DELETE_SOFT', 'Student', studentId, 
    `Marked student as left: ${student.firstName} ${student.lastName} (${student.studentId})`);
};

export const getStudentById = (id: number): Student | undefined => {
  return getStudents().find(s => s.id === id);
};

// FIXED: Unique receipt number generation (Issue #8)
export const generateReceiptNumber = (): string => {
  const year = new Date().getFullYear();
  const timestamp = Date.now();
  const nextSeq = getNextId('receipt');
  return `FEE-${year}-${String(nextSeq).padStart(5, '0')}-${timestamp}`;
};

export const generateStudentId = (): string => {
  const year = new Date().getFullYear();
  const nextSeq = getNextId('student');
  return `STU-${year}-${String(nextSeq).padStart(4, '0')}`;
};

// Fee Records
export const getFeeRecords = (): FeeRecord[] => {
  return getItem<FeeRecord[]>('fee_records', []);
};

// FIXED: Check for duplicate fee collection (Issue #3)
export const checkDuplicateFee = (
  studentId: number, 
  feeMonth: number, 
  feeYear: number
): FeeRecord | undefined => {
  return getFeeRecords().find(r => 
    r.studentId === studentId &&
    r.feeMonth === feeMonth &&
    r.feeYear === feeYear &&
    r.status === 'paid'
  );
};

export const saveFeeRecord = (record: FeeRecord): void => {
  const records = getFeeRecords();
  
  // Check for duplicate
  const duplicate = checkDuplicateFee(record.studentId, record.feeMonth, record.feeYear);
  if (duplicate && record.id !== duplicate.id) {
    throw new Error(`Fee already collected for this month: ${duplicate.receiptNumber}`);
  }
  
  const existingIndex = records.findIndex(r => r.id === record.id);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  setItem('fee_records', records);
  logAuditAction('CREATE', 'FeeRecord', record.id, 
    `Collected fee: ${record.receiptNumber} - Rs. ${record.amountPaid}`);
};

// FIXED: Get local date without timezone issues (Issue #9)
export const getLocalDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Teacher Management
export const getTeachers = (): Teacher[] => {
  return getItem<Teacher[]>('teachers', []);
};

export const saveTeacher = (teacher: Teacher): void => {
  const teachers = getTeachers();
  const existingIndex = teachers.findIndex(t => t.id === teacher.id);
  if (existingIndex >= 0) {
    teachers[existingIndex] = { ...teacher, updatedAt: new Date().toISOString() };
    logAuditAction('UPDATE', 'Teacher', teacher.id, `Updated teacher: ${teacher.firstName}`);
  } else {
    teachers.push(teacher);
    logAuditAction('CREATE', 'Teacher', teacher.id, `Appointed teacher: ${teacher.firstName}`);
  }
  setItem('teachers', teachers);
};

// FIXED: Soft delete teachers (Issue #10)
export const deleteTeacher = (teacherId: number): void => {
  const teacher = getTeachers().find(t => t.id === teacherId);
  if (!teacher) return;
  
  // Soft delete - change status
  const updatedTeacher = { 
    ...teacher, 
    status: 'resigned' as const,
    updatedAt: new Date().toISOString() 
  };
  saveTeacher(updatedTeacher);
  
  logAuditAction('DELETE_SOFT', 'Teacher', teacherId, 
    `Marked teacher as resigned: ${teacher.firstName} ${teacher.lastName}`);
};

export const getTeacherById = (id: number): Teacher | undefined => {
  return getTeachers().find(t => t.id === id);
};

export const generateTeacherId = (): string => {
  const year = new Date().getFullYear();
  const nextSeq = getNextId('teacher');
  return `TCH-${year}-${String(nextSeq).padStart(4, '0')}`;
};

// Salary Payments
export const getSalaryPayments = (): SalaryPayment[] => {
  return getItem<SalaryPayment[]>('salary_payments', []);
};

export const saveSalaryPayment = (payment: SalaryPayment): void => {
  const payments = getSalaryPayments();
  const existingIndex = payments.findIndex(p => p.id === payment.id);
  if (existingIndex >= 0) {
    payments[existingIndex] = payment;
  } else {
    payments.push(payment);
  }
  setItem('salary_payments', payments);
  logAuditAction('CREATE', 'SalaryPayment', payment.id, 
    `Paid salary: ${payment.paymentId} - Rs. ${payment.netSalary}`);
};

export const generatePaymentId = (): string => {
  const year = new Date().getFullYear();
  const nextSeq = getNextId('salary_payment');
  return `SAL-${year}-${String(nextSeq).padStart(4, '0')}`;
};

export const getTeacherSalaryPayments = (teacherId: number): SalaryPayment[] => {
  return getSalaryPayments().filter(p => p.teacherId === teacherId);
};

// FIXED: Standardized currency formatting (Issue #6)
export const formatCurrency = (amount: number, compact = false): string => {
  if (compact) {
    if (amount >= 10000000) return `Rs. ${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `Rs. ${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }
  return `Rs. ${amount.toLocaleString('en-PK')}`;
};

// FIXED: Student Promotion with proper class validation (Issue #4)
export const promoteStudents = (
  promotionData: { studentId: number; action: 'promote' | 'same' | 'passed_out' }[]
) => {
  const students = getStudents();
  const classes = getClasses().sort((a, b) => a.displayOrder - b.displayOrder);
  
  let promotedCount = 0;
  let detainedCount = 0;
  let passedOutCount = 0;
  let errors: string[] = [];

  const updatedStudents = students.map(student => {
    const promotion = promotionData.find(p => p.studentId === student.id);
    if (!promotion) return student;

    if (promotion.action === 'promote') {
      const currentClass = classes.find(c => c.id === student.classId);
      if (!currentClass) {
        errors.push(`Student ${student.studentId}: Class not found`);
        return student;
      }
      
      const nextClass = classes.find(c => c.displayOrder === currentClass.displayOrder + 1);
      
      if (!nextClass) {
        // No next class - must pass out
        passedOutCount++;
        return { 
          ...student, 
          status: 'passed_out' as const, 
          updatedAt: new Date().toISOString() 
        };
      } else {
        promotedCount++;
        return { 
          ...student, 
          classId: nextClass.id, 
          updatedAt: new Date().toISOString() 
        };
      }
    } else if (promotion.action === 'passed_out') {
      passedOutCount++;
      return { 
        ...student, 
        status: 'passed_out' as const, 
        updatedAt: new Date().toISOString() 
      };
    } else {
      detainedCount++;
      return student;
    }
  });

  setItem('students', updatedStudents);
  logAuditAction('PROMOTION', 'Student', 0, 
    `Processed promotion: ${promotedCount} promoted, ${detainedCount} detained, ${passedOutCount} passed out`);
  
  return {
    total: promotionData.length,
    promoted: promotedCount,
    detained: detainedCount,
    passedOut: passedOutCount,
    errors
  };
};

// Audit Trail
export interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'IMPORT' | 
          'DELETE_SOFT' | 'DELETE_HARD' | 'PROMOTION';
  entity: string;
  entityId: number;
  details: string;
}

export const getAuditLogs = (): AuditLog[] => {
  return getItem<AuditLog[]>('audit_logs', []);
};

export const logAuditAction = (
  action: AuditLog['action'], 
  entity: string, 
  entityId: number, 
  details: string
): void => {
  const currentUser = getCurrentUser();
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    userId: currentUser?.id || 0,
    userName: currentUser?.fullName || 'System',
    action,
    entity,
    entityId,
    details
  };
  logs.unshift(newLog);
  // Keep only last 1000 logs
  if (logs.length > 1000) logs.splice(1000);
  setItem('audit_logs', logs);
};

// Setup & Configuration
export const isSetupComplete = (): boolean => {
  return getItem<boolean>('setup_complete', false);
};

export const setSetupComplete = (complete: boolean): void => {
  setItem('setup_complete', complete);
};

// Google API Config
export const getGoogleApiConfig = (): GoogleApiConfig => {
  return getItem<GoogleApiConfig>('google_api_config', {
    isEnabled: false,
    syncFrequency: 60,
    autoSyncEnabled: false,
  });
};

export const saveGoogleApiConfig = (config: GoogleApiConfig): void => {
  setItem('google_api_config', config);
};

// Theme
export const getTheme = (): 'light' | 'dark' => {
  return getItem<'light' | 'dark'>('theme', 'light');
};

export const setTheme = (theme: 'light' | 'dark'): void => {
  setItem('theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
};

// Backup & Export with size limit (Issue #11)
export const exportAllData = (): string => {
  const students = getStudents();
  const records = getFeeRecords();
  
  // Estimate size before processing
  const estimatedSize = (students.length * 500 + records.length * 300) / (1024 * 1024);
  
  if (estimatedSize > 50) {
    throw new Error(
      `Data too large (estimated ${estimatedSize.toFixed(1)}MB). ` +
      `Please use selective export or contact support.`
    );
  }
  
  const data = {
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    developer: 'MWA',
    schoolInfo: getSchoolInfo(),
    students,
    teachers: getTeachers(),
    feeRecords: records,
    salaryRecords: getSalaryPayments(),
    classes: getClasses(),
    feeHeads: getFeeHeads(),
    academicYears: getAcademicYears(),
    users: getUsers().map(u => ({ ...u, passwordHash: '***HIDDEN***' })),
  };
  
  const json = JSON.stringify(data, null, 2);
  return json;
};

export const importAllData = (jsonData: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonData);
    if (!data.version || !data.exportDate) {
      return { success: false, message: 'Invalid backup file format' };
    }
    if (data.schoolInfo) setItem('school_info', data.schoolInfo);
    if (data.students) setItem('students', data.students);
    if (data.teachers) setItem('teachers', data.teachers);
    if (data.feeRecords) setItem('fee_records', data.feeRecords);
    if (data.salaryRecords) setItem('salary_payments', data.salaryRecords);
    if (data.classes) setItem('classes', data.classes);
    if (data.feeHeads) setItem('fee_heads', data.feeHeads);
    if (data.academicYears) setItem('academic_years', data.academicYears);
    
    logAuditAction('IMPORT', 'System', 0, 'Full database restore from backup');
    return { success: true, message: 'Data imported successfully!' };
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, message: 'Failed to import data. Invalid file format.' };
  }
};

// Backup files management
export const getBackupFiles = (): Array<{
  id: string; name: string; createdAt: string; size: number; type: string;
}> => {
  return getItem('backup_files', []);
};

export const saveBackupFile = (backup: {
  id: string; name: string; createdAt: string; size: number; type: string;
}): void => {
  const backups = getBackupFiles();
  backups.push(backup);
  setItem('backup_files', backups);
};

export const deleteBackupFile = (backupId: string): void => {
  const backups = getBackupFiles().filter(b => b.id !== backupId);
  setItem('backup_files', backups);
};

// Initialize demo data
export const initializeDemoData = (): void => {
  // Keep empty as per original design
};

// Get all data for sync
export const getAllDataForSync = () => {
  return {
    schoolInfo: getSchoolInfo(),
    students: getStudents(),
    teachers: getTeachers(),
    feeRecords: getFeeRecords(),
    salaryRecords: getSalaryPayments(),
    classes: getClasses(),
    feeHeads: getFeeHeads(),
    academicYears: getAcademicYears(),
  };
};
