import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DollarSign, Package, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';

export default function AdminRiders() {
  const qc = useQueryClient();
  const [selected, setSelected]   = useState(null);
  const [showAdd, setShowAdd]     = useState(false);
  const [newRider, setNewRider]   = useState({ name: '', phone: '' });

  const { data } = useQuery('adminRiders', () => api.get('/admin/riders'));
  const { data: riderOrders } = useQuery(
    ['riderOrders', selected?._id],
    () => api.get(`/admin/riders/${selected._id}/orders`),
    { enabled: !!selected }
  );

  const markPaidMut = useMutation(
    (id) => api.post(`/admin/riders/${id}/mark-paid`, { amount: null }),
    { onSuccess: () => { toast.success('Marked as paid!'); qc.invalidateQueries('adminRiders'); qc.invalidateQueries(['riderOrders', selected?._id]); } }
  );

  const addRiderMut = useMutation(
    (body) => api.post('/admin/riders', body),
    { onSuccess: () => { toast.success('Rider added!'); qc.invalidateQueries('adminRiders'); setShowAdd(false); setNewRider({ name:'', phone:'' }); } }
  );

  const riders = data?.riders || [];
  const totalDue  = riders.reduce((s, r) => s + (r.riderInfo?.dueToPay || 0), 0);
  const totalPaid = riders.reduce((s, r) => s + (r.riderInfo?.totalPaidToAdmin || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Riders & COD</h1>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={16} /> Add Rider
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-card border-l-4 border-blue-500">
          <p className="text-gray-500 text-xs font-medium mb-1">Total Riders</p>
          <p className="text-2xl font-bold text-gray-800">{riders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border-l-4 border-red-500">
          <p className="text-gray-500 text-xs font-medium mb-1">Total Due from Riders</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Cash not yet collected</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-card border-l-4 border-green-500">
          <p className="text-gray-500 text-xs font-medium mb-1">Total Collected</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Cash received so far</p>
        </div>
      </div>

      {/* Riders table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="p-4 border-b">
          <h2 className="font-bold text-gray-800">Rider Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs text-left">
                <th className="px-4 py-3 font-semibold">Rider</th>
                <th className="px-4 py-3 font-semibold">Total Delivered</th>
                <th className="px-4 py-3 font-semibold">Cash Collected</th>
                <th className="px-4 py-3 font-semibold">Paid to Admin</th>
                <th className="px-4 py-3 font-semibold">Due Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map(r => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${r.riderInfo?.isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div>
                        <p className="font-semibold text-gray-800">{r.name}</p>
                        <p className="text-gray-400 text-xs">{r.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Package size={14} className="text-gray-400" />
                      <span className="font-semibold">{r.riderInfo?.totalDelivered || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {formatCurrency(r.riderInfo?.totalCollected || 0)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-600">
                    {formatCurrency(r.riderInfo?.totalPaidToAdmin || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-sm ${r.riderInfo?.dueToPay > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      {formatCurrency(r.riderInfo?.dueToPay || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.riderInfo?.dueToPay > 0
                      ? <span className="flex items-center gap-1 text-xs text-red-600 font-semibold"><AlertCircle size={12} />Due</span>
                      : <span className="flex items-center gap-1 text-xs text-green-600 font-semibold"><CheckCircle size={12} />Clear</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(r)}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg font-semibold hover:bg-gray-200">
                        View
                      </button>
                      {r.riderInfo?.dueToPay > 0 && (
                        <button onClick={() => markPaidMut.mutate(r._id)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold hover:bg-green-200">
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rider detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selected.name}</h3>
                <p className="text-gray-500 text-sm">{selected.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                {selected.riderInfo?.dueToPay > 0 && (
                  <button onClick={() => markPaidMut.mutate(selected._id)}
                    className="bg-green-500 text-white text-sm px-4 py-2 rounded-xl font-semibold">
                    Mark All Paid · {formatCurrency(selected.riderInfo?.dueToPay)}
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>
            </div>

            {/* Rider stats */}
            <div className="grid grid-cols-3 gap-3 p-4 border-b">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-blue-600">{selected.riderInfo?.totalDelivered || 0}</p>
                <p className="text-xs text-gray-500">Deliveries</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-red-600">{formatCurrency(selected.riderInfo?.dueToPay || 0)}</p>
                <p className="text-xs text-gray-500">Due to Pay</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-600">{formatCurrency(selected.riderInfo?.totalPaidToAdmin || 0)}</p>
                <p className="text-xs text-gray-500">Total Paid</p>
              </div>
            </div>

            {/* Orders */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-gray-500 text-xs sticky top-0">
                  <th className="px-4 py-2 text-left font-semibold">Order</th>
                  <th className="px-4 py-2 text-left font-semibold">Customer</th>
                  <th className="px-4 py-2 text-left font-semibold">Amount</th>
                  <th className="px-4 py-2 text-left font-semibold">COD Status</th>
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                </tr></thead>
                <tbody>
                  {riderOrders?.orders?.map(o => (
                    <tr key={o._id} className="border-t">
                      <td className="px-4 py-2 font-semibold text-primary">#{o.orderNumber}</td>
                      <td className="px-4 py-2">{o.customer?.name}</td>
                      <td className="px-4 py-2 font-bold">{formatCurrency(o.totalAmount)}</td>
                      <td className="px-4 py-2">
                        {o.codPaidToAdmin
                          ? <span className="badge-green">Paid ✓</span>
                          : o.codCollected
                            ? <span className="badge-orange">Collected, not paid</span>
                            : <span className="text-gray-400 text-xs">Pending delivery</span>
                        }
                      </td>
                      <td className="px-4 py-2 text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add rider modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-4">Add New Rider</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="Full name" value={newRider.name}
                onChange={e => setNewRider(f => ({ ...f, name: e.target.value }))} />
              <input className="input-field" placeholder="Phone (01XXXXXXXXX)" value={newRider.phone}
                onChange={e => setNewRider(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => addRiderMut.mutate(newRider)} className="flex-1 btn-primary text-center">Add</button>
              <button onClick={() => setShowAdd(false)} className="flex-1 btn-outline text-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
