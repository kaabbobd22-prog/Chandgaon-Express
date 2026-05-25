import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Store, Package, Users, Menu, X, LogOut } from 'lucide-react';
import useAuthStore from '../../context/authStore';

const links = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/orders',   icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/shops',    icon: Store,            label: 'Shops' },
  { to: '/admin/products', icon: Package,          label: 'Products' },
  { to: '/admin/riders',   icon: Users,            label: 'Riders & COD' },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuthStore();

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-60 bg-primary flex flex-col transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-5 border-b border-primary-light">
          <p className="text-white font-bold text-lg">🛵 CE Admin</p>
          <p className="text-primary-100 text-xs">Chandgaon Express</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                 ${isActive ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`
              }>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { if(window.confirm('Log out?')) logout(); }}
          className="m-3 flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-100 hover:bg-white/10 text-sm">
          <LogOut size={18} />Log Out
        </button>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-5 py-3 flex items-center gap-3 md:hidden">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <p className="font-bold text-gray-800">CE Admin</p>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
