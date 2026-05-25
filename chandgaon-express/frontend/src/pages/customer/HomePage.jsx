import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, MapPin, Bell, ChevronRight } from 'lucide-react';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import ProductCard from '../../components/customer/ProductCard';

const CATEGORIES = [
  { slug: 'vegetable', label: 'Vegetable', icon: '🥦', sub: 'Fresh & Local' },
  { slug: 'meat',      label: 'Meat',      icon: '🥩', sub: 'Frozen & Fresh' },
  { slug: 'fruits',    label: 'Fruits',    icon: '🍎', sub: 'Seasonal' },
  { slug: 'bakery',    label: 'Bakery',    icon: '🍞', sub: 'Daily Baked' },
  { slug: 'dairy',     label: 'Dairy',     icon: '🥛', sub: 'In Store' },
  { slug: 'snacks',    label: 'Snacks',    icon: '🍟', sub: 'Evening Snacks' },
  { slug: 'grocery',   label: 'Grocery',   icon: '🛒', sub: 'Daily Needs' },
  { slug: 'pharmacy',  label: 'Medicine',  icon: '💊', sub: 'Pharmacy' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  const { data: featured } = useQuery('featured', () => api.get('/products?featured=true&limit=6'));
  const { data: shops }    = useQuery('shops',    () => api.get('/shops'));

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-full">
      {/* Green Header */}
      <div className="bg-primary pt-10 pb-16 px-5 relative">
        {/* Top row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1 text-primary-100 text-xs">
              <MapPin size={12} />
              <span>Current Location</span>
            </div>
            <p className="text-white font-semibold text-sm mt-0.5">Chandgaon, Chittagong</p>
          </div>
          <button onClick={() => navigate('/cart')} className="relative w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Bell size={18} className="text-white" />
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl px-4 py-3 gap-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder='Search for "Grocery"' value={search}
            onChange={e => setSearch(e.target.value)} />
        </form>
      </div>

      {/* White curved body */}
      <div className="bg-surface -mt-6 rounded-t-3xl min-h-full">
        <div className="px-5 pt-5">

          {/* Promo banner */}
          <div className="bg-accent rounded-2xl p-4 mb-6 text-white flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Free delivery this week! 🎉</p>
              <p className="text-xs text-orange-100 mt-0.5">On your first 3 orders · No min. order</p>
            </div>
            <div className="text-2xl">🛵</div>
          </div>

          {/* Categories */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-base">All Categories</h2>
            <button onClick={() => navigate('/products')} className="text-primary text-xs font-semibold flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {CATEGORIES.map(cat => (
              <button key={cat.slug}
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-card active:scale-95 transition-transform">
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">{cat.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{cat.sub}</p>
                </div>
                <span className="text-3xl">{cat.icon}</span>
              </button>
            ))}
          </div>

          {/* You might need */}
          {featured?.products?.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-800 text-base">You might need</h2>
                <button onClick={() => navigate('/products')} className="text-primary text-xs font-semibold">See more</button>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {featured.products.map(p => (
                  <ProductCard key={p._id} product={p} horizontal />
                ))}
              </div>
            </div>
          )}

          {/* Shops */}
          {shops?.shops?.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold text-gray-800 text-base mb-3">Nearby Shops</h2>
              <div className="grid grid-cols-2 gap-3">
                {shops.shops.slice(0, 4).map(s => (
                  <button key={s._id}
                    onClick={() => navigate(`/products?shop=${s._id}`)}
                    className="bg-white rounded-2xl p-4 shadow-card text-left active:scale-95 transition-transform">
                    <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl mb-2">🏪</div>
                    <p className="font-semibold text-gray-800 text-sm leading-tight">{s.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5 capitalize">{s.category}</p>
                    <p className="text-primary text-xs font-semibold mt-1">Free delivery</p>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
