# Daftra Ecommerce

A full-stack ecommerce platform built with **Laravel** (API backend) and **React** (frontend), integrated in a single repository.  
The React app is located in `resources/js/` and is built/served using Vite.

---

## Repository

https://github.com/Ahmed-AESoliman/daftra_ecommerce.git

---

## Project Structure

```
/app                # Laravel backend (models, controllers, etc.)
/config
/database           # Migrations & seeders
/public             # Public assets
/resources
  /js               # React frontend (pages, components, etc.)
  /views            # Blade views (if any)
  /css, /assets
/routes             # Laravel API and web routes
.env.example        # Environment variables template
vite.config.ts      # Vite config for React+Laravel
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Ahmed-AESoliman/daftra_ecommerce.git
cd daftra_ecommerce
```

### 2. Install backend dependencies

```bash
composer install
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Environment setup

- Copy `.env.example` to `.env` and update DB credentials, etc.
- Generate Laravel app key:
  ```bash
  php artisan key:generate
  ```

### 5. Database setup

```bash
php artisan migrate
```

### 6. Seed the database (creates default admin user and sample data)

```bash
php artisan db:seed
```

- **Default Admin Credentials:**
  - Email: `admin@dev.com`
  - Password: `password`

### 7. Run the development servers

- **Backend (Laravel API):**
  ```bash
  php artisan serve
  ```
- **Frontend (React via Vite):**
  ```bash
  npm run dev
  ```

---

## Authentication Flow

- Uses **Laravel Sanctum** for API authentication.
- Public endpoints (product listing, categories, order creation) are available under `/api/public/...`.
- Admin endpoints (product management, order management, user profile) require authentication via Sanctum tokens.
- Login via `/api/admin/auth/login` returns a token to be used in subsequent requests.

---

## API Endpoints

### Public

- `GET /api/public/products` — List all products
- `GET /api/public/products/{slug}` — Get product details
- `GET /api/public/categories` — List categories
- `POST /api/public/cart/validate-stock` — Validate cart stock
- `POST /api/public/orders` — Create order

### Admin (Authenticated)

- `POST /api/admin/auth/login` — Login
- `GET /api/admin/auth/authenticated-user` — Get current user
- `POST /api/admin/auth/logout` — Logout
- `POST /api/admin/auth/update` — Update user
- `PUT /api/admin/auth/password` — Change password

#### Product Management

- `GET /api/admin/products` — List products
- `POST /api/admin/products` — Create product
- `POST /api/admin/products/{slug}` — Update product
- `DELETE /api/admin/products/{slug}` — Delete product

#### Order Management

- `GET /api/admin/orders` — List orders
- `GET /api/admin/orders/{order_number}` — Get order details
- `PUT /api/admin/orders/{order_number}` — Update order
- `DELETE /api/admin/orders/{order_number}` — Delete order

---

## Frontend (React)

- Located in `resources/js/`
- Uses Material UI (or your chosen CSS framework) for a responsive, clean UI
- Communicates with the backend via REST API calls (no Inertia.js)
- Main structure:
  - `pages/` — Page components (e.g., Welcome, Products, Product Details)
  - `components/` — Reusable UI components
  - `layouts/` — Layout wrappers (header, sidebar, etc.)
  - `services/` — API call logic
  - `contexts/` — React context providers (e.g., Auth, Cart)
  - `utils/`, `hooks/`, `types/` — Utilities, custom hooks, TypeScript types

---

## Notes

- Make sure to run both backend and frontend servers for full functionality.
- Update `.env` for your local database and mail settings.
- For production, build the frontend with `npm run build` and serve from `public/`. 
