import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import useCartStore from '../../context/cartStore';
import { formatCurrency } from '../../utils/helpers';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, addItem, removeItem, deleteItem, clearCart, getSubtotal, getDeliveryFee, getTotal } = useCartStore();

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <ShoppingCart size={64} className="text-gray-200 mb-4" />
      <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
      <p className="text-gray-400 text-sm mt-1 mb-6">Add some fresh items to get started</p>
      <button onClick={() => navigate('/products')} className="btn-primary px-8">Start Shopping</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary pt-10 px-5 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-bold">My Cart ({items.length})</h1>
        <button onClick={clearCart} className="text-red-300 text-sm font-medium">Clear</button>
      </div>

      <div className="px-5 pt-4 pb-36">
        {/* Items */}
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <div key={item.product} className="bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
              <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl">🛒</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                {item.unit && <p className="text-gray-400 text-xs">{item.unit}</p>}
                <p className="text-primary font-bold text-sm mt-0.5">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => removeItem(item.product)} className="w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center">
                  <Minus size={13} />
                </button>
                <span className="font-bold text-primary w-5 text-center">{item.quantity}</span>
                <button onClick={() => addItem({ _id: item.product, ...item }, null)} className="w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center">
                  <Plus size={13} />
                </button>
                <button onClick={() => deleteItem(item.product)} className="w-7 h-7 bg-red-50 text-red-400 rounded-xl flex items-center justify-center ml-1">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery fee info */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 mb-4">
          <h3 className="font-semibold text-primary text-sm mb-2">Delivery Charge</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[{ label:'1–3 items', fee:'৳10'},{label:'3+ items',fee:'৳30'},{label:'10+ kg',fee:'৳50'}].map(d => (
              <div key={d.label} className="bg-white rounded-xl p-2">
                <p className="text-primary font-bold text-sm">{d.fee}</p>
                <p className="text-gray-400 text-[10px]">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span className="font-semibold">{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery fee</span><span className="font-semibold text-accent">{formatCurrency(getDeliveryFee())}</span>
            </div>
          </div>
          <div className="border-t pt-3 flex justify-between font-bold">
            <span className="text-gray-800">Total</span>
            <span className="text-primary text-lg">{formatCurrency(getTotal())}</span>
          </div>
        </div>
      </div>

      {/* নিচের এই ডিভ ক্লাসে bottom-16 এবং z-30 অ্যাড করা হয়েছে */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-white px-5 py-4 shadow-bottom z-30">
        <button onClick={() => navigate('/checkout')} className="btn-primary w-full text-center">
          Proceed to Checkout · {formatCurrency(getTotal())}
        </button>
      </div>
    </div>
  );
}