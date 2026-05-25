import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Grid, Heart, Package } from 'lucide-react';
import useCartStore from '../../context/cartStore';

const navItems = [
  { to: '/',        icon: Home,    label: 'Home'    },
  { to: '/products',icon: Grid,    label: 'Shop'    },
  { to: '/orders',  icon: Package, label: 'Orders'  },
  { to: '/profile', icon: Heart,   label: 'Profile' },
];

export default function CustomerLayout() {
  const totalItems = useCartStore(s => s.getTotalItems());

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-surface">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white shadow-bottom z-40">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition
                 ${isActive ? 'text-primary' : 'text-gray-400'}`
              }>
              <Icon size={22} />
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          ))}

          {/* Cart icon with badge */}
          <NavLink to="/cart"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition relative
               ${isActive ? 'text-primary' : 'text-gray-400'}`
            }>
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">Cart</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
