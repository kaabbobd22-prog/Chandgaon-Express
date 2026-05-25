import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { ArrowLeft, Phone, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import { formatCurrency, ORDER_STATUS } from '../../utils/helpers';

const STEPS = ['pending','confirmed','preparing','picked','delivered'];
const STEP_LABELS = { pending:'Order Placed', confirmed:'Confirmed', preparing:'Being Prepared', picked:'On the Way', delivered:'Delivered!' };
const STEP_ICONS  = { pending:'📝', confirmed:'✅', preparing:'🏪', picked:'🛵', delivered:'🎉' };

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(['order', id], () => api.get(`/orders/${id}`));

  useEffect(() => {
    const socket = io();
    socket.emit('join_order', id);
    socket.on('order_update', () => qc.invalidateQueries(['order', id]));
    return () => socket.disconnect();
  }, [id]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const order = data?.order;
  if (!order) return null;
  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary pt-10 px-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <div>
          <h1 className="text-white font-bold">Order #{order.orderNumber}</h1>
          <p className="text-primary-100 text-xs">Est. delivery: 25–35 min</p>
        </div>
      </div>

      <div className="px-5 pt-4 pb-6 space-y-4">
        {/* Status card */}
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-2xl">{STEP_ICONS[order.status]}</span>
            <div>
              <p className="font-bold text-gray-800">{STEP_LABELS[order.status]}</p>
              <p className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit mt-0.5 ${ORDER_STATUS[order.status]?.color}`}>
                {ORDER_STATUS[order.status]?.label}
              </p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center">
            {STEPS.filter(s => s !== 'cancelled').map((step, idx, arr) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                    ${idx <= currentStep ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {idx < currentStep ? '✓' : idx + 1}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 text-center w-12 leading-tight">
                    {STEP_LABELS[step].split(' ')[0]}
                  </p>
                </div>
                {idx < arr.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 mb-4 rounded-full transition-all
                    ${idx < currentStep ? 'bg-primary' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Rider info */}
        {order.rider && order.status === 'picked' && (
          <div className="bg-white rounded-2xl shadow-card p-4">
            <p className="text-xs text-gray-400 font-semibold mb-2">YOUR DELIVERY RIDER</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl">🛵</div>
                <div>
                  <p className="font-bold text-gray-800">{order.rider.name}</p>
                  <p className="text-gray-400 text-sm">{order.rider.phone}</p>
                </div>
              </div>
              <a href={`tel:${order.rider.phone}`}
                className="w-10 h-10 bg-primary-50 text-primary rounded-xl flex items-center justify-center">
                <Phone size={18} />
              </a>
            </div>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs text-gray-400 font-semibold mb-3">ORDER ITEMS</p>
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-10 h-10 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span>🛒</span>}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                <p className="text-gray-400 text-xs">×{item.quantity}</p>
              </div>
              <p className="font-bold text-sm text-gray-800">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
          <div className="border-t mt-3 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span><span className="text-accent">{formatCurrency(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 pt-1">
              <span>Total (Cash)</span>
              <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-xs text-gray-400 font-semibold mb-2">DELIVERY TO</p>
          <p className="text-sm text-gray-800">{order.deliveryAddress}</p>
          <p className="text-sm text-gray-500 mt-1">{order.customerPhone}</p>
        </div>
      </div>
    </div>
  );
}
