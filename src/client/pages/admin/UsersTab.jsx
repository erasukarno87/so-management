// UsersTab - User management tab component
import { useState, useEffect, useMemo } from 'react';
import { Users, Shield, Truck, Search, UserCheck, Eye, EyeOff } from 'lucide-react';
import api from '../../api/client';
import { DataTable } from '../../components/DataTable';
import { useToast } from '../../hooks';
import { formatDate } from '../../utils/formatters';

export function UsersTab({ onEdit, onDelete }) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState(new Set());

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(u =>
      u.username?.toLowerCase().includes(term) ||
      u.name?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => ({
    total: filteredUsers.length,
    admin: filteredUsers.filter(u => u.role === 'admin').length,
    ppic: filteredUsers.filter(u => u.role === 'ppic').length,
    warehouse: filteredUsers.filter(u => u.role === 'warehouse').length,
    qc: filteredUsers.filter(u => u.role === 'qc').length,
    viewer: filteredUsers.filter(u => u.role === 'viewer').length,
  }), [filteredUsers]);

  const handleTogglePassword = (userId) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const handleResetPassword = async (userId, username) => {
    const newPassword = username + '123';
    if (!confirm(`Reset password for "${username}"?\n\nNew password: ${newPassword}\n\nClick OK to confirm.`)) {
      return;
    }
    try {
      await api.post(`/users/${userId}/reset-password`, { newPassword });
      toast.success(`Password reset for ${username}: ${newPassword}`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to reset password');
    }
  };

  const roleColors = {
    admin: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    ppic: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    warehouse: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    qc: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    viewer: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  };

  const columns = [
    {
      key: 'username', label: 'User', sortable: true,
      render: (v, user) => {
        const colors = roleColors[user.role] || roleColors.viewer;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <Users className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{v}</p>
              <p className="text-xs text-slate-500">{user.name}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role', label: 'Role', sortable: true, align: 'center',
      render: (v) => {
        const colors = roleColors[v] || roleColors.viewer;
        return (
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text}`}>
            {v?.toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'password_plain', label: 'Password',
      render: (v, user) => (
        <div className="flex items-center gap-2">
          <span className={`font-mono text-sm ${visiblePasswords.has(user.id) ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
            {visiblePasswords.has(user.id) ? (v || user.username + '123') : '••••••••'}
          </span>
          <button
            onClick={() => handleTogglePassword(user.id)}
            className={`p-1.5 rounded-lg transition-colors ${visiblePasswords.has(user.id) ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            {visiblePasswords.has(user.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      ),
    },
    {
      key: 'last_login', label: 'Last Login', sortable: true,
      render: v => v ? (
        <span className="text-sm text-slate-600">{formatDate(v)}</span>
      ) : (
        <span className="text-xs text-slate-400 italic">Never</span>
      ),
    },
    {
      key: 'actions', label: '', width: 'w-32', align: 'right',
      render: (_, user) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleResetPassword(user.id, user.username)}
            className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
            title="Reset password"
          >
            <Shield className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(user)}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
            title="Edit user"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-1.414a2 2 0 112.828 2.828l3.586 3.586a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828 0L9.172 16.5m-1.414-1.414a2 2 0 012.828-2.828l3.586 3.586a2 2 0 010 2.828l-1.414 1.414a2 2 0 01-2.828 0" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(user)}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete user"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-8V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2m4 0v1a1 1 0 001 1h1a1 1 0 001-1v-1m-2 0h-2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-600">
            {stats.total} user(s)
          </div>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: 'Admin', value: stats.admin, color: 'purple' },
          { label: 'PPIC', value: stats.ppic, color: 'blue' },
          { label: 'Warehouse', value: stats.warehouse, color: 'emerald' },
          { label: 'QC', value: stats.qc, color: 'amber' },
          { label: 'Viewer', value: stats.viewer, color: 'slate' },
        ].map(stat => (
          <div key={stat.label} className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-xl px-4 py-3`}>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            <p className={`text-xs text-${stat.color}-500`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        error={error}
        pageSize={10}
        emptyMessage="No users found"
      />
    </div>
  );
}

export default UsersTab;