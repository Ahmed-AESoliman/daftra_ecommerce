import Loader from '@/components/ui/loader.jsx';
import AuthProvider from '@/contexts/auth-context.jsx';
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';
import { CartProvider } from '@/contexts/cart-context';
import { ModalProvider } from '@/contexts/modal-context.jsx';
import { ThemeProvider } from '@/contexts/theme-context.jsx';

import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import 'react-range-slider-input/dist/style.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import ServerErrorBoundary from './pages/errors/ServerErrorBoundary.jsx';
import AdminRoutes from './routes/admin/admin-routes.jsx';
import UserRoutes from './routes/user/user-routes.jsx';

const router = createBrowserRouter([AdminRoutes, UserRoutes]);

const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    <ModalProvider>
                        <Suspense fallback={<Loader isLoading size={50} className={''} />}>
                            <BreadcrumbProvider>
                                <RouterProvider router={router} />
                            </BreadcrumbProvider>
                        </Suspense>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                style: {
                                    border: '1px solid #262626',
                                    backdropFilter: 'blur(8px)',
                                    backgroundColor: 'rgb(0 0 0 / 60%)',
                                    fontSize: '12px',
                                    color: 'white',
                                },
                            }}
                        />
                    </ModalProvider>
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

const el = document.getElementById('app');
if (el) {
    const root = createRoot(el);
    const errorCode = el.dataset.errorCode;
    const errorMessage = el.dataset.errorMessage;
    const errorTitle = el.dataset.errorTitle;

    if (errorCode) {
        root.render(<ServerErrorBoundary code={errorCode} message={errorMessage} title={errorTitle} />);
    } else {
        root.render(<App />);
    }
}

// Initialize theme
initializeTheme();
