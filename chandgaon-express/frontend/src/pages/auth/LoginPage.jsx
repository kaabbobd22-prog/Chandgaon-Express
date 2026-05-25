import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const { sendOTP, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^01[3-9]\d{8}$/.test(phone)) return toast.error('Enter a valid BD phone number');
    try {
      await sendOTP(phone);
      toast.success('OTP sent!');
      navigate('/otp', { state: { phone } });
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Green Header */}
      <div className="bg-primary px-6 pt-16 pb-10 text-white">
        <div className="text-3xl mb-1">🛵</div>
        <h1 className="text-2xl font-bold">Chandgaon Express</h1>
        <p className="text-primary-100 text-sm mt-1">Fresh groceries at your doorstep</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-surface px-6 pt-8">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome back 👋</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your phone number to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 bg-surface focus-within:border-primary transition">
                <Phone size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                <span className="text-gray-500 text-sm mr-2">+88</span>
                <input
                  type="tel" placeholder="01XXXXXXXXX" maxLength={11}
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="flex-1 py-3 bg-transparent text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <button type="submit" disabled={loading || phone.length < 11}
              className="btn-primary w-full text-center">
              {loading ? 'Sending OTP…' : 'Get OTP'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
