import { useAuth } from '@/contexts/auth-context';
import { Navigate, useLocation } from 'react-router-dom';
import { useCookies } from '@/hooks/use-cookies';
import { LoaderCircle } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * RequireAuth component - protects routes that require authentication
 * This component ensures that only authenticated users can access protected routes
 * Non-authenticated users are redirected to the login page
 */
const RequireAuth = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const { getCookie } = useCookies();
    const location = useLocation();

    // Show loading while checking authentication
    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if user has a token but not yet loaded user data
    const hasToken = getCookie('accessToken');
    
    // If user is not authenticated and has no token, redirect to login
    if (!isAuthenticated() && !hasToken) {
        return <Navigate to="/admin/auth/login" state={{ from: location }} replace />;
    }

    // If has token but not authenticated yet, show loading (user data is still being fetched)
    if (hasToken && !isAuthenticated()) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-4">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Authenticating...</p>
                </div>
            </div>
        );
    }

    // If authenticated, allow access to protected routes
    return children;
};

RequireAuth.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RequireAuth;