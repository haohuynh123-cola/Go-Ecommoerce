# Ecomm Web

React/TypeScript storefront + admin panel for the Go/Gin e-commerce backend.

## Quick start

```bash
cd web

# Copy env file and adjust if needed
cp .env.example .env

# Install dependencies
npm install        # or: pnpm install / yarn install

# Start dev server (http://localhost:5173)
npm run dev
```

The backend must be running at the URL set in `.env`. Default: `http://localhost:8080/api/v1`.

## Available scripts

| Script | Description |
|--------|-------------|
| `dev` | Vite dev server with HMR |
| `build` | Type-check + production build to `dist/` |
| `preview` | Serve the production build locally |
| `lint` | ESLint |
| `typecheck` | `tsc --noEmit` |

## Auth header — important

The Go backend reads a **raw JWT** from the `Authorization` header, not the
standard `Bearer <token>` format:

```
Authorization: <jwt-token>
```

The Axios interceptor in `src/lib/api/client.ts` sets the header this way.
Do not add a `Bearer ` prefix.

## Known backend limitations surfaced in the UI

| Limitation | Where it appears | What the UI does |
|------------|------------------|------------------|
| `DELETE /cart/remove` is registered but unimplemented | `src/lib/api/cart.ts` | Uses `PUT /cart/update` with `quantity: 0` instead. Comment in source explains why. |
| `GET /orders/` returns only the current user's orders (no global admin view) | Admin Orders page | Honest banner tells the user. `src/pages/admin/AdminOrdersPage.tsx` has a TODO. |
| No role system on the backend | Admin panel | Any authenticated user can access `/admin`. `AdminLoginPage.tsx` has a TODO. |

## Structure

```
src/
  components/
    admin/          ProductFormModal
    auth/           AuthBootstrap, RequireAuth
    layout/         Header, StorefrontLayout, AdminLayout
    ui/             Button, FormField, Badge, Pagination, ...
  hooks/            useAuth, useDebounce
  lib/
    api/            client, auth, products, cart, orders, types
    auth/           tokenStore
    utils/          format
  pages/
    admin/          Dashboard, Products, Orders, Login
    storefront/     Products, ProductDetail, Cart, Orders, OrderDetail, Login, Register
  stores/           authStore (Zustand)
  styles/           tokens.css, global.css
  main.tsx
  router.tsx
```
