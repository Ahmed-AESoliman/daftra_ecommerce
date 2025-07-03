import ErrorBoundary from '@/pages/errors/ErrorBoundary';
import { lazy } from 'react';

// Public pages
const Welcome = lazy(() => import('@/pages/welcome'));
const ProductsPage = lazy(() => import('@/pages/products-page'));
const CartPage = lazy(() => import('@/pages/cart-page'));

const UserRoutes = {
    path: '/',
    errorElement: <ErrorBoundary />,
    children: [
        {
            path: '/',
            element: <Welcome />,
        },
        {
            path: '/products',
            element: <ProductsPage />,
        },
        {
            path: '/products/:categorySlug',
            element: <ProductsPage />,
        },
        {
            path: '/cart',
            element: <CartPage />,
        },
    ],
};

export default UserRoutes;
