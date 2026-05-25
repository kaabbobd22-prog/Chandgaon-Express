import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Pencil, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';

const CATS = ['vegetable','meat','fruits','bakery','dairy','snacks','grocery','pharmacy'];

const EMPTY = { name:'', nameBn:'', category:'vegetable', price:'', unit:'pcs', unitValue:'', shop:'', stock:100, isFeatured:false, description:'' };

export default function AdminProducts() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(EMPTY);
  const [imgFile, setImgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const { data: products } = useQuery('adminProducts', () => api.get('/products?limit=100'));
  const { data: shops    } = useQuery('shops',         () => api.get('/shops'));

  const saveMut = useMutation(async (body) => {
    let imageUrl = form.image || '';
    if (imgFile) {
      setUploading(true);
      const fd = new FormData(); fd.append('image', imgFile);
      const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      imageUrl = res.url;
      setUploading(false);
    }
    const payload = { ...body, image: imageUrl };
    return modal === 'add' ? api.post('/products', payload) : api.put(`/products/${modal._id}`, payload);
  }, {
    onSuccess: () => { toast.success('Saved!'); qc.invalidateQueries('adminProducts'); setModal(null); setImgFile(null); },
    onError:   () => { toast.error('Failed to save'); setUploading(false); },
  });

  const openAdd  = () => { setForm(EMPTY); setImgFile(null); setModal('add'); };
  const openEdit = (p) => { setForm({ ...p, shop: p.shop?._id || p.shop || '' }); setImgFile(null); setModal(p); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-gray-500 text-xs text-left">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Shop</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Price</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Featured</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr></thead>
            <tbody>
              {products?.products?.map(p => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-base">🛒</span>}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.shop?.name || '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 font-bold">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">{p.stock}</td>
                  <td className="px-4 py-3">{p.isFeatured ? '⭐' : '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200">
                      <Pencil size={14}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-4">
            <h3 className="font-bold text-gray-800 mb-4">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="Product name (English)" value={form.name}
                onChange={e => setForm(f=>({...f,name:e.target.value}))} />
              <input className="input-field" placeholder="Bengali name (optional)" value={form.nameBn||''}
                onChange={e => setForm(f=>({...f,nameBn:e.target.value}))} />
              <select className="input-field" value={form.shop} onChange={e => setForm(f=>({...f,shop:e.target.value}))}>
                <option value="">Select shop…</option>
                {shops?.shops?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <select className="input-field" value={form.category} onChange={e => setForm(f=>({...f,category:e.target.value}))}>
                {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" className="input-field" placeholder="Price (৳)" value={form.price}
                  onChange={e => setForm(f=>({...f,price:+e.target.value}))} />
                <input className="input-field" placeholder="Unit (kg, pcs, litre)" value={form.unit}
                  onChange={e => setForm(f=>({...f,unit:e.target.value}))} />
              </div>
              <input className="input-field" placeholder="Unit value display (e.g. 500 gm)" value={form.unitValue||''}
                onChange={e => setForm(f=>({...f,unitValue:e.target.value}))} />
              <input type="number" className="input-field" placeholder="Stock" value={form.stock}
                onChange={e => setForm(f=>({...f,stock:+e.target.value}))} />
              <textarea rows={2} className="input-field resize-none" placeholder="Description (optional)" value={form.description||''}
                onChange={e => setForm(f=>({...f,description:e.target.value}))} />

              {/* Image upload */}
              <div>
                <input type="file" accept="image/*" ref={fileRef} className="hidden"
                  onChange={e => setImgFile(e.target.files[0])} />
                <button type="button" onClick={() => fileRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 flex items-center justify-center gap-2 text-gray-500 hover:border-primary hover:text-primary transition">
                  <Upload size={16} />
                  {imgFile ? imgFile.name : 'Upload Image'}
                </button>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured||false}
                  onChange={e => setForm(f=>({...f,isFeatured:e.target.checked}))}
                  className="w-4 h-4 accent-primary" />
                Show in Featured / Homepage
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => saveMut.mutate(form)} disabled={uploading || saveMut.isLoading}
                className="flex-1 btn-primary text-center">
                {uploading ? 'Uploading…' : saveMut.isLoading ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 btn-outline text-center">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
