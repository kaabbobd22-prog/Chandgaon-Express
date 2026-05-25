import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ProductCard from '../../components/customer/ProductCard';

const CATS = [
  { slug: '', label: 'All' },
  { slug: 'vegetable', label: 'Vegetable' },
  { slug: 'meat',      label: 'Meat' },
  { slug: 'fruits',    label: 'Fruits' },
  { slug: 'bakery',    label: 'Bakery' },
  { slug: 'dairy',     label: 'Dairy' },
  { slug: 'snacks',    label: 'Snacks' },
  { slug: 'grocery',   label: 'Grocery' },
  { slug: 'pharmacy',  label: 'Medicine' },
];

export default function ProductsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch]   = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [query, setQuery]     = useState(params.get('search') || '');

  const { data, isLoading } = useQuery(
    ['products', category, query],
    () => api.get(`/products?${category ? `category=${category}&` : ''}${query ? `search=${query}&` : ''}limit=50`)
  );

  const handleSearch = (e) => { e.preventDefault(); setQuery(search); };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-primary pt-10 pb-14 px-5">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">
            {category ? CATS.find(c => c.slug === category)?.label || 'Products' : 'All Products'}
          </h1>
        </div>
        <form onSubmit={handleSearch} className="flex items-center bg-white rounded-2xl px-4 py-3 gap-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent"
            placeholder='Search products…' value={search}
            onChange={e => setSearch(e.target.value)} />
        </form>
      </div>

      <div className="bg-surface -mt-6 rounded-t-3xl px-5 pt-5">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
          {CATS.map(c => (
            <button key={c.slug} onClick={() => setCategory(c.slug)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition
                ${category === c.slug
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-semibold">No products found</p>
            <p className="text-sm mt-1">Try a different category or search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-6">
            {data?.products?.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
