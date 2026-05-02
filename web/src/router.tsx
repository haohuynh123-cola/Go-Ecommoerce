import { createBrowserRouter } from 'react-router-dom';

import { StorefrontLayout } from '@/components/layout/StorefrontLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Storefront pages
import { ProductsPage } from '@/pages/storefront/ProductsPage';
import { ProductDetailPage } from '@/pages/storefront/ProductDetailPage';
import { LoginPage } from '@/pages/storefront/LoginPage';
import { RegisterPage } from '@/pages/storefront/RegisterPage';
import { CartPage } from '@/pages/storefront/CartPage';
import { OrdersPage } from '@/pages/storefront/OrdersPage';
import { OrderDetailPage } from '@/pages/storefront/OrderDetailPage';
import { HistoryViewedPage } from '@/pages/storefront/HistoryViewedPage';

// Admin pages
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import { AdminProductCreatePage } from '@/pages/admin/AdminProductCreatePage';
import { AdminProductEditPage } from '@/pages/admin/AdminProductEditPage';
import { AdminOrdersPage } from '@/pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from '@/pages/admin/AdminOrderDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StorefrontLayout />,
    children: [
      { index: true, element: <ProductsPage /> },
      { path: 'products/:id', element: <ProductDetailPage /> },
      { path: 'history', element: <HistoryViewedPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'cart',
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        ),
      },
    ],
  },

  // ─── Admin ─────────────────────────────────────────────────
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin',
    element: (
      <RequireAuth redirectTo="/admin/login">
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'products/new', element: <AdminProductCreatePage /> },
      { path: 'products/:id/edit', element: <AdminProductEditPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'orders/:id', element: <AdminOrderDetailPage /> },
    ],
  },
]);
