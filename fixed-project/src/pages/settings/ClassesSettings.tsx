import { useState } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getClasses, saveClass, deleteClass, getStudents } from '@/store';
import type { ClassInfo } from '@/types';

export function ClassesSettings() {
  const { showToast } = useToast();
  const [editModal, setEditModal] = useState<ClassInfo | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<ClassInfo | null>(null);
  
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [sectionName, setSectionName] = useState('A');
  const [capacity, setCapacity] = useState('40');

  const classes = getClasses();
  const students = getStudents();

  const getStudentCount = (classId: number) => {
    return students.filter(s => s.classId === classId && s.status === 'active').length;
  };

  const handleAdd = () => {
    if (!className.trim()) {
      showToast('error', 'Class name is required');
      return;
    }

    const newClass: ClassInfo = {
      id: classes.length + 1,
      className: className.trim(),
      classCode: classCode.trim() || `CLS-${classes.length + 1}`,
      displayOrder: classes.length + 1,
      isActive: true,
      sections: [{
        id: 1,
        classId: classes.length + 1,
        sectionName: sectionName.trim() || 'A',
        capacity: parseInt(capacity) || 40,
        isActive: true,
      }],
    };

    saveClass(newClass);
    showToast('success', 'Class added successfully!');
    setAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editModal || !className.trim()) return;

    const updatedClass: ClassInfo = {
      ...editModal,
      className: className.trim(),
      classCode: classCode.trim(),
    };

    saveClass(updatedClass);
    showToast('success', 'Class updated successfully!');
    setEditModal(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    
    const studentCount = getStudentCount(deleteModal.id);
    if (studentCount > 0) {
      showToast('error', `Cannot delete class with ${studentCount} active students`);
      setDeleteModal(null);
      return;
    }

    deleteClass(deleteModal.id);
    showToast('success', 'Class deleted successfully!');
    setDeleteModal(null);
  };

  const openEditModal = (cls: ClassInfo) => {
    setClassName(cls.className);
    setClassCode(cls.classCode);
    setEditModal(cls);
  };

  const resetForm = () => {
    setClassName('');
    setClassCode('');
    setSectionName('A');
    setCapacity('40');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Classes & Sections</h2>
          <p className="text-sm text-gray-500">{classes.length} classes configured</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
          Add Class
        </Button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{cls.className}</h3>
                  <p className="text-xs text-gray-500">{cls.classCode}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Sections</span>
                <span className="font-medium">{cls.sections.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Students</span>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{getStudentCount(cls.id)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Button 
                size="sm" 
                variant="ghost" 
                className="flex-1"
                icon={<Edit2 className="w-4 h-4" />}
                onClick={() => openEditModal(cls)}
              >
                Edit
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-red-600 hover:bg-red-50"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setDeleteModal(cls)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <Card className="text-center py-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No classes configured yet</p>
          <Button className="mt-4" onClick={() => setAddModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add First Class
          </Button>
        </Card>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => { setAddModal(false); resetForm(); }}
        title="Add New Class"
      >
        <div className="space-y-4">
          <Input
            label="Class Name *"
            placeholder="e.g., Class 1, Grade 10"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <Input
            label="Class Code"
            placeholder="e.g., CLS-01"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Default Section"
              placeholder="A"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            />
            <Input
              label="Capacity"
              type="number"
              placeholder="40"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleAdd}>
              Add Class
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => { setAddModal(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => { setEditModal(null); resetForm(); }}
        title="Edit Class"
      >
        <div className="space-y-4">
          <Input
            label="Class Name *"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <Input
            label="Class Code"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleEdit}>
              Save Changes
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => { setEditModal(null); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Class"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteModal?.className}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
