import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { MapPin, Phone, Package, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import { formatCurrency } from '../../utils/helpers';

export default function DeliveryHome() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: queue   } = useQuery('delQueue',  () => api.get('/delivery/queue'), { refetchInterval: 15000 });
  const { data: myOrders} = useQuery('myOrders',  () => api.get('/delivery/my-orders?status=picked'));

  const toggleMut  = useMutation(() => api.put('/delivery/toggle-online'), {
    onSuccess: (d) => toast.success(d.isOnline ? 'You are Online 🟢' : 'You are Offline'),
  });
  const acceptMut  = useMutation((id) => api.put(`/delivery/accept/${id}`), {
    onSuccess: () => { toast.success('Order accepted!'); qc.invalidateQueries('delQueue'); qc.invalidateQueries('myOrders'); },
  });
  const completeMut = useMutation((id) => api.put(`/delivery/complete/${id}`), {
    onSuccess: () => { toast.success('Delivery complete! Cash collected ✓'); qc.invalidateQueries('myOrders'); qc.invalidateQueries('delEarnings'); },
  });

  useEffect(() => {
    const socket = io();
    socket.emit('join_rider', user?._id);
    socket.on('new_assignment', () => qc.invalidateQueries('delQueue'));
    return () => socket.disconnect();
  }, [user?._id]);

  const isOnline = user?.riderInfo?.isOnline;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-primary pt-10 px-5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-xs">Welcome back</p>
            <h1 className="text-white font-bold text-xl">{user?.name} 👋</h1>
          </div>
          <button onClick={() => toggleMut.mutate()}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition
              ${isOnline ? 'bg-green-500 border-green-400 text-white' : 'bg-white/20 border-white/30 text-white'}`}>
            {isOnline ? '🟢 Online' : '⭘ Offline'}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Today',     value: user?.riderInfo?.totalDelivered || 0, unit: 'orders' },
            { label: 'Collected', value: formatCurrency(user?.riderInfo?.totalCollected || 0), unit: 'cash' },
            { label: 'Due',       value: formatCurrency(user?.riderInfo?.dueToPay || 0), unit: 'to pay' },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
              <p className="text-primary-100 text-[10px]">{s.unit}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-4 space-y-4">
        {/* Active deliveries */}
        {myOrders?.orders?.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">Active Delivery</h2>
            {myOrders.orders.map(o => (
              <div key={o._id} className="bg-white rounded-2xl shadow-card p-4 border-l-4 border-accent">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-primary">#{o.orderNumber}</span>
                  <span className="text-xs bg-orange-100 text-accent font-semibold px-2 py-0.5 rounded-full">On the Way</span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Package size={11} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Pickup from</p>
                      <p className="font-semibold text-gray-800">{o.shop?.name}</p>
                      <p className="text-gray-500 text-xs">{o.shop?.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MapPin size={11} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Deliver to</p>
                      <p className="font-semibold text-gray-800">{o.deliveryAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <p className="text-xs text-gray-400">Collect cash</p>
                    <p className="font-bold text-primary text-lg">{formatCurrency(o.totalAmount)}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${o.customerPhone}`}
                      className="w-10 h-10 bg-primary-50 text-primary rounded-xl flex items-center justify-center">
                      <Phone size={16} />
                    </a>
                    <button onClick={() => completeMut.mutate(o._id)}
                      className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold">
                      <CheckCircle size={16} />
                      Delivered
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Queue */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">Available Orders</h2>
            <span className="badge-green">{queue?.orders?.length || 0} new</span>
          </div>

          {!queue?.orders?.length ? (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-30" />
              <p className="font-semibold">No orders available</p>
              <p className="text-sm mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.orders.map(o => (
                <div key={o._id} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-primary">#{o.orderNumber}</span>
                    <span className="font-bold text-gray-800">{formatCurrency(o.totalAmount)}</span>
                  </div>
                  <div className="space-y-1.5 mb-3 text-sm">
                    <p className="text-gray-600">
                      <span className="text-gray-400">From: </span>
                      <span className="font-medium">{o.shop?.name}</span>
                    </p>
                    <p className="text-gray-600">
                      <span className="text-gray-400">To: </span>
                      <span className="font-medium">{o.deliveryAddress}</span>
                    </p>
                    <p className="text-gray-600 text-xs">
                      {o.items?.length} items · Cash on Delivery
                    </p>
                  </div>
                  <button onClick={() => acceptMut.mutate(o._id)}
                    className="w-full bg-primary text-white py-2.5 rounded-xl font-bold text-sm active:scale-95 transition">
                    Accept Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
