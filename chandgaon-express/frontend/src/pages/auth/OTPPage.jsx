import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

export default function OTPPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);
  const { verifyOTP, sendOTP, loading } = useAuthStore();
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone;

  if (!phone) { navigate('/login'); return null; }

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) refs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter complete OTP');
    try {
      const data = await verifyOTP(phone, code);
      toast.success('Login successful!');
      if (!data.user.name || data.user.name === 'নতুন ব্যবহারকারী') navigate('/setup');
      else if (data.user.role === 'admin')  navigate('/admin');
      else if (data.user.role === 'rider')  navigate('/delivery');
      else navigate('/');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    await sendOTP(phone);
    toast.success('OTP resent!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-primary px-6 pt-14 pb-10 text-white">
        <button onClick={() => navigate('/login')} className="mb-4 p-1 -ml-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-bold">Verify OTP</h1>
        <p className="text-primary-100 text-sm mt-1">Sent to 88 {phone}</p>
      </div>

      <div className="flex-1 bg-surface px-6 pt-8">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <p className="text-gray-600 text-sm mb-6">Enter the 6-digit code we sent to your phone</p>

          {/* OTP inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((d, i) => (
              <input key={i} ref={el => refs.current[i] = el}
                type="tel" maxLength={1} value={d}
                onChange={e => handleChange(e.target.value, i)}
                onKeyDown={e => handleKeyDown(e, i)}
                className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl transition
                  ${d ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 bg-surface'}`}
              />
            ))}
          </div>

          <button onClick={handleVerify} disabled={loading || otp.join('').length < 6}
            className="btn-primary w-full text-center">
            {loading ? 'Verifying…' : 'Verify & Login'}
          </button>

          <button onClick={handleResend} className="w-full text-center text-primary font-medium text-sm mt-4">
            Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}
