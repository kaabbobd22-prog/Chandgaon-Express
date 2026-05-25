import React, { useState } from 'react';
import { User, MapPin, Phone, LogOut, ChevronRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../context/authStore';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', address: user?.address || '' });

  if (!user) { navigate('/login'); return null; }

  const handleSave = async () => {
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-primary pt-10 px-5 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            {user.name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">{user.name}</h1>
            <p className="text-primary-100 text-sm">{user.phone}</p>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-1 inline-block capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 pb-8 space-y-3">
        {editing ? (
          <div className="bg-white rounded-2xl shadow-card p-4 space-y-3">
            <input className="input-field" placeholder="Full name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <textarea rows={3} className="input-field resize-none" placeholder="Delivery address"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 btn-primary text-center">Save</button>
              <button onClick={() => setEditing(false)} className="flex-1 btn-outline text-center">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Profile Info</h3>
              <button onClick={() => setEditing(true)} className="text-primary text-sm font-semibold">Edit</button>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={15} className="text-primary" /><span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={15} className="text-primary" /><span>{user.phone}</span>
              </div>
              {user.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" /><span>{user.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={() => navigate('/orders')} className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-3">
          <Package size={20} className="text-primary" />
          <span className="font-semibold text-gray-800 flex-1 text-left">My Orders</span>
          <ChevronRight size={18} className="text-gray-400" />
        </button>

        <button onClick={() => { if(window.confirm('Log out?')) logout(); }}
          className="w-full bg-white rounded-2xl shadow-card p-4 flex items-center gap-3 text-red-500">
          <LogOut size={20} />
          <span className="font-semibold flex-1 text-left">Log Out</span>
        </button>
      </div>
    </div>
  );
}
