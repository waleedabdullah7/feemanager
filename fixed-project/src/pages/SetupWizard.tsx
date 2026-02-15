import { useState } from 'react';
import { 
  GraduationCap, Building2, Calendar, User, Settings, 
  Check, ArrowRight, ArrowLeft, Eye, EyeOff 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { 
  saveSchoolInfo, createAdminUser, saveAcademicYear, 
  initializeDefaultClasses, initializeDefaultFeeHeads, markSetupComplete 
} from '@/store';

interface SetupWizardProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, title: 'Welcome', icon: GraduationCap },
  { id: 2, title: 'School Info', icon: Building2 },
  { id: 3, title: 'Academic Year', icon: Calendar },
  { id: 4, title: 'Admin Account', icon: User },
  { id: 5, title: 'Configuration', icon: Settings },
];

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // School Info
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolCity, setSchoolCity] = useState('');
  const [schoolState, setSchoolState] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  
  // Academic Year
  const [yearName, setYearName] = useState('2024-2025');
  const [yearStart, setYearStart] = useState('2024-04-01');
  const [yearEnd, setYearEnd] = useState('2025-03-31');
  
  // Admin Account
  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 2:
        if (!schoolName.trim()) newErrors.schoolName = 'School name is required';
        break;
      case 3:
        if (!yearName.trim()) newErrors.yearName = 'Academic year name is required';
        if (!yearStart) newErrors.yearStart = 'Start date is required';
        if (!yearEnd) newErrors.yearEnd = 'End date is required';
        break;
      case 4:
        if (!adminName.trim()) newErrors.adminName = 'Full name is required';
        if (!adminUsername.trim()) newErrors.adminUsername = 'Username is required';
        if (!adminPassword) newErrors.adminPassword = 'Password is required';
        if (adminPassword.length < 8) newErrors.adminPassword = 'Password must be at least 8 characters';
        if (adminPassword !== adminConfirmPassword) newErrors.adminConfirmPassword = 'Passwords do not match';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    // Save school info
    saveSchoolInfo({
      schoolName,
      address: schoolAddress,
      city: schoolCity,
      state: schoolState,
      phonePrimary: schoolPhone,
      email: schoolEmail,
    });
    
    // Save academic year
    saveAcademicYear({
      id: 1,
      yearName,
      startDate: yearStart,
      endDate: yearEnd,
      isCurrent: true,
      isActive: true,
    });
    
    // Create admin user
    createAdminUser(adminUsername, adminPassword, adminName, adminEmail);
    
    // Initialize defaults
    initializeDefaultClasses();
    initializeDefaultFeeHeads();
    
    // Mark setup complete
    markSetupComplete();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    onComplete();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
            ${currentStep > step.id 
              ? 'bg-emerald-500 text-white' 
              : currentStep === step.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-500'
            }
          `}>
            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-1 ${currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to School Fee Manager Pro</h2>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Let's set up your school fee management system. This wizard will guide you through the initial configuration.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-800 mb-2">What you'll configure:</h3>
              <ul className="text-left text-blue-700 text-sm space-y-1">
                <li>✓ School information</li>
                <li>✓ Academic year settings</li>
                <li>✓ Administrator account</li>
                <li>✓ Initial configuration</li>
              </ul>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">School Information</h2>
              <p className="text-gray-600">Enter your school details</p>
            </div>
            <Input
              label="School Name *"
              placeholder="ABC Public School"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              error={errors.schoolName}
            />
            <Input
              label="Address"
              placeholder="123 Main Street"
              value={schoolAddress}
              onChange={(e) => setSchoolAddress(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="City"
                value={schoolCity}
                onChange={(e) => setSchoolCity(e.target.value)}
              />
              <Input
                label="State"
                placeholder="State"
                value={schoolState}
                onChange={(e) => setSchoolState(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                placeholder="+91 9876543210"
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="school@example.com"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
              />
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Academic Year</h2>
              <p className="text-gray-600">Configure the current academic year</p>
            </div>
            <Input
              label="Academic Year Name *"
              placeholder="2024-2025"
              value={yearName}
              onChange={(e) => setYearName(e.target.value)}
              error={errors.yearName}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                type="date"
                value={yearStart}
                onChange={(e) => setYearStart(e.target.value)}
                error={errors.yearStart}
              />
              <Input
                label="End Date *"
                type="date"
                value={yearEnd}
                onChange={(e) => setYearEnd(e.target.value)}
                error={errors.yearEnd}
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> This academic year will be set as the current active year. 
                You can add more academic years later from settings.
              </p>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create Admin Account</h2>
              <p className="text-gray-600">Set up your administrator credentials</p>
            </div>
            <Input
              label="Full Name *"
              placeholder="John Smith"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              error={errors.adminName}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Username *"
                placeholder="admin"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                error={errors.adminUsername}
              />
              <Input
                label="Email"
                type="email"
                placeholder="admin@school.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Input
                label="Password *"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 characters"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                error={errors.adminPassword}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
            </div>
            <Input
              label="Confirm Password *"
              type="password"
              placeholder="Confirm your password"
              value={adminConfirmPassword}
              onChange={(e) => setAdminConfirmPassword(e.target.value)}
              error={errors.adminConfirmPassword}
            />
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Review & Complete</h2>
              <p className="text-gray-600">Review your settings before finishing</p>
            </div>
            
            <Card className="bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">School Information</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p><span className="font-medium">Name:</span> {schoolName}</p>
                <p><span className="font-medium">Location:</span> {schoolCity}, {schoolState}</p>
                <p><span className="font-medium">Contact:</span> {schoolPhone || 'Not provided'}</p>
              </div>
            </Card>
            
            <Card className="bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Academic Year</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p><span className="font-medium">Year:</span> {yearName}</p>
                <p><span className="font-medium">Duration:</span> {yearStart} to {yearEnd}</p>
              </div>
            </Card>
            
            <Card className="bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-3">Administrator</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p><span className="font-medium">Name:</span> {adminName}</p>
                <p><span className="font-medium">Username:</span> {adminUsername}</p>
                <p><span className="font-medium">Email:</span> {adminEmail || 'Not provided'}</p>
              </div>
            </Card>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-700">
                <strong>Ready to go!</strong> Click "Complete Setup" to finish the configuration 
                and start using School Fee Manager Pro.
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl" padding="lg">
        {renderStepIndicator()}
        
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          {currentStep > 1 ? (
            <Button variant="ghost" onClick={handleBack} icon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleComplete} loading={loading} variant="success">
              Complete Setup
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
