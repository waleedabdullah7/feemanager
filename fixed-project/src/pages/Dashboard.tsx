import { 
  Users, Wallet, Clock, Calendar, TrendingUp, 
  ArrowUpRight, AlertTriangle, UserPlus, CreditCard, BookOpen
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStudents, getFeeRecords, getClasses, getTeachers } from '@/store';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const students = getStudents();
  const feeRecords = getFeeRecords();
  const classes = getClasses();
  const teachers = getTeachers();

  // Calculate real stats - NO sample data
  const totalStudents = students.filter(s => s.status === 'active').length;
  const totalCollected = feeRecords.reduce((sum, r) => sum + r.amountPaid, 0);
  const pendingAmount = feeRecords.filter(r => r.status !== 'paid').reduce((sum, r) => sum + r.balanceDue, 0);
  
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = feeRecords.filter(r => r.paymentDate === today);
  const todayCollection = todayRecords.reduce((sum, r) => sum + r.amountPaid, 0);

  // Calculate real monthly data from actual records
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyTotals: Record<number, number> = {};
    
    feeRecords.forEach(record => {
      const date = new Date(record.paymentDate);
      if (date.getFullYear() === currentYear) {
        const month = date.getMonth();
        monthlyTotals[month] = (monthlyTotals[month] || 0) + record.amountPaid;
      }
    });

    return months.slice(0, new Date().getMonth() + 1).map((month, index) => ({
      month,
      amount: monthlyTotals[index] || 0
    }));
  };

  // Calculate real payment mode distribution
  const getPaymentModeData = () => {
    const modeCount: Record<string, number> = {};
    feeRecords.forEach(record => {
      const mode = record.paymentMode || 'cash';
      modeCount[mode] = (modeCount[mode] || 0) + record.amountPaid;
    });

    const total = Object.values(modeCount).reduce((sum, v) => sum + v, 0);
    if (total === 0) return [];

    const colors: Record<string, string> = {
      cash: '#10B981',
      upi: '#3B82F6',
      card: '#8B5CF6',
      bank_transfer: '#F59E0B',
      cheque: '#EF4444',
      online: '#06B6D4'
    };

    return Object.entries(modeCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
      value: Math.round((value / total) * 100),
      color: colors[name] || '#6B7280'
    }));
  };

  const monthlyData = getMonthlyData();
  const paymentModeData = getPaymentModeData();

  // Get real recent transactions
  const recentTransactions = feeRecords.slice(-5).reverse();

  // Get real top defaulters
  const getDefaulters = () => {
    const studentDues = new Map<number, number>();
    
    feeRecords.forEach(record => {
      if (record.balanceDue > 0) {
        const current = studentDues.get(record.studentId) || 0;
        studentDues.set(record.studentId, current + record.balanceDue);
      }
    });

    return Array.from(studentDues.entries())
      .map(([studentId, amount]) => {
        const student = students.find(s => s.id === studentId);
        return student ? { student, amount } : null;
      })
      .filter(Boolean)
      .sort((a, b) => (b?.amount || 0) - (a?.amount || 0))
      .slice(0, 5) as { student: typeof students[0]; amount: number }[];
  };

  const topDefaulters = getDefaulters();

  // Get class-wise collection data
  const getClassWiseData = () => {
    return classes.slice(0, 5).map(c => {
      const classStudents = students.filter(s => s.classId === c.id && s.status === 'active');
      const totalExpected = classStudents.reduce((sum, s) => sum + s.monthlyFee, 0);
      
      const classRecords = feeRecords.filter(r => {
        const student = students.find(s => s.id === r.studentId);
        return student?.classId === c.id;
      });
      const collected = classRecords.reduce((sum, r) => sum + r.amountPaid, 0);

      return {
        className: c.className,
        collected,
        total: totalExpected,
        percentage: totalExpected > 0 ? Math.round((collected / totalExpected) * 100) : 0
      };
    }).filter(c => c.total > 0);
  };

  const classWiseData = getClassWiseData();

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `Rs. ${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `Rs. ${(amount / 1000).toFixed(1)}K`;
    }
    return `Rs. ${amount.toLocaleString()}`;
  };

  const hasData = students.length > 0 || feeRecords.length > 0 || teachers.length > 0;

  // Empty state when no data
  if (!hasData) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to School Fee Manager Pro</h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            Your school fee management system is ready. Start by adding students and teachers to see your dashboard come to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => onNavigate('students-add')} size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              Add First Student
            </Button>
            <Button variant="secondary" onClick={() => onNavigate('teachers-add')} size="lg">
              <Users className="w-5 h-5 mr-2" />
              Add First Teacher
            </Button>
          </div>
        </div>

        {/* Quick Setup Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('settings-school')}>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Setup School Info</h3>
            <p className="text-sm text-gray-600">Configure your school details and branding</p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('settings-fees')}>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Configure Fee Structure</h3>
            <p className="text-sm text-gray-600">Set up fee heads and class-wise amounts</p>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('settings-google')}>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Setup Cloud Backup</h3>
            <p className="text-sm text-gray-600">Connect Google Sheets for automatic backup</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          subtitle={`${students.filter(s => s.status === 'active').length} active`}
          icon={<Users className="w-6 h-6 text-blue-600" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          subtitle="This Academic Year"
          icon={<Wallet className="w-6 h-6 text-emerald-600" />}
          iconBg="bg-emerald-100"
        />
        <StatCard
          title="Pending Fees"
          value={formatCurrency(pendingAmount)}
          subtitle={`${topDefaulters.length} students`}
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Today's Collection"
          value={formatCurrency(todayCollection)}
          subtitle={`${todayRecords.length} receipts`}
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          iconBg="bg-purple-100"
        />
      </div>

      {/* Charts Row */}
      {(monthlyData.some(m => m.amount > 0) || paymentModeData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collection Trend */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Collection Trend
              </h2>
            </div>
            {monthlyData.some(m => m.amount > 0) ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" tickFormatter={(v) => `Rs.${v/1000}K`} />
                    <Tooltip 
                      formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                    />
                    <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No collection data yet. Start collecting fees to see trends.</p>
              </div>
            )}
          </Card>

          {/* Payment Modes */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Modes</h2>
            {paymentModeData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentModeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {paymentModeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {paymentModeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-500 text-center">
                <p>No payment data yet</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recent Transactions
            </h2>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((record, index) => {
                const student = students.find(s => s.id === record.studentId);
                const timeAgo = getTimeAgo(record.createdAt);
                return (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-semibold">
                        {student?.firstName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student?.firstName || 'Unknown'} {student?.lastName || ''}
                        </p>
                        <p className="text-xs text-gray-500">{record.receiptNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-600">Rs. {record.amountPaid.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{timeAgo}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
              </div>
            )}
          </div>
          {recentTransactions.length > 0 && (
            <Button 
              variant="ghost" 
              className="w-full mt-4" 
              onClick={() => onNavigate('fees-history')}
            >
              View All Transactions
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </Card>

        {/* Top Defaulters */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Top Defaulters
            </h2>
          </div>
          <div className="space-y-3">
            {topDefaulters.length > 0 ? (
              topDefaulters.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.student.firstName} {item.student.lastName}
                    </span>
                  </div>
                  <Badge variant="danger">Rs. {item.amount.toLocaleString()}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No defaulters</p>
              </div>
            )}
          </div>
          {topDefaulters.length > 0 && (
            <Button 
              variant="ghost" 
              className="w-full mt-4"
              onClick={() => onNavigate('reports-defaulters')}
            >
              View Full List
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </Card>
      </div>

      {/* Class-wise Collection */}
      {classWiseData.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Collection (This Month)</h2>
          <div className="space-y-4">
            {classWiseData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.className}</span>
                  <span className="text-gray-600">
                    Rs. {(item.collected / 1000).toFixed(0)}K / Rs. {(item.total / 1000).toFixed(0)}K
                    <span className="ml-2 font-semibold text-gray-900">{item.percentage}%</span>
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.percentage >= 80 ? 'bg-emerald-500' : 
                      item.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Helper function to get time ago string
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
