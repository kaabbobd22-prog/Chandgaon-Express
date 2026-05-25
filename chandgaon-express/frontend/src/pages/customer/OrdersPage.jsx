// OrdersPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Package } from 'lucide-react';
import api from '../../utils/api';
import { formatCurrency, ORDER_STATUS } from '../../utils/helpers';

export function OrdersPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery('myOrders', () => api.get('/orders'));

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary pt-10 px-5 pb-4">
        <h1 className="text-white font-bold text-lg">My Orders</h1>
      </div>
      <div className="px-5 pt-4 pb-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
          </div>
        ) : !data?.orders?.length ? (
          <div className="text-center py-16">
            <Package size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-semibold">No orders yet</p>
            <button onClick={() => navigate('/products')} className="btn-primary mt-4 px-8">Shop Now</button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.orders.map(o => (
              <button key={o._id} onClick={() => navigate(`/track/${o._id}`)}
                className="w-full bg-white rounded-2xl shadow-card p-4 text-left">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-800">#{o.orderNumber}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS[o.status]?.color}`}>
                    {ORDER_STATUS[o.status]?.label}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{o.items?.map(i => i.name).join(', ')}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                  <p className="font-bold text-primary">{formatCurrency(o.totalAmount)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
