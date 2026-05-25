import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

export default function SetupProfile() {
  const [form, setForm] = useState({ name: '', address: '' });
  const { updateProfile, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name');
    try {
      await updateProfile(form);
      toast.success('Profile saved!');
      if (user?.role === 'rider') navigate('/delivery');
      else navigate('/');
    } catch { toast.error('Failed to save profile'); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-primary px-6 pt-16 pb-10 text-white">
        <div className="text-3xl mb-2">✨</div>
        <h1 className="text-2xl font-bold">Set Up Profile</h1>
        <p className="text-primary-100 text-sm mt-1">Tell us a bit about yourself</p>
      </div>
      <div className="flex-1 bg-surface px-6 pt-8">
        <div className="bg-white rounded-3xl shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name *</label>
              <input className="input-field" placeholder="Your full name"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Address</label>
              <textarea rows={3} className="input-field resize-none" placeholder="House no, road, area..."
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary w-full">Save & Continue</button>
          </form>
        </div>
      </div>
    </div>
  );
}
