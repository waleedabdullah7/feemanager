import { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getFeeHeads, saveFeeHead } from '@/store';
import type { FeeHead } from '@/types';

export function FeeStructureSettings() {
  const { showToast } = useToast();
  const [editModal, setEditModal] = useState<FeeHead | null>(null);
  const [addModal, setAddModal] = useState(false);

  const [headName, setHeadName] = useState('');
  const [headCode, setHeadCode] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annually' | 'one-time'>('monthly');
  const [isMandatory, setIsMandatory] = useState(true);

  const feeHeads = getFeeHeads();

  const handleAdd = () => {
    if (!headName.trim()) {
      showToast('error', 'Fee head name is required');
      return;
    }

    const newHead: FeeHead = {
      id: feeHeads.length + 1,
      headName: headName.trim(),
      headCode: headCode.trim() || headName.slice(0, 3).toUpperCase(),
      description: description.trim(),
      isRecurring: frequency !== 'one-time',
      frequency,
      isMandatory,
      displayOrder: feeHeads.length + 1,
      isActive: true,
    };

    saveFeeHead(newHead);
    showToast('success', 'Fee head added successfully!');
    setAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editModal || !headName.trim()) return;

    const updatedHead: FeeHead = {
      ...editModal,
      headName: headName.trim(),
      headCode: headCode.trim(),
      description: description.trim(),
      frequency,
      isRecurring: frequency !== 'one-time',
      isMandatory,
    };

    saveFeeHead(updatedHead);
    showToast('success', 'Fee head updated successfully!');
    setEditModal(null);
    resetForm();
  };

  const openEditModal = (head: FeeHead) => {
    setHeadName(head.headName);
    setHeadCode(head.headCode);
    setDescription(head.description || '');
    setFrequency(head.frequency);
    setIsMandatory(head.isMandatory);
    setEditModal(head);
  };

  const resetForm = () => {
    setHeadName('');
    setHeadCode('');
    setDescription('');
    setFrequency('monthly');
    setIsMandatory(true);
  };

  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case 'monthly':
        return <Badge variant="info">Monthly</Badge>;
      case 'quarterly':
        return <Badge variant="warning">Quarterly</Badge>;
      case 'annually':
        return <Badge variant="success">Annually</Badge>;
      case 'one-time':
        return <Badge variant="default">One-time</Badge>;
      default:
        return <Badge>{freq}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fee Structure</h2>
          <p className="text-sm text-gray-500">{feeHeads.length} fee heads configured</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
          Add Fee Head
        </Button>
      </div>

      {/* Fee Heads Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Fee Head</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Code</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Frequency</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Mandatory</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feeHeads.map((head) => (
                <tr key={head.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="font-medium text-gray-900">{head.headName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{head.headCode}</code>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{head.description || '-'}</td>
                  <td className="py-3 px-4">{getFrequencyBadge(head.frequency)}</td>
                  <td className="py-3 px-4">
                    {head.isMandatory ? (
                      <Badge variant="danger">Required</Badge>
                    ) : (
                      <Badge variant="default">Optional</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={head.isActive ? 'success' : 'default'}>
                      {head.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(head)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => { setAddModal(false); resetForm(); }}
        title="Add Fee Head"
      >
        <div className="space-y-4">
          <Input
            label="Fee Head Name *"
            placeholder="e.g., Tuition Fee"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
          />
          <Input
            label="Code"
            placeholder="e.g., TUT"
            value={headCode}
            onChange={(e) => setHeadCode(e.target.value.toUpperCase())}
          />
          <Textarea
            label="Description"
            placeholder="Brief description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'annually', label: 'Annually' },
              { value: 'one-time', label: 'One-time' },
            ]}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mandatory"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="mandatory" className="text-sm text-gray-700">This fee is mandatory</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleAdd}>
              Add Fee Head
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
        title="Edit Fee Head"
      >
        <div className="space-y-4">
          <Input
            label="Fee Head Name *"
            value={headName}
            onChange={(e) => setHeadName(e.target.value)}
          />
          <Input
            label="Code"
            value={headCode}
            onChange={(e) => setHeadCode(e.target.value.toUpperCase())}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'annually', label: 'Annually' },
              { value: 'one-time', label: 'One-time' },
            ]}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="mandatoryEdit"
              checked={isMandatory}
              onChange={(e) => setIsMandatory(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="mandatoryEdit" className="text-sm text-gray-700">This fee is mandatory</label>
          </div>
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
    </div>
  );
}
