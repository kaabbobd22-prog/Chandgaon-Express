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

const BANNERS = [
  { id: 1, title: 'Free delivery this week! 🎉', desc: 'On your first 3 orders · No min. order',         icon: '🛵', bg: 'bg-accent' },
  { id: 2, title: 'Get 20% Cash Back 💥',         desc: 'Order grocery worth 500 Tk or above',            icon: '🛒', bg: 'bg-emerald-600' },
  { id: 3, title: 'Fresh Vegetables Daily 🥬',    desc: 'Directly sourced from local green farms',        icon: '👨‍🌾', bg: 'bg-indigo-600' },
];

// ─── Single category row ───────────────────────────────────────────────────────
function CategoryRow({ category }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['products-cat', category.slug],
    () => api.get(`/products?category=${category.slug}&limit=10`),
    { staleTime: 60000 }
  );

  const products = data?.products || [];
  if (!isLoading && products.length === 0) return null;

  return (
    <div>
      {/* Row header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <div>
            <h2 className="font-bold text-gray-800 text-sm leading-tight">{category.label}</h2>
            <p className="text-gray-400 text-[11px]">{category.sub}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/products?category=${category.slug}`)}
          className="flex items-center gap-0.5 text-primary text-xs font-semibold"
        >
          See all <ChevronRight size={13} />
        </button>
      </div>

      {/* Horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36 h-44 bg-white rounded-2xl animate-pulse" />
            ))
          : products.map(p => (
              <ProductCard key={p._id} product={p} horizontal />
            ))
        }
      </div>
    </div>
  );
}

// ─── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch]         = useState('');
  const [activeBanner, setActiveBanner] = useState(0);

  const { data: shops } = useQuery('shops', () => api.get('/shops'));

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-full bg-surface pb-24">

      {/* ── Green Header ── */}
      <div className="bg-primary pt-8 pb-10 px-5 rounded-b-[2rem] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-xl tracking-tight">Chandgaon Express</h1>
            <div className="flex items-center gap-1 text-primary-100 text-xs mt-0.5 opacity-90">
              <MapPin size={12} className="text-accent" />
              <span>Chandgaon, Chittagong</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
          >
            <ShoppingBag size={18} className="text-white" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl px-4 py-3 shadow-md gap-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
            placeholder="Search for grocery, meat, medicine..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* ── Main Body ── */}
      <div className="px-5 pt-5 space-y-7">

        {/* Banner Carousel */}
        <div className="relative overflow-hidden rounded-2xl shadow-card">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}
          >
            {BANNERS.map(banner => (
              <div
                key={banner.id}
                className={`w-full flex-shrink-0 ${banner.bg} p-5 text-white flex items-center justify-between min-h-[90px]`}
              >
                <div className="space-y-1">
                  <p className="font-bold text-base leading-tight">{banner.title}</p>
                  <p className="text-xs text-white/80 font-medium">{banner.desc}</p>
                </div>
                <div className="text-3xl filter drop-shadow-md">{banner.icon}</div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-2 left-5 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeBanner === i ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>

        {/* Categories Quick Nav (horizontal scroll) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-base">Categories</h2>
            <button onClick={() => navigate('/products')} className="text-primary text-xs font-semibold flex items-center gap-0.5">
              See all <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-2xl px-4 py-3 shadow-card active:scale-95 transition-transform border border-gray-50"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 8 Category Rows ── */}
        {CATEGORIES.map(cat => (
          <CategoryRow key={cat.slug} category={cat} />
        ))}

        {/* Nearby Shops */}
        {shops?.shops?.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 text-base mb-3">Nearby Shops</h2>
            <div className="grid grid-cols-2 gap-3">
              {shops.shops.slice(0, 4).map(s => (
                <button
                  key={s._id}
                  onClick={() => navigate(`/products?shop=${s._id}`)}
                  className="bg-white rounded-2xl p-4 shadow-card text-left active:scale-95 transition-transform border border-gray-50"
                >
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
