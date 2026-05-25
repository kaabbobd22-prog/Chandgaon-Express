import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import useCartStore from '../../context/cartStore';
import { formatCurrency } from '../../utils/helpers';

export default function ProductCard({ product, shopId, horizontal }) {
  const navigate = useNavigate();
  const { items, addItem, removeItem } = useCartStore();
  const cartItem = items.find(i => i.product === product._id);
  const qty = cartItem?.quantity || 0;
  const sid = shopId || product.shop?._id || product.shop;

  if (horizontal) {
    return (
      <div className="flex-shrink-0 w-36 bg-white rounded-2xl shadow-card overflow-hidden active:scale-95 transition-transform">
        <div className="h-24 bg-gray-50 flex items-center justify-center cursor-pointer"
          onClick={() => navigate(`/products/${product._id}`)}>
          {product.image
            ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            : <span className="text-4xl">🛒</span>}
        </div>
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{product.name}</p>
          {product.unitValue && <p className="text-gray-400 text-[10px] mt-0.5">{product.unitValue}</p>}
          <p className="text-primary font-bold text-sm mt-1">{formatCurrency(product.price)}</p>
          <div className="mt-2 flex justify-end">
            {qty === 0
              ? <button onClick={() => addItem(product, sid)}
                  className="w-6 h-6 bg-primary-50 text-primary rounded-lg flex items-center justify-center active:scale-90 transition">
                  <Plus size={14} />
                </button>
              : <div className="flex items-center gap-1">
                  <button onClick={() => removeItem(product._id)}
                    className="w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center">
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-primary w-4 text-center">{qty}</span>
                  <button onClick={() => addItem(product, sid)}
                    className="w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center">
                    <Plus size={12} />
                  </button>
                </div>
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="h-32 bg-gray-50 flex items-center justify-center cursor-pointer"
        onClick={() => navigate(`/products/${product._id}`)}>
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          : <span className="text-5xl">🛒</span>}
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 cursor-pointer"
          onClick={() => navigate(`/products/${product._id}`)}>
          {product.name}
        </p>
        {product.shop?.name && <p className="text-gray-400 text-[11px] mt-0.5">{product.shop.name}</p>}
        {product.unitValue  && <p className="text-gray-400 text-[11px]">{product.unitValue}</p>}
        <div className="flex items-center justify-between mt-2">
          <p className="text-primary font-bold text-sm">{formatCurrency(product.price)}</p>
          {qty === 0
            ? <button onClick={() => addItem(product, sid)}
                className="w-7 h-7 bg-primary-50 border border-primary-100 text-primary rounded-xl flex items-center justify-center active:scale-90 transition">
                <Plus size={15} />
              </button>
            : <div className="flex items-center gap-1.5">
                <button onClick={() => removeItem(product._id)}
                  className="w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center">
                  <Minus size={13} />
                </button>
                <span className="text-sm font-bold text-primary w-5 text-center">{qty}</span>
                <button onClick={() => addItem(product, sid)}
                  className="w-7 h-7 bg-primary text-white rounded-xl flex items-center justify-center">
                  <Plus size={13} />
                </button>
              </div>
          }
        </div>
      </div>
    </div>
  );
}
