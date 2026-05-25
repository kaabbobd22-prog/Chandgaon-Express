import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';

// Auth
import LoginPage      from './pages/auth/LoginPage';
import OTPPage        from './pages/auth/OTPPage';
import SetupProfile   from './pages/auth/SetupProfile';

// Customer
import CustomerLayout from './components/customer/CustomerLayout';
import HomePage       from './pages/customer/HomePage';
import ProductsPage   from './pages/customer/ProductsPage';
import ProductDetail  from './pages/customer/ProductDetail';
import CartPage       from './pages/customer/CartPage';
import CheckoutPage   from './pages/customer/CheckoutPage';
import OrderTracking  from './pages/customer/OrderTracking';
import ProfilePage    from './pages/customer/ProfilePage';
import OrdersPage     from './pages/customer/OrdersPage';

// Admin
import AdminLayout    from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders    from './pages/admin/AdminOrders';
import AdminShops     from './pages/admin/AdminShops';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminRiders    from './pages/admin/AdminRiders';

// Delivery
import DeliveryLayout from './components/delivery/DeliveryLayout';
import DeliveryHome   from './pages/delivery/DeliveryHome';
import DeliveryEarnings from './pages/delivery/DeliveryEarnings';

const PrivateRoute = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/otp"     element={<OTPPage />} />
      <Route path="/setup"   element={<PrivateRoute><SetupProfile /></PrivateRoute>} />

      {/* Customer */}
      <Route path="/" element={<CustomerLayout />}>
        <Route index                   element={<HomePage />} />
        <Route path="products"         element={<ProductsPage />} />
        <Route path="products/:id"     element={<ProductDetail />} />
        <Route path="cart"             element={<PrivateRoute><CartPage /></PrivateRoute>} />
        <Route path="checkout"         element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
        <Route path="track/:id"        element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
        <Route path="orders"           element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
        <Route path="profile"          element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
        <Route index                   element={<AdminDashboard />} />
        <Route path="orders"           element={<AdminOrders />} />
        <Route path="shops"            element={<AdminShops />} />
        <Route path="products"         element={<AdminProducts />} />
        <Route path="riders"           element={<AdminRiders />} />
      </Route>

      {/* Delivery */}
      <Route path="/delivery" element={<PrivateRoute roles={['rider']}><DeliveryLayout /></PrivateRoute>}>
        <Route index                   element={<DeliveryHome />} />
        <Route path="earnings"         element={<DeliveryEarnings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
