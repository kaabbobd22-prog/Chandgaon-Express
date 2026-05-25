import { create } from 'zustand';
import { calcDeliveryFee } from '../utils/helpers';

const useCartStore = create((set, get) => ({
  items: [],
  shopId: null,

  addItem: (product, shopId) => {
    const { items, shopId: currentShop } = get();
    if (currentShop && currentShop !== shopId) {
      // New shop — confirm clear
      if (!window.confirm('Adding from a different shop will clear your cart. Continue?')) return;
      set({ items: [], shopId: null });
    }
    const existing = items.find(i => i.product === product._id);
    if (existing) {
      set({ items: items.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({
        items: [...items, { product: product._id, name: product.name, image: product.image, price: product.price, unit: product.unit, quantity: 1 }],
        shopId,
      });
    }
  },

  removeItem: (productId) => {
    const { items } = get();
    const updated = items.map(i => i.product === productId ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0);
    set({ items: updated, shopId: updated.length ? get().shopId : null });
  },

  deleteItem: (productId) => {
    const updated = get().items.filter(i => i.product !== productId);
    set({ items: updated, shopId: updated.length ? get().shopId : null });
  },

  clearCart: () => set({ items: [], shopId: null }),

  getSubtotal:     () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
  getDeliveryFee:  () => calcDeliveryFee(get().items),
  getTotal:        () => get().getSubtotal() + get().getDeliveryFee(),
  getTotalItems:   () => get().items.reduce((s, i) => s + i.quantity, 0),
}));

export default useCartStore;
