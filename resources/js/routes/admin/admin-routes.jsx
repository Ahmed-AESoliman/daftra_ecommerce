import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import AuthProtection from '../route-protection/auth-protection';
import RequireAuth from '../route-protection/require-auth';

// Admin components
const AdminAuth = lazy(() => import('@/pages/auth/admin-auth'));
const AdminLogin = lazy(() => import('@/pages/auth/admin-login'));
const AdminForgotPassword = lazy(() => import('@/pages/auth/forgot-password'));
const AdminResetPassword = lazy(() => import('@/pages/auth/reset-password'));
const PanelLayout = lazy(() => import('@/layouts/panel-layout'));
const AdminDashboard = lazy(() => import('@/pages/dashboard'));

// Product components
const Product = lazy(() => import('@/pages/panel/product/product'));
const ProductTable = lazy(() => import('@/pages/panel/product/product-table'));
const ProductDetails = lazy(() => import('@/pages/panel/product/product-details'));
const CreateOrUpdateProduct = lazy(() => import('@/pages/panel/product/create-or-update-product'));

// Order components
const Order = lazy(() => import('@/pages/panel/order/order'));
const OrderTable = lazy(() => import('@/pages/panel/order/order-table'));
const OrderDetails = lazy(() => import('@/pages/panel/order/order-details'));

const AdminRoutes = {
    path: '/admin',
    children: [
        {
            path: 'auth',
            element: (
                <AuthProtection>
                    <AdminAuth />
                </AuthProtection>
            ),
            children: [
                { index: true, element: <Navigate to="login" /> },
                {
                    path: 'login',
                    element: <AdminLogin />,
                },
                {
                    path: 'forgot-password',
                    element: <AdminForgotPassword />,
                },
                {
                    path: 'reset-password',
                    element: <AdminResetPassword />,
                },
            ],
        },

        {
            path: '',
            element: (
                <RequireAuth>
                    <PanelLayout />
                </RequireAuth>
            ),

            children: [
                { index: true, element: <Navigate to="/admin/dashboard" replace /> },
                {
                    path: 'dashboard',
                    element: <AdminDashboard />,
                    handle: {
                        breadcrumb: () => ({ title: 'Dashboard', href: '/admin/dashboard' }),
                    },
                },
                {
                    path: 'products',
                    element: <Product />,
                    handle: {
                        breadcrumb: () => ({ title: 'Products', href: '/admin/products' }),
                    },
                    children: [
                        {
                            index: true,
                            element: <ProductTable />,
                        },
                        {
                            path: 'create',
                            element: <CreateOrUpdateProduct type="create" />,
                            handle: {
                                breadcrumb: () => ({ title: 'Create Product', href: '' }),
                            },
                        },
                        {
                            path: ':slug',
                            element: <ProductDetails />,
                            handle: {
                                breadcrumb: () => ({ title: 'dynamic', href: '/admin/products' }),
                            },
                        },
                        {
                            path: ':slug/edit',
                            element: <CreateOrUpdateProduct type="edit" />,
                            handle: {
                                breadcrumb: () => ({ title: 'Edit', href: '' }),
                            },
                        },
                    ],
                },
                {
                    path: 'orders',
                    element: <Order />,
                    handle: {
                        breadcrumb: () => ({ title: 'Orders', href: '/admin/orders' }),
                    },
                    children: [
                        {
                            index: true,
                            element: <OrderTable />,
                        },
                        {
                            path: ':orderNumber',
                            element: <OrderDetails />,
                            handle: {
                                breadcrumb: () => ({ title: 'dynamic', href: '/admin/orders' }),
                            },
                        },
                    ],
                },
            ],
        },
    ],
};

export default AdminRoutes;
