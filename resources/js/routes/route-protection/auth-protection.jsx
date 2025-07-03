import { useAuth } from '@/contexts/auth-context';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

/**
 * AuthProtection component - redirects authenticated users away from auth pages
 * This component protects auth pages (login, register, etc.) from being accessed
 * by users who are already authenticated
 */
const AuthProtection = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading while checking authentication
    if (loading) {
        return <Loader isLoading={true} />;
    }

    // If user is authenticated, redirect them to appropriate dashboard
    if (isAuthenticated()) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // If not authenticated, allow access to auth pages
    return children;
};

AuthProtection.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthProtection;
