import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { ArrowLeft, Heart, Star, ShoppingCart, Plus, Minus, Truck } from 'lucide-react';
import api from '../../utils/api';
import useCartStore from '../../context/cartStore';
import { formatCurrency } from '../../utils/helpers';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(['product', id], () => api.get(`/products/${id}`));
  const { items, addItem, removeItem } = useCartStore();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const product = data?.product;
  if (!product) return null;

  const cartItem = items.find(i => i.product === product._id);
  const qty = cartItem?.quantity || 0;
  const shopId = product.shop?._id || product.shop;

  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <div className="bg-primary pt-10 px-5 pb-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <ArrowLeft size={18} className="text-white" />
        </button>
        <h1 className="text-white font-bold">Product Details</h1>
        <button className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
          <ShoppingCart size={18} className="text-white" />
        </button>
      </div>

      {/* Product image */}
      <div className="bg-white mx-4 -mt-1 rounded-3xl overflow-hidden shadow-card mb-4">
        <div className="h-56 bg-gray-50 flex items-center justify-center relative">
          {product.image
            ? <img src={product.image} alt={product.name} className="w-full h-full object-contain p-4" />
            : <span className="text-8xl">🛒</span>}
          <button className="absolute top-4 right-4 w-9 h-9 bg-white rounded-xl shadow flex items-center justify-center">
            <Heart size={18} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 pb-28">
        <h2 className="text-xl font-bold text-gray-800">{product.name}</h2>
        {product.unitValue && <p className="text-gray-500 text-sm mt-0.5">{product.unitValue}</p>}

        <div className="flex items-center gap-3 mt-2">
          <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-yellow-700">{product.rating} Rating</span>
            </div>
          )}
        </div>

        {/* Fast delivery badge */}
        <div className="flex items-center gap-2 mt-3 bg-primary-50 rounded-xl p-3">
          <Truck size={16} className="text-primary" />
          <span className="text-primary text-xs font-semibold">Available for fast delivery · Cash on Delivery</span>
        </div>

        {/* Shop */}
        {product.shop?.name && (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-card">
            <p className="text-xs text-gray-400 font-semibold mb-1">FROM</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">🏪</div>
              <div>
                <p className="font-semibold text-gray-800">{product.shop.name}</p>
                <p className="text-gray-400 text-xs capitalize">{product.shop.category}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-card">
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white px-5 py-4 shadow-bottom flex items-center gap-3">
        {qty === 0 ? (
          <button onClick={() => addItem(product, shopId)} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        ) : (
          <>
            <div className="flex items-center gap-3 bg-primary-50 rounded-2xl px-4 py-2">
              <button onClick={() => removeItem(product._id)} className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center">
                <Minus size={14} />
              </button>
              <span className="font-bold text-primary text-lg w-6 text-center">{qty}</span>
              <button onClick={() => addItem(product, shopId)} className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center">
                <Plus size={14} />
              </button>
            </div>
            <button onClick={() => navigate('/cart')} className="flex-1 btn-primary text-center">
              View Cart · {formatCurrency(product.price * qty)}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
