// Users page - Professional version with full CRUD (admin only)
import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/client';
import { DataTable, BadgeCell, DateCell } from '../components/DataTable';
import { ViewModal, FormModal, DeleteModal } from '../components/Modal';
import { Plus, Trash2, Eye, Edit2, RefreshCw, Filter } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'ppic', label: 'PPIC' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'qc', label: 'QC' },
  { value: 'viewer', label: 'Viewer' },
];

function Users() {
  const toast = window.__TOAST__;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modal states
  const [viewModal, setViewModal] = useState({ open: false, data: null });
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.error?.message || 'Failed to load users');
      toast?.error?.('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Filtered data
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (searchTerm && !u.username?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !u.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filterRole && u.role !== filterRole) return false;
      return true;
    });
  }, [users, searchTerm, filterRole]);

  // Stats
  const stats = useMemo(() => ({
    total: filteredUsers.length,
    admin: filteredUsers.filter(u => u.role === 'admin').length,
    ppic: filteredUsers.filter(u => u.role === 'ppic').length,
    warehouse: filteredUsers.filter(u => u.role === 'warehouse').length,
    qc: filteredUsers.filter(u => u.role === 'qc').length,
    viewer: filteredUsers.filter(u => u.role === 'viewer').length,
  }), [filteredUsers]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('');
  };

  const hasActiveFilters = searchTerm || filterRole;

  // Selection handlers
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // CRUD handlers
  const handleView = (user) => setViewModal({ open: true, data: user });
  const handleCreate = () => setFormModal({ open: true, data: null });
  const handleEdit = (user) => setFormModal({ open: true, data: user });
  const handleDelete = (user) => setDeleteModal({ open: true, data: user });

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.patch(`/users/${formData.id}`, formData);
        toast?.success?.('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast?.success?.('User created successfully');
      }
      setFormModal({ open: false, data: null });
      loadUsers();
    } catch (err) {
      console.error('Save failed:', err);
      toast?.error?.(err.response?.data?.error?.message || 'Failed to save');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/users/${deleteModal.data.id}`);
      toast?.success?.('User deleted successfully');
      setDeleteModal({ open: false, data: null });
      loadUsers();
    } catch (err) {
      console.error('Delete failed:', err);
      toast?.error?.(err.response?.data?.error?.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export
  const handleExport = () => {
    const headers = ['Username', 'Name', 'Role', 'Created'];
    const rows = filteredUsers.map(u => [u.username, u.name, u.role, u.created_at]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast?.success?.(`Exported ${filteredUsers.length} users`);
  };

  // Table columns
  const columns = [
    {
      key: 'checkbox',
      label: '',
      width: 'w-10',
      render: (_, user) => (
        <button onClick={() => toggleSelect(user.id)} className="p-1">
          <span className={`w-4 h-4 block rounded ${selectedIds.has(user.id) ? 'bg-blue-600' : 'border-2 border-slate-300'}`} />
        </button>
      ),
    },
    {
      key: 'username', label: 'Username', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
            {v.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold">{v}</span>
        </div>
      ),
    },
    { key: 'name', label: 'Full Name', sortable: true },
    {
      key: 'role', label: 'Role', sortable: true, align: 'center',
      render: (val) => {
        const colors = {
          admin: 'bg-purple-100 text-purple-700',
          ppic: 'bg-blue-100 text-blue-700',
          warehouse: 'bg-emerald-100 text-emerald-700',
          qc: 'bg-amber-100 text-amber-700',
          viewer: 'bg-slate-100 text-slate-700',
        };
        return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[val]}`}>{val?.toUpperCase()}</span>;
      },
    },
    { key: 'created_at', label: 'Created', sortable: true, render: (v) => v ? new Date(v).toLocaleDateString('en-GB') : '-' },
    {
      key: 'actions', label: 'Actions', width: 'w-24', align: 'right', sortable: false,
      render: (_, user) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => handleView(user)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleEdit(user)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => handleDelete(user)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // View modal fields
  const viewFields = [
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Full Name' },
    { key: 'role', label: 'Role', type: 'status' },
    { key: 'created_at', label: 'Created', type: 'datetime' },
    { key: 'updated_at', label: 'Last Updated', type: 'datetime' },
  ];

  // Form modal fields
  const formFields = [
    { key: 'username', label: 'Username', required: true, placeholder: 'Enter username', disabled: !!formModal.data },
    { key: 'name', label: 'Full Name', required: true, placeholder: 'Enter full name' },
    { key: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, required: true, placeholder: 'Select role' },
    { key: 'password', label: formModal.data ? 'New Password' : 'Password', type: 'password', placeholder: 'Enter password' },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Admin Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">{filteredUsers.length} users</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadUsers} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs hover:bg-slate-50">
            Export
          </button>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" />
            New Admin
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-xl font-bold text-purple-600">{stats.admin}</div>
          <div className="text-[10px] text-slate-500">Admin</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-xl font-bold text-blue-600">{stats.ppic}</div>
          <div className="text-[10px] text-slate-500">PPIC</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <div className="text-xl font-bold text-emerald-600">{stats.warehouse}</div>
          <div className="text-[10px] text-slate-500">Warehouse</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-xl font-bold text-amber-600">{stats.qc}</div>
          <div className="text-[10px] text-slate-500">QC</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="text-xl font-bold text-slate-600">{stats.viewer}</div>
          <div className="text-[10px] text-slate-500">Viewer</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search username, name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 max-w-xs">
            <label className="text-[10px] font-medium text-slate-500 uppercase mb-1 block">Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <span className="text-sm font-medium text-blue-700">{selectedIds.size} selected</span>
          <button onClick={toggleSelectAll} className="text-xs text-blue-600 hover:underline">
            {selectedIds.size === filteredUsers.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        error={error}
        pageSize={10}
        onRowClick={handleView}
        emptyMessage="No users found"
      />

      {/* View Modal */}
      <ViewModal
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, data: null })}
        title="User Details"
        data={viewModal.data}
        fields={viewFields}
      />

      {/* Form Modal */}
      <FormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        title={formModal.data ? 'Edit User' : 'Create User'}
        fields={formFields}
        initialData={formModal.data}
        isLoading={isSubmitting}
        submitLabel={formModal.data ? 'Update' : 'Create'}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, data: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete user "${deleteModal.data?.username}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default Users;
