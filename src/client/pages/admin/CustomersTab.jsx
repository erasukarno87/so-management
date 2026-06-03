// CustomersTab - Customer hierarchical tree view
import { useState, useEffect, useCallback } from 'react';
import { Building2, Edit2, Trash2, Plus, MapPin, Check, ChevronRight, Truck, Package } from 'lucide-react';
import api from '../../api/client';
import { useToast } from '../../hooks';
import { formatDate } from '../../utils/formatters';

export function CustomersTab({ onEdit, onDelete, onAddDestination, onEditDestination, onDeleteDestination }) {
  const toast = useToast();
  const [treeData, setTreeData] = useState({ main: [], others: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCustomers, setExpandedCustomers] = useState(new Set());
  const [expandedDestinations, setExpandedDestinations] = useState(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/customers/tree');
      const data = res.data || { main: [], others: [] };
      setTreeData(data);
      // Auto-expand all customers
      const allCustomerIds = [...data.main.map(c => c.id), ...data.others.map(c => c.id)];
      setExpandedCustomers(new Set(allCustomerIds));
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      setError(errorMessage);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, []);

  const toggleCustomer = (customerId) => {
    setExpandedCustomers(prev => {
      const next = new Set(prev);
      next.has(customerId) ? next.delete(customerId) : next.add(customerId);
      return next;
    });
  };

  const toggleDestination = (destId) => {
    setExpandedDestinations(prev => {
      const next = new Set(prev);
      next.has(destId) ? next.delete(destId) : next.add(destId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm mt-2">Loading customers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 text-red-400 mx-auto mb-3">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-red-500">{error}</p>
        <button onClick={load} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  const hasMainCustomers = treeData.main.length > 0;
  const hasOtherCustomers = treeData.others.length > 0;

  if (!hasMainCustomers && !hasOtherCustomers) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-slate-500 mt-2">No customers yet</p>
        <button
          onClick={() => onEdit({})}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Add First Customer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Customers Tree */}
      {hasMainCustomers && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white flex items-center gap-3">
            <Building2 className="w-5 h-5" />
            <span className="font-bold">Customer</span>
            <span className="ml-auto text-sm text-slate-400">{treeData.main.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {treeData.main.map(customer => (
              <CustomerNode
                key={customer.id}
                customer={customer}
                isExpanded={expandedCustomers.has(customer.id)}
                expandedDests={expandedDestinations}
                onToggleCustomer={() => toggleCustomer(customer.id)}
                onToggleDest={toggleDestination}
                onEdit={() => onEdit(customer)}
                onDelete={() => onDelete(customer)}
                onAddDestination={() => onAddDestination(customer.id)}
                onEditDestination={onEditDestination}
                onDeleteDestination={onDeleteDestination}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Customers */}
      {hasOtherCustomers && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-slate-600 to-slate-500 text-white flex items-center gap-3">
            <Package className="w-5 h-5" />
            <span className="font-bold">Others Customer</span>
            <span className="ml-auto text-sm text-slate-300">{treeData.others.length}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {treeData.others.map(customer => (
              <div key={customer.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-slate-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    {customer.code && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-mono font-bold rounded">
                        {customer.code}
                      </span>
                    )}
                    <span className="font-medium text-slate-800">{customer.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(customer)} className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(customer)} className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Customer Button */}
      <button
        onClick={() => onEdit({})}
        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Add New Customer
      </button>
    </div>
  );
}

// Customer Node Component
function CustomerNode({ customer, isExpanded, expandedDests, onToggleCustomer, onToggleDest, onEdit, onDelete, onAddDestination, onEditDestination, onDeleteDestination }) {
  const destCount = customer.destinations?.length || 0;

  return (
    <div>
      {/* Customer Header */}
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggleCustomer}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              {customer.code && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-mono font-bold rounded">
                  {customer.code}
                </span>
              )}
              <span className="font-semibold text-slate-800">{customer.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{destCount} destination{destCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onAddDestination(); }} className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600" title="Add Destination">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Destinations List */}
      {isExpanded && destCount > 0 && (
        <div className="bg-slate-50 border-t border-slate-100">
          <div className="px-5 py-3 pl-16 space-y-2">
            {customer.destinations.map(dest => (
              <DestinationNode
                key={dest.groupId}
                destination={dest}
                isExpanded={expandedDests.has(dest.groupId)}
                onToggle={() => onToggleDest(dest.groupId)}
                onEdit={() => onEditDestination({ ...dest, customer_id: customer.id }, customer.id)}
                onDelete={() => onDeleteDestination({ ...dest, customer_id: customer.id })}
                onEditItem={(item) => onEditDestination(item, customer.id)}
                onDeleteItem={(item) => onDeleteDestination(item)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Destination Node Component
// Shows destination name with dest code and list of types with their type codes
function DestinationNode({ destination, isExpanded, onToggle, onEdit, onDelete, onEditItem, onDeleteItem }) {
  const itemCount = destination.items?.length || 0;
  const destCode = destination.destCode || 'N/A';

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Destination Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
            <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </div>
          <div className="w-12 h-10 rounded bg-slate-100 flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-slate-700">{destCode}</span>
          </div>
          <div>
            <span className="font-medium text-slate-800">{destination.name}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{itemCount} types</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600" title="Edit Destination">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600" title="Delete Destination">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Type Items List */}
      {isExpanded && itemCount > 0 && (
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
          <div className="space-y-2">
            {destination.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                    {item.type}
                  </span>
                  <span className="font-mono text-sm font-bold text-blue-600">
                    ({item.code})
                  </span>
                  {item.is_default === 1 && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                      <Check className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEditItem(item)}
                    className="p-1.5 rounded hover:bg-blue-100 text-slate-400 hover:text-blue-600"
                    title="Edit Code"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item)}
                    className="p-1.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomersTab;