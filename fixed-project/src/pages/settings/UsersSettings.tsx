import { useState } from 'react';
import { Plus, Edit2, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { getUsers, saveUser, deleteUser, hashPassword, getCurrentUser } from '@/store';
import type { User as UserType } from '@/types';

export function UsersSettings() {
  const { showToast } = useToast();
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState<UserType | null>(null);
  const [deleteModal, setDeleteModal] = useState<UserType | null>(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'accountant' | 'staff' | 'viewer'>('staff');
  const [password, setPassword] = useState('');

  const users = getUsers();
  const currentUser = getCurrentUser();

  const handleAdd = () => {
    if (!fullName.trim() || !username.trim() || !password) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }

    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      showToast('error', 'Username already exists');
      return;
    }

    const newUser: UserType = {
      id: users.length + 1,
      userId: `USR-${String(users.length + 1).padStart(3, '0')}`,
      username: username.trim(),
      passwordHash: hashPassword(password),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    saveUser(newUser);
    showToast('success', 'User added successfully!');
    setAddModal(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editModal || !fullName.trim()) return;

    const updatedUser: UserType = {
      ...editModal,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      passwordHash: password ? hashPassword(password) : editModal.passwordHash,
    };

    saveUser(updatedUser);
    showToast('success', 'User updated successfully!');
    setEditModal(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteModal) return;
    
    if (deleteModal.id === currentUser?.id) {
      showToast('error', 'You cannot delete your own account');
      setDeleteModal(null);
      return;
    }

    deleteUser(deleteModal.id);
    showToast('success', 'User deleted successfully!');
    setDeleteModal(null);
  };

  const toggleUserStatus = (user: UserType) => {
    if (user.id === currentUser?.id) {
      showToast('error', 'You cannot deactivate your own account');
      return;
    }
    saveUser({ ...user, isActive: !user.isActive });
    showToast('success', `User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
  };

  const openEditModal = (user: UserType) => {
    setFullName(user.fullName);
    setUsername(user.username);
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setRole(user.role);
    setPassword('');
    setEditModal(user);
  };

  const resetForm = () => {
    setFullName('');
    setUsername('');
    setEmail('');
    setPhone('');
    setRole('staff');
    setPassword('');
  };

  const getRoleBadge = (userRole: string) => {
    switch (userRole) {
      case 'admin':
        return <Badge variant="danger">Admin</Badge>;
      case 'accountant':
        return <Badge variant="info">Accountant</Badge>;
      case 'staff':
        return <Badge variant="success">Staff</Badge>;
      case 'viewer':
        return <Badge variant="default">Viewer</Badge>;
      default:
        return <Badge>{userRole}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">{users.length} users configured</p>
        </div>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setAddModal(true)}>
          Add User
        </Button>
      </div>

      {/* Role Legend */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Role Permissions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Admin</p>
              <p className="text-gray-500">Full access</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Accountant</p>
              <p className="text-gray-500">Fee & reports</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Staff</p>
              <p className="text-gray-500">Limited access</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Viewer</p>
              <p className="text-gray-500">Read only</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Username</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-xs text-gray-500">{user.userId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">{user.username}</code>
                  </td>
                  <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{user.email || '-'}</p>
                    <p className="text-xs text-gray-500">{user.phone || ''}</p>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      disabled={user.id === currentUser?.id}
                      className="flex items-center gap-1.5"
                    >
                      {user.isActive ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                      <span className={`text-sm ${user.isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal(user)}
                        disabled={user.id === currentUser?.id}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
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
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="Enter full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Username *"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'accountant', label: 'Accountant' },
              { value: 'staff', label: 'Staff' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />
          <Input
            label="Password *"
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleAdd}>
              Add User
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
        title="Edit User"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'accountant', label: 'Accountant' },
              { value: 'staff', label: 'Staff' },
              { value: 'viewer', label: 'Viewer' },
            ]}
          />
          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{deleteModal?.fullName}</strong>?
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
