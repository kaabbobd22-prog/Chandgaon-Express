import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, DollarSign } from 'lucide-react';

export default function DeliveryLayout() {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-surface">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white shadow-bottom z-40">
        <div className="flex items-center justify-around py-2">
          {[
            { to: '/delivery',          icon: Home,       label: 'Orders', end: true },
            { to: '/delivery/earnings', icon: DollarSign, label: 'Earnings' },
          ].map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-8 py-1 rounded-xl
                 ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              <Icon size={22} />
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
