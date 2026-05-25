import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const CATS = ['grocery','vegetable','bakery','pharmacy','meat','dairy','snacks','other'];

export default function AdminShops() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | 'add' | shop obj
  const [form, setForm]   = useState({ name:'', category:'grocery', commissionRate:8, phone:'', address:'' });
  const { data } = useQuery('shops', () => api.get('/shops'));

  const saveMut = useMutation(
    (body) => modal === 'add' ? api.post('/shops', body) : api.put(`/shops/${modal._id}`, body),
    { onSuccess: () => { toast.success('Saved!'); qc.invalidateQueries('shops'); setModal(null); } }
  );

  const openAdd = () => { setForm({ name:'', category:'grocery', commissionRate:8, phone:'', address:'' }); setModal('add'); };
  const openEdit = (s) => { setForm({ name:s.name, category:s.category, commissionRate:s.commissionRate, phone:s.phone||'', address:s.address||'' }); setModal(s); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Shops</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={16} /> Add Shop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.shops?.map(s => (
          <div key={s._id} className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">🏪</div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200">
                  <Pencil size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-gray-800">{s.name}</h3>
            <p className="text-gray-500 text-sm capitalize">{s.category}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <span className="text-xs text-gray-500">Commission: <strong>{s.commissionRate}%</strong></span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.isActive ? 'badge-green' : 'badge-red'}`}>
                {s.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-gray-800 mb-4">{modal === 'add' ? 'Add Shop' : 'Edit Shop'}</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="Shop name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              <select className="input-field" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <input className="input-field" placeholder="Phone" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
              <input className="input-field" placeholder="Address" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Commission Rate (%)</label>
                <input type="number" min="0" max="30" className="input-field" value={form.commissionRate} onChange={e => setForm(f=>({...f,commissionRate:+e.target.value}))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => saveMut.mutate(form)} className="flex-1 btn-primary text-center">Save</button>
              <button onClick={() => setModal(null)} className="flex-1 btn-outline text-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
