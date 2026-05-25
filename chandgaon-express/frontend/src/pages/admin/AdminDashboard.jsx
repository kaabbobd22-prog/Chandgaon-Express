import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { ShoppingBag, DollarSign, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { formatCurrency, ORDER_STATUS } from '../../utils/helpers';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-card border-l-4 ${color}`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.replace('border-','bg-').replace('-600','-100')}`}>
        <Icon size={18} className={color.replace('border-','text-')} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('adminDash', () => api.get('/admin/dashboard'), { refetchInterval: 30000 });

  useEffect(() => {
    const socket = io();
    socket.emit('join_admin');
    socket.on('new_order',      () => qc.invalidateQueries('adminDash'));
    socket.on('order_delivered',() => qc.invalidateQueries('adminDash'));
    return () => socket.disconnect();
  }, []);

  const s = data?.stats || {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Orders"  value={s.todayOrders || 0}          icon={ShoppingBag} color="border-blue-600"   sub="Last 24h" />
        <StatCard label="Total Revenue"   value={formatCurrency(s.totalRevenue||0)} icon={DollarSign}  color="border-green-600"  sub="All time" />
        <StatCard label="Pending Orders"  value={s.pendingOrders || 0}         icon={Clock}       color="border-yellow-500" sub="Needs action" />
        <StatCard label="Active Riders"   value={s.activeRiders || 0}          icon={Users}       color="border-primary"    sub="Online now" />
      </div>

      {/* COD Alert */}
      {s.totalDue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">COD Collection Due</p>
            <p className="text-red-600 text-sm">Riders owe <strong>{formatCurrency(s.totalDue)}</strong> in cash. Go to Riders & COD to settle.</p>
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl shadow-card">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <span className="badge-green">Live</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left bg-gray-50 text-gray-500 text-xs">
              <th className="px-5 py-3 font-semibold">Order</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Shop</th>
              <th className="px-5 py-3 font-semibold">Rider</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr></thead>
            <tbody>
              {isLoading ? (
                Array(5).fill(0).map((_,i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td></tr>
                ))
              ) : data?.recentOrders?.map(o => (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-primary">#{o.orderNumber}</td>
                  <td className="px-5 py-3">{o.customer?.name} <br/><span className="text-gray-400 text-xs">{o.customer?.phone}</span></td>
                  <td className="px-5 py-3 text-gray-600">{o.shop?.name}</td>
                  <td className="px-5 py-3 text-gray-600">{o.rider?.name || <span className="text-gray-300">—</span>}</td>
                  <td className="px-5 py-3 font-bold">{formatCurrency(o.totalAmount)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS[o.status]?.color}`}>
                      {ORDER_STATUS[o.status]?.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
