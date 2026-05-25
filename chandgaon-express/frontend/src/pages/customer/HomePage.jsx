import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, MapPin, ShoppingBag, ChevronRight } from 'lucide-react';
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

// 🛠️ একাধিক ইন্টারেক্টিভ ব্যানারের ডেটা সোর্স
const BANNERS = [
  { id: 1, title: 'Free delivery this week! 🎉', desc: 'On your first 3 orders · No min. order', icon: '🛵', bg: 'bg-accent' },
  { id: 2, title: 'Get 20% Cash Back 💥', desc: 'Order grocery worth 500 Tk or above', icon: '🛒', bg: 'bg-emerald-600' },
  { id: 3, title: 'Fresh Vegetables Daily 🥬', desc: 'Directly sourced from local green farms', icon: '👨‍🌾', bg: 'bg-indigo-600' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);

  const { data: featured } = useQuery('featured', () => api.get('/products?featured=true&limit=6'));
  const { data: shops }    = useQuery('shops',    () => api.get('/shops'));

  // 🛠️ ব্যানারের অটো-স্ক্রোল মেকানিজম (প্রতি ৪ সেকেন্ড পর পর পরিবর্তন হবে)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-full bg-surface pb-24">
      
      {/* 🟢 কম্প্যাক্ট স্মার্ট হেডার (Extra Space Optimized) */}
      <div className="bg-primary pt-8 pb-10 px-5 relative rounded-b-[2rem] shadow-lg">
        {/* টপ রো: ব্র্যান্ড নেম, লোকেশন এবং কার্ট আইকন */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">Chandgaon Express</h1>
            <div className="flex items-center gap-1 text-primary-100 text-xs mt-0.5 opacity-90">
              <MapPin size={12} className="text-accent" />
              <span>Chandgaon, Chittagong</span>
            </div>
          </div>
          {/* বেল আইকনটি পরিবর্তন করে শপিং ব্যাগ (কার্ট) দেওয়া হলো, কারণ এটি ই-কমার্স হোমপেজে বেশি সামঞ্জস্যপূর্ণ */}
          <button onClick={() => navigate('/cart')} className="relative w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all">
            <ShoppingBag size={18} className="text-white" />
          </button>
        </div>

        {/* সার্চ বার (ক্লিন এবং মডার্ন) */}
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-md gap-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input 
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            placeholder='Search for grocery, meat, medicine...' 
            value={search}
            onChange={e => setSearch(e.target.value)} 
          />
        </form>
      </div>

      {/* ⚪ মেইন বডি কন্টেন্ট */}
      <div className="px-5 pt-5 space-y-6">

        {/* 🛠️ প্রিমিয়াম স্লাইডার ব্যেনার (Smooth Screen-Fit Carousel) */}
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}
          >
            {BANNERS.map((banner) => (
              <div key={banner.id} className={`w-full flex-shrink-0 ${banner.bg} p-5 text-white flex items-center justify-between min-h-[90px]`}>
                <div className="space-y-1">
                  <p className="font-bold text-base leading-tight">{banner.title}</p>
                  <p className="text-xs text-white/80 font-medium">{banner.desc}</p>
                </div>
                <div className="text-3xl filter drop-shadow-md">{banner.icon}</div>
              </div>
            ))}
          </div>
          
          {/* ব্যানার ডট ইন্ডিকেটর (নিচে ছোট ডটগুলো দেখাবে কোন ব্যানার একটিভ আছে) */}
          <div className="absolute bottom-2 left-5 flex gap-1.5">
            {BANNERS.map((_, index) => (
              <div 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${activeBanner === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* 🗂️ ক্যাটাগরি সেকশন */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-base">All Categories</h2>
            <button onClick={() => navigate('/products')} className="text-primary text-xs font-semibold flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(cat => (
              <button key={cat.slug}
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-card active:scale-95 transition-transform border border-gray-50">
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">{cat.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{cat.sub}</p>
                </div>
                <span className="text-3xl">{cat.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🛒 ইউ মাইট নিড (প্রোডাক্ট কালেকশন) */}
        {featured?.products?.length > 0 && (
          <div>
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

        {/* 🏪 নিয়রবাই শপ সেকশন */}
        {shops?.shops?.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 text-base mb-3">Nearby Shops</h2>
            <div className="grid grid-cols-2 gap-3">
              {shops.shops.slice(0, 4).map(s => (
                <button key={s._id}
                  onClick={() => navigate(`/products?shop=${s._id}`)}
                  className="bg-white rounded-2xl p-4 shadow-card text-left active:scale-95 transition-transform border border-gray-50">
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
  );
}