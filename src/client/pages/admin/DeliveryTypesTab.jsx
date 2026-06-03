// DeliveryTypesTab - Manage delivery types with codes
import { useState, useEffect, useCallback } from 'react';
import { Truck, Edit2, Trash2, Plus, Check, Hash } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../hooks';
import { FormModal, DeleteModal } from '../../components/modals';

export function DeliveryTypesTab() {
  const toast = useToast();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, data: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/delivery-types');
      setTypes(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message);
      toast.error('Failed to load delivery types');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, []);

  const handleCreate = () => setFormModal({ open: true, data: null });
  const handleEdit = (item) => setFormModal({ open: true, data: item });
  const handleDelete = (item) => setDeleteModal({ open: true, data: item });

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (formData.id) {
        await api.patch(`/delivery-types/${formData.id}`, formData);
        toast.success('Delivery type updated');
      } else {
        await api.post('/delivery-types', formData);
        toast.success('Delivery type created');
      }
      setFormModal({ open: false, data: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await api.delete(`/delivery-types/${deleteModal.data.id}`);
      toast.success('Delivery type deleted');
      setDeleteModal({ open: false, data: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = [
    { key: 'code', label: 'Type Code', placeholder: 'e.g., DT-01' },
    { key: 'name', label: 'Type Name', required: true, placeholder: 'e.g., Regular' },
    { key: 'sort_order', label: 'Sort Order', type: 'number', placeholder: 'e.g., 1' },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm mt-2">Loading delivery types...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <p className="text-red-500">{error}</p>
        <button onClick={load} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{types.length} delivery types</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Delivery Type
        </button>
      </div>

      {/* Types List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {types.map(type => (
            <div key={type.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-3">
                  {type.code && (
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold rounded">
                      {type.code}
                    </span>
                  )}
                  <div>
                    <span className="font-semibold text-slate-800">{type.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Hash className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">Order: {type.sort_order}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {type.is_active === 1 ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-lg">
                    <Check className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-lg">
                    Inactive
                  </span>
                )}
                <button onClick={() => handleEdit(type)} className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(type)} className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      <FormModal
        isOpen={formModal.open}
        onClose={() => setFormModal({ open: false, data: null })}
        onSubmit={handleSubmit}
        title={formModal.data ? 'Edit Delivery Type' : 'New Delivery Type'}
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
        title="Delete Delivery Type"
        message={`Delete "${deleteModal.data?.name}"? This may affect customers using this type.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}

export default DeliveryTypesTab;