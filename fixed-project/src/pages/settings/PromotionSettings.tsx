import { useState, useMemo } from 'react';
import { 
  GraduationCap, Users, CheckCircle, ChevronDown, 
  ChevronRight, AlertCircle, Save, ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getStudents, getClasses, promoteStudents } from '@/store';
import type { Student, ClassInfo } from '@/types';

interface PromotionAction {
  studentId: number;
  action: 'promote' | 'same' | 'passed_out';
}

export function PromotionSettings() {
  const { showToast } = useToast();
  const students = getStudents().filter(s => s.status === 'active');
  const classes = getClasses();
  
  const [expandedClasses, setExpandedClasses] = useState<number[]>(classes.map(c => c.id));
  const [selectedStudents, setSelectedStudents] = useState<number[]>(students.map(s => s.id));
  const [promotionActions, setPromotionActions] = useState<Record<number, 'promote' | 'same' | 'passed_out'>>(() => {
    const initial: Record<number, 'promote' | 'same' | 'passed_out'> = {};
    students.forEach(s => {
      initial[s.id] = s.classId === 12 ? 'passed_out' : 'promote';
    });
    return initial;
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Group students by class
  const classGroups = useMemo(() => {
    const groups: Record<number, Student[]> = {};
    classes.forEach(c => {
      groups[c.id] = students.filter(s => s.classId === c.id);
    });
    return groups;
  }, [students, classes]);

  const toggleClass = (classId: number) => {
    setExpandedClasses(prev => 
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleClassSelection = (classId: number, select: boolean) => {
    const classStudentIds = classGroups[classId].map(s => s.id);
    if (select) {
      setSelectedStudents(prev => Array.from(new Set([...prev, ...classStudentIds])));
    } else {
      setSelectedStudents(prev => prev.filter(id => !classStudentIds.includes(id)));
    }
  };

  const handleActionChange = (studentId: number, action: 'promote' | 'same' | 'passed_out') => {
    setPromotionActions(prev => ({ ...prev, [studentId]: action }));
  };

  const promotionSummary = useMemo(() => {
    const summary = { promoted: 0, same: 0, passedOut: 0, total: selectedStudents.length };
    selectedStudents.forEach(id => {
      const action = promotionActions[id];
      if (action === 'promote') summary.promoted++;
      else if (action === 'same') summary.same++;
      else if (action === 'passed_out') summary.passedOut++;
    });
    return summary;
  }, [selectedStudents, promotionActions]);

  const handlePromote = async () => {
    setProcessing(true);
    try {
      const data: PromotionAction[] = selectedStudents.map(id => ({
        studentId: id,
        action: promotionActions[id]
      }));
      
      const result = promoteStudents(data);
      showToast('success', `Successfully processed ${result.total} students!`);
      setShowConfirmModal(false);
      // Reset state or could refresh data
    } catch (error) {
      showToast('error', 'Failed to process promotions');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Promotion Management</h1>
          <p className="text-gray-600">Promote active students to the next academic level</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedStudents([])}
          >
            Deselect All
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setSelectedStudents(students.map(s => s.id))}
          >
            Select All
          </Button>
          <Button 
            onClick={() => setShowConfirmModal(true)}
            disabled={selectedStudents.length === 0}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Promote Selected ({selectedStudents.length})
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {classes.filter(c => classGroups[c.id]?.length > 0).map(cls => (
          <Card key={cls.id} padding="none" className="overflow-hidden border-l-4 border-l-blue-600">
            <div 
              className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleClass(cls.id)}
            >
              <div className="flex items-center gap-3">
                {expandedClasses.includes(cls.id) ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900">{cls.className}</h3>
                  <Badge variant="info">{classGroups[cls.id].length} Students</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 text-xs"
                    onClick={() => classGroups[cls.id].forEach(s => handleActionChange(s.id, cls.id === 12 ? 'passed_out' : 'promote'))}
                  >
                    All Promote
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 text-xs text-amber-600 hover:bg-amber-50"
                    onClick={() => classGroups[cls.id].forEach(s => handleActionChange(s.id, 'same'))}
                  >
                    All Detain
                  </Button>
                </div>
                <div className="flex items-center gap-2 border-l pl-4">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    checked={classGroups[cls.id].every(s => selectedStudents.includes(s.id))}
                    onChange={(e) => toggleClassSelection(cls.id, e.target.checked)}
                  />
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Select Class</span>
                </div>
              </div>
            </div>

            {expandedClasses.includes(cls.id) && (
              <div className="p-0 border-t border-gray-100 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-100">
                    <tr className="text-xs text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-3 font-semibold">Select</th>
                      <th className="px-6 py-3 font-semibold">Student Name</th>
                      <th className="px-6 py-3 font-semibold">ID / Admission #</th>
                      <th className="px-6 py-3 font-semibold">Current Class</th>
                      <th className="px-6 py-3 font-semibold">Promotion Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {classGroups[cls.id].map(student => (
                      <tr key={student.id} className={`hover:bg-blue-50/30 transition-colors ${selectedStudents.includes(student.id) ? 'bg-blue-50/10' : 'opacity-60'}`}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                              {student.firstName[0]}
                            </div>
                            <span className="font-medium text-gray-900">{student.firstName} {student.lastName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono text-gray-500">{student.studentId} / {student.admissionNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">{cls.className}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleActionChange(student.id, cls.id === 12 ? 'passed_out' : 'promote')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                promotionActions[student.id] === (cls.id === 12 ? 'passed_out' : 'promote')
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                  : 'bg-white text-gray-400 border border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              {cls.id === 12 ? 'Mark Passed Out' : 'Promote Next'}
                            </button>
                            <button
                              onClick={() => handleActionChange(student.id, 'same')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                promotionActions[student.id] === 'same'
                                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                                  : 'bg-white text-gray-400 border border-gray-200 hover:border-amber-300'
                              }`}
                            >
                              Keep Same Class
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>

      {students.length === 0 && (
        <Card className="text-center py-20">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Students Found</h3>
          <p className="text-gray-500">Only students with 'active' status can be promoted.</p>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Student Promotion"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 text-blue-800">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              This action will update the academic level of the selected students. 
              <strong> Fee structures might need adjustment</strong> for the new classes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Total Selected</p>
              <p className="text-3xl font-black text-gray-900">{promotionSummary.total}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl">
              <p className="text-xs text-emerald-600 uppercase tracking-widest font-bold mb-1">Will Promote</p>
              <p className="text-3xl font-black text-emerald-700">{promotionSummary.promoted}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-600 uppercase tracking-widest font-bold mb-1">Stay Same Class</p>
              <p className="text-3xl font-black text-amber-700">{promotionSummary.same}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-xs text-purple-600 uppercase tracking-widest font-bold mb-1">Pass Out</p>
              <p className="text-3xl font-black text-purple-700">{promotionSummary.passedOut}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1" 
              onClick={handlePromote}
              loading={processing}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm Promotion
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
              disabled={processing}
            >
              Go Back
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
