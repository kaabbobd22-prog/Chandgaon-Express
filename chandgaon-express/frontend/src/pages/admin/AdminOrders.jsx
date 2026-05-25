import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatCurrency, ORDER_STATUS } from '../../utils/helpers';

const STATUSES = ['', 'pending', 'confirmed', 'preparing', 'picked', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [riderId, setRiderId] = useState('');

  const { data } = useQuery(['adminOrders', filter], () =>
    api.get(`/admin/orders?${filter ? `status=${filter}&` : ''}limit=50`));
  const { data: riders } = useQuery('riders', () => api.get('/admin/riders'));

  const assignMut = useMutation(({ orderId, riderId }) =>
    api.put(`/orders/${orderId}/assign-rider`, { riderId }), {
    onSuccess: () => { toast.success('Rider assigned!'); qc.invalidateQueries('adminOrders'); setSelected(null); },
  });

  const statusMut = useMutation(({ orderId, status }) =>
    api.put(`/orders/${orderId}/status`, { status }), {
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries('adminOrders'); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition
              ${filter === s ? 'bg-primary text-white' : 'bg-white text-gray-600 border'}`}>
            {s ? ORDER_STATUS[s]?.label : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-500 text-xs text-left">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Amount</th>
              <th className="px-4 py-3 font-semibold">Rider</th>
              <th className="px-4 py-3 font-semibold">COD</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr></thead>
            <tbody>
              {data?.orders?.map(o => (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-primary">#{o.orderNumber}</p>
                    <p className="text-gray-400 text-xs">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer?.name}</p>
                    <p className="text-gray-400 text-xs">{o.customer?.phone}</p>
                  </td>
                  <td className="px-4 py-3 font-bold">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-4 py-3">{o.rider?.name || <span className="text-gray-300 text-xs">Unassigned</span>}</td>
                  <td className="px-4 py-3">
                    {o.codCollected
                      ? o.codPaidToAdmin
                        ? <span className="badge-green">Paid ✓</span>
                        : <span className="badge-orange">Collected</span>
                      : <span className="text-gray-400 text-xs">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS[o.status]?.color}`}>
                      {ORDER_STATUS[o.status]?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!o.rider && o.status === 'confirmed' && (
                        <button onClick={() => setSelected(o)}
                          className="text-xs bg-primary-50 text-primary px-2 py-1 rounded-lg font-semibold">
                          Assign
                        </button>
                      )}
                      <select className="text-xs border rounded-lg px-2 py-1"
                        value={o.status}
                        onChange={e => statusMut.mutate({ orderId: o._id, status: e.target.value })}>
                        {STATUSES.filter(Boolean).map(s => (
                          <option key={s} value={s}>{ORDER_STATUS[s]?.label}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign rider modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-4">Assign Rider to #{selected.orderNumber}</h3>
            <select className="input-field mb-4" value={riderId} onChange={e => setRiderId(e.target.value)}>
              <option value="">Select rider…</option>
              {riders?.riders?.map(r => (
                <option key={r._id} value={r._id}>{r.name} — {r.phone}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => assignMut.mutate({ orderId: selected._id, riderId })}
                disabled={!riderId} className="flex-1 btn-primary text-center">Assign</button>
              <button onClick={() => setSelected(null)} className="flex-1 btn-outline text-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
