import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from '@/pages/Dashboard';
import { StudentsList } from '@/pages/students/StudentsList';
import { AddStudent } from '@/pages/students/AddStudent';
import { TeachersList } from '@/pages/teachers/TeachersList';
import { AddTeacher } from '@/pages/teachers/AddTeacher';
import { PaySalary } from '@/pages/teachers/PaySalary';
import { SalaryHistory } from '@/pages/teachers/SalaryHistory';
import { CollectFee } from '@/pages/fees/CollectFee';
import { PendingFees } from '@/pages/fees/PendingFees';
import { FeeHistory } from '@/pages/fees/FeeHistory';
import { InvoicesList } from '@/pages/invoices/InvoicesList';
import { DailyReport } from '@/pages/reports/DailyReport';
import { MonthlyReport } from '@/pages/reports/MonthlyReport';
import { ClassReport } from '@/pages/reports/ClassReport';
import { DefaultersReport } from '@/pages/reports/DefaultersReport';
import { SchoolSettings } from '@/pages/settings/SchoolSettings';
import { ClassesSettings } from '@/pages/settings/ClassesSettings';
import { FeeStructureSettings } from '@/pages/settings/FeeStructureSettings';
import { UsersSettings } from '@/pages/settings/UsersSettings';
import { GoogleApiSettings } from '@/pages/settings/GoogleApiSettings';
import { BackupSettings } from '@/pages/settings/BackupSettings';
import { AboutSettings } from '@/pages/settings/AboutSettings';
import { PromotionSettings } from '@/pages/settings/PromotionSettings';

interface MainLayoutProps {
  onLogout: () => void;
}

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  'dashboard': { title: 'Dashboard', subtitle: 'Overview of your school fee management' },
  'students-list': { title: 'All Students', subtitle: 'Manage student records' },
  'students-add': { title: 'Add New Student', subtitle: 'Register a new student' },
  'students-edit': { title: 'Edit Student', subtitle: 'Update student information' },
  'students-promotion': { title: 'Promote Students', subtitle: 'Academic year level promotion' },
  'teachers-list': { title: 'All Teachers', subtitle: 'Manage teaching staff' },
  'teachers-add': { title: 'Add New Teacher', subtitle: 'Add a new teacher' },
  'salary-pay': { title: 'Pay Salary', subtitle: 'Process salary payments' },
  'salary-history': { title: 'Salary History', subtitle: 'View all salary payments' },
  'fees-collect': { title: 'Collect Fee', subtitle: 'Process fee payments' },
  'fees-pending': { title: 'Pending Fees', subtitle: 'Students with outstanding fees' },
  'fees-history': { title: 'Fee History', subtitle: 'All fee transactions' },
  'invoices-list': { title: 'Invoices', subtitle: 'All generated invoices' },
  'reports-daily': { title: 'Daily Report', subtitle: 'Today\'s collection summary' },
  'reports-monthly': { title: 'Monthly Report', subtitle: 'Month-wise collection analysis' },
  'reports-class': { title: 'Class Report', subtitle: 'Class-wise fee status' },
  'reports-defaulters': { title: 'Defaulters Report', subtitle: 'Students with pending fees' },
  'settings-school': { title: 'School Information', subtitle: 'Manage school details' },
  'settings-classes': { title: 'Classes & Sections', subtitle: 'Manage class structure' },
  'settings-fees': { title: 'Fee Structure', subtitle: 'Configure fee heads and amounts' },
  'settings-users': { title: 'User Management', subtitle: 'Manage system users' },
  'settings-google': { title: 'Google API Configuration', subtitle: 'Configure cloud sync' },
  'settings-backup': { title: 'Backup & Restore', subtitle: 'Data backup management' },
  'settings-about': { title: 'About', subtitle: 'Software information and license' },
};

export function MainLayout({ onLogout }: MainLayoutProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Get page info, handling dynamic routes like students-edit-123
  const getPageInfo = () => {
    if (currentPage.startsWith('students-edit-')) {
      return pageTitles['students-edit'];
    }
    if (currentPage.startsWith('teachers-edit-')) {
      return { title: 'Edit Teacher', subtitle: 'Update teacher information' };
    }
    return pageTitles[currentPage] || { title: 'Dashboard' };
  };
  
  const pageInfo = getPageInfo();

  const renderPage = () => {
    // Handle dynamic routes for student edit
    if (currentPage.startsWith('students-edit-')) {
      const studentId = parseInt(currentPage.replace('students-edit-', ''));
      return <AddStudent onNavigate={handleNavigate} studentId={studentId} />;
    }
    
    // Handle dynamic routes for teacher edit
    if (currentPage.startsWith('teachers-edit-')) {
      const teacherId = parseInt(currentPage.replace('teachers-edit-', ''));
      return <AddTeacher onNavigate={handleNavigate} teacherId={teacherId} />;
    }
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'students-list':
        return <StudentsList onNavigate={handleNavigate} />;
      case 'students-add':
        return <AddStudent onNavigate={handleNavigate} />;
      case 'teachers-list':
        return <TeachersList onNavigate={handleNavigate} />;
      case 'teachers-add':
        return <AddTeacher onNavigate={handleNavigate} />;
      case 'salary-pay':
        return <PaySalary onNavigate={handleNavigate} />;
      case 'salary-history':
        return <SalaryHistory />;
      case 'fees-collect':
        return <CollectFee onNavigate={handleNavigate} />;
      case 'fees-pending':
        return <PendingFees onNavigate={handleNavigate} />;
      case 'fees-history':
        return <FeeHistory />;
      case 'invoices-list':
        return <InvoicesList />;
      case 'reports-daily':
        return <DailyReport />;
      case 'reports-monthly':
        return <MonthlyReport />;
      case 'reports-class':
        return <ClassReport />;
      case 'reports-defaulters':
        return <DefaultersReport onNavigate={handleNavigate} />;
      case 'settings-school':
        return <SchoolSettings />;
      case 'settings-classes':
        return <ClassesSettings />;
      case 'settings-fees':
        return <FeeStructureSettings />;
      case 'settings-users':
        return <UsersSettings />;
      case 'settings-google':
        return <GoogleApiSettings />;
      case 'settings-backup':
        return <BackupSettings />;
      case 'settings-about':
        return <AboutSettings />;
      case 'students-promotion':
        return <PromotionSettings />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        onLogout={onLogout}
      />
      <div className="ml-64">
        <Header 
          title={pageInfo.title} 
          subtitle={pageInfo.subtitle} 
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />
        <main className="min-h-[calc(100vh-4rem)]">
          {renderPage()}
        </main>
        {/* Footer with MWA branding */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>© 2026 School Fee Manager Pro. All rights reserved.</span>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded">v1.0.0</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Developed by</span>
              <span className="font-bold text-blue-600">MWA</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
