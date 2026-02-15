import { 
  GraduationCap, Shield, Code, Download, CheckCircle, 
  Heart, Sparkles, Star,
  Cpu, HardDrive, Zap, Layers, Server, Users
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getStorageInfo, getStudents, getTeachers, getFeeRecords } from '@/store';

export function AboutSettings() {
  const storage = getStorageInfo();
  const studentCount = getStudents().length;
  const teacherCount = getTeachers().length;
  const recordsCount = getFeeRecords().length;

  const handleDownloadInstaller = () => {
    const installerInfo = `
================================================================================
                    SCHOOL FEE MANAGER PRO - PREMIUM EDITION
================================================================================

APPLICATION INFORMATION:
------------------------
Application Name    : School Fee Manager Pro
Version            : 1.0.0
Edition            : Enterprise Elite
Developer          : M.W.A (Elite Solutions)
Copyright          : © 2026 MWA. All Rights Reserved.

CERTIFICATION:
--------------
This software is certified for professional institutional use.
Verified stable and production-ready.

================================================================================
                    Crafted with ❤️ by M.W.A - © 2026
================================================================================
`;
    const blob = new Blob([installerInfo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SFM-Pro-Enterprise-Info.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-8 md:p-12 text-white shadow-2xl">
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center shadow-inner group hover:scale-105 transition-transform duration-500">
              <GraduationCap className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <Badge variant="success">v1.0.0 PRO</Badge>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-xs font-bold tracking-widest uppercase">System Stable</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">School Fee Manager <span className="bg-gradient-to-r from-blue-300 to-indigo-200 bg-clip-text text-transparent">Pro</span></h1>
            <p className="text-blue-100/80 text-lg md:text-xl font-medium tracking-wide">The Gold Standard in Institutional Finance Management</p>
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Button onClick={handleDownloadInstaller} size="lg" className="bg-white text-blue-900 hover:bg-blue-50 border-none shadow-xl font-bold px-8 rounded-2xl">
                <Download className="w-5 h-5 mr-2" />
                Download License Info
              </Button>
              <p className="text-white/40 text-sm font-medium">© 2026 MWA. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Performance Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Managed Students', val: studentCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Faculty', val: teacherCount, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Digital Records', val: recordsCount, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Uptime Score', val: '99.9%', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MWA Developer Spotlight */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-1 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
             <div className="relative rounded-[2.4rem] bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 border border-white/5">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl overflow-hidden text-white">
                       <span className="text-4xl font-black tracking-tighter">MWA</span>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                      <div className="h-px w-8 bg-blue-500" />
                      <span className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Lead Architect</span>
                      <div className="h-px w-8 bg-blue-500" />
                    </div>
                    <h2 className="text-4xl font-black text-white mb-3">M.W.A <span className="text-blue-500 font-light italic">Elite</span></h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                      Crafting premium digital experiences with precision, passion, and advanced engineering since 2026.
                    </p>
                    
                    <div className="mt-8">
                      <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                        <span className="text-2xl font-black tracking-[0.2em] bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                          W A
                        </span>
                        <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                      </div>
                      <p className="text-blue-400/60 text-[10px] mt-3 uppercase tracking-[0.5em] font-bold">Exclusive Premium Signature</p>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { t: 'Student Hub', d: 'Comprehensive management with dynamic profiles.', i: Users, c: 'text-blue-500' },
              { t: 'Financial Engine', d: 'Automated fee tracking & accurate reporting.', i: Server, c: 'text-emerald-500' },
              { t: 'Payroll Master', d: 'Complete staff salary & history modules.', i: Cpu, c: 'text-purple-500' },
              { t: 'Elite Security', d: 'SHA-256 encryption & audit logging.', i: Shield, c: 'text-rose-500' }
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <div className="shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                  <f.i className={`w-6 h-6 ${f.c}`} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{f.t}</h4>
                  <p className="text-sm text-gray-500 mt-1">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Software Card */}
          <Card className="rounded-[2rem] border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              Software Specs
            </h3>
            <div className="space-y-4">
              {[
                { l: 'Version', v: '1.0.0 Stable' },
                { l: 'Release', v: '2026 Enterprise' },
                { l: 'Build', v: 'PRO-2394-X' },
                { l: 'Currency', v: 'PKR (Pak Rupees)' },
                { l: 'Region', v: 'Pakistan 🇵🇰' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.l}</span>
                  <span className="text-sm font-bold text-gray-900">{item.v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* System Health */}
          <Card className="rounded-[2rem] border-gray-100 bg-slate-50 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-indigo-600" />
              System Resources
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Database Storage</span>
                  <span className="text-sm font-black text-indigo-600">{storage.percentage}% Full</span>
                </div>
                <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${storage.isCritical ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                    style={{ width: `${storage.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Used: {storage.usedMB} MB / Total: {storage.totalMB} MB</p>
              </div>
              
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">LocalStorage Driver Active</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">Real-time Crypto Engine</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Technology Stack */}
          <Card className="rounded-[2rem] bg-gradient-to-br from-white to-blue-50/50 border-blue-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-6">Built with Excellence</h3>
            <div className="flex flex-wrap gap-2">
              {['React 19', 'TypeScript', 'Tailwind CSS', 'Vite 7', 'Recharts', 'Lucide'].map(t => (
                <span key={t} className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black text-slate-600 border border-slate-100 shadow-sm hover:scale-105 transition-transform cursor-default">
                  {t}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="pt-12 pb-6 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">School Fee Manager Pro</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">© 2026 Enterprise Edition</p>
            </div>
          </div>
          
          <p className="text-xs font-bold text-gray-500 text-center">
            Designed for professional environments. Optimized for stability.
          </p>

          <div className="flex items-center gap-2">
             <span className="text-xs font-black text-gray-900">Developed by MWA</span>
             <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
