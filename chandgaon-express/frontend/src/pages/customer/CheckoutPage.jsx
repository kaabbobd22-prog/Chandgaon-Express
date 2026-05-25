import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import useCartStore from '../../context/cartStore';
import { formatCurrency } from '../../utils/helpers';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, shopId, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    if (!address.trim()) return toast.error('Please enter delivery address');
    if (!phone.trim()) return toast.error('Please enter phone number');
    if (!items.length) return toast.error('Your cart is empty');

    // 🛠️ শপ আইডি নিশ্চিত করা হচ্ছে (স্টোর থেকে অথবা কার্টের প্রথম প্রোডাক্ট থেকে)
    const finalShopId = shopId || items[0]?.shop || items[0]?.product?.shop;

    if (!finalShopId) {
      return toast.error('Shop allocation missing. Please re-add items to cart.');
    }

    setLoading(true);
    try {
      // 🛠️ এখানে 'shopId' পরিবর্তন করে ব্যাকএন্ডের রিকোয়ারমেন্ট অনুযায়ী 'shop' পাঠানো হলো
      const data = await api.post('/orders', {
        shop: finalShopId, // 👈 ব্যাকএন্ড এই 'shop' ফিল্ডটিই খুঁজছে
        items,
        deliveryAddress: address,
        deliveryNote: note,
        customerPhone: phone,
      });
      console.log("🛒 Cart Items Structure:", items);
      console.log("🏪 Outgoing Shop ID:", shopId || items[0]?.shop || items[0]?.product?.shop);

      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate(`/track/${data.order._id}`);
    } catch (err) {
      // এক্সিওস এরর বা কাস্টম এরর মেসেজ হ্যান্ডলিং
      const errorMsg = err.response?.data?.message || err.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary pt-10 px-5 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-bold">Checkout</h1>
      </div>

      <div className="px-5 pt-4 pb-36 space-y-4">
        {/* Delivery address */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-primary" />
            <h3 className="font-semibold text-gray-800">Delivery Address</h3>
          </div>
          <textarea rows={3} className="input-field resize-none" placeholder="House no, road, area, landmark..."
            value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        {/* Phone */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Phone size={16} className="text-primary" />
            <h3 className="font-semibold text-gray-800">Contact Number</h3>
          </div>
          <input className="input-field" placeholder="01XXXXXXXXX" type="tel"
            value={phone} onChange={e => setPhone(e.target.value)} />
        </div>

        {/* Note */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Delivery Note (optional)</h3>
          <input className="input-field" placeholder="Any specific instructions..."
            value={note} onChange={e => setNote(e.target.value)} />
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Banknote size={16} className="text-primary" />
            <h3 className="font-semibold text-gray-800">Payment Method</h3>
          </div>
          <div className="flex items-center gap-3 bg-primary-50 border-2 border-primary rounded-xl p-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white text-lg">💵</div>
            <div>
              <p className="font-semibold text-primary text-sm">Cash on Delivery</p>
              <p className="text-gray-500 text-xs">Pay when your order arrives</p>
            </div>
            <div className="ml-auto w-5 h-5 border-2 border-primary rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-primary rounded-full" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
          {items.map(i => (
            <div key={i.product} className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{i.name} ×{i.quantity}</span>
              <span className="font-medium">{formatCurrency(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery</span><span className="text-accent">{formatCurrency(getDeliveryFee())}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 pt-1">
              <span>Total (Cash)</span>
              <span className="text-primary text-lg">{formatCurrency(getTotal())}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-white px-5 py-4 shadow-bottom z-30">
        <button onClick={handleOrder} disabled={loading} className="btn-primary w-full text-center">
          {loading ? 'Placing order…' : `Place Order · ${formatCurrency(getTotal())}`}
        </button>
      </div>
    </div>
  );
}