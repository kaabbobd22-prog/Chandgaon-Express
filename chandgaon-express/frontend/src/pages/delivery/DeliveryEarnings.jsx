import React from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, Package, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency, ORDER_STATUS } from '../../utils/helpers';

export default function DeliveryEarnings() {
  const { data, isLoading } = useQuery('delEarnings', () => api.get('/delivery/earnings'));

  const s = data?.summary || {};

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary pt-10 px-5 pb-6">
        <h1 className="text-white font-bold text-xl mb-4">My Earnings</h1>

        {/* Today */}
        <div className="bg-white/15 rounded-2xl p-4 text-center mb-4">
          <p className="text-primary-100 text-xs mb-1">Today's Total</p>
          <p className="text-white text-3xl font-bold">{formatCurrency(s.todayAmount || 0)}</p>
          <p className="text-primary-100 text-xs mt-1">{s.todayDeliveries || 0} deliveries today</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Deliveries', value: s.totalDelivered || 0, unit: '' },
            { label: 'Cash Collected',   value: formatCurrency(s.totalCollected || 0), unit: '' },
            { label: 'Paid to Admin',    value: formatCurrency(s.totalPaidToAdmin || 0), unit: '' },
          ].map(i => (
            <div key={i.label} className="bg-white/15 rounded-xl p-2 text-center">
              <p className="text-white font-bold text-sm">{i.value}</p>
              <p className="text-primary-100 text-[9px] leading-tight">{i.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4 pb-6 space-y-4">
        {/* Due alert */}
        {s.dueToPay > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700">Cash Due to Admin</p>
              <p className="text-red-600 text-sm">You need to pay <strong>{formatCurrency(s.dueToPay)}</strong> to admin.</p>
            </div>
          </div>
        )}
        {s.dueToPay === 0 && s.totalDelivered > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <p className="font-semibold text-green-700">All cleared! No pending dues.</p>
          </div>
        )}

        {/* Recent orders */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">Recent Deliveries</h2>
          {isLoading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_,i)=><div key={i} className="bg-white rounded-2xl h-16 animate-pulse"/>)}</div>
          ) : !data?.recentOrders?.length ? (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-30"/>
              <p>No deliveries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map(o => (
                <div key={o._id} className="bg-white rounded-2xl shadow-card p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-primary">#{o.orderNumber}</span>
                    <span className="font-bold text-gray-800">{formatCurrency(o.totalAmount)}</span>
                  </div>
                  <p className="text-gray-500 text-sm">{o.customer?.name} · {o.deliveryAddress}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{new Date(o.updatedAt).toLocaleDateString()}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                      ${o.codPaidToAdmin ? 'badge-green' : o.codCollected ? 'badge-orange' : 'bg-gray-100 text-gray-500'}`}>
                      {o.codPaidToAdmin ? 'Paid to Admin' : o.codCollected ? 'Cash Collected' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
