import Loader from '@/components/ui/loader';
import { useCookies } from '@/hooks/use-cookies';
import { authService, handleApiError, isApiSuccess } from '@/services/auth';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

export const AuthContext = createContext();

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Enhanced AuthProvider with support for multiple user types and new APIs
 */
const AuthProvider = ({ children }) => {
    const { getCookie, setCookie, removeCookie } = useCookies();
    
    const initUser = {
        id: null,
        name: '',
        email: '',
        verified: false,
        accessToken: '',
    };

    const [user, setUser] = useState(initUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Set user data and update state
     */
    const setUserData = (userData) => {
        const updatedUser = {
            ...userData,
            verified: userData.verified || false,
            accessToken: userData.accessToken || getCookie('accessToken') || '',
        };
        setUser(updatedUser);
        
        // Store access token if provided
        if (userData.accessToken) {
            setCookie('accessToken', userData.accessToken, 7); // 7 days
        }
    };

    /**
     * Clear error state
     */
    const clearError = () => {
        setError(null);
    };

    /**
     * Login function
     */
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await authService.login(credentials);
            
            if (isApiSuccess(response)) {
                setUserData(response.data);
                return { success: true, data: response.data };
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout function
     */
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local state regardless of API call success
            removeCookie('accessToken');
            setUser(initUser);
        }
    };

    /**
     * Get authenticated user data
     */
    const getUser = async () => {
        const token = getCookie('accessToken');

        if (!token) {
            setUser(initUser);
            setLoading(false);
            return;
        }

        try {
            const response = await authService.getUser();
            
            if (isApiSuccess(response)) {
                setUserData(response.data);
            } else {
                throw new Error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Get user error:', error);
            await logout();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Update user profile
     */
    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await authService.updateProfile(profileData);
            
            if (isApiSuccess(response)) {
                // Refresh user data after successful update
                await getUser();
                return { success: true, message: response.message };
            } else {
                throw new Error(response.message || 'Profile update failed');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Update user password
     */
    const updatePassword = async (passwordData) => {
        try {
            setError(null);
            const response = await authService.updatePassword(passwordData);
            
            if (isApiSuccess(response)) {
                return { success: true, message: response.message };
            } else {
                throw new Error(response.message || 'Password update failed');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Request password reset
     */
    const forgotPassword = async (email) => {
        try {
            setError(null);
            const response = await authService.forgotPassword(email);
            
            if (isApiSuccess(response)) {
                return { success: true, message: response.message };
            } else {
                throw new Error(response.message || 'Password reset request failed');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Reset password with token
     */
    const resetPassword = async (resetData) => {
        try {
            setError(null);
            const response = await authService.resetPassword(resetData);
            
            if (isApiSuccess(response)) {
                return { success: true, message: response.message };
            } else {
                throw new Error(response.message || 'Password reset failed');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Resend email verification
     */
    const resendEmailVerification = async () => {
        try {
            setError(null);
            const response = await authService.resendEmailVerification(user.email);
            
            if (isApiSuccess(response)) {
                return { success: true, message: response.message };
            } else {
                throw new Error(response.message || 'Failed to resend verification email');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    /**
     * Check if user is authenticated
     */
    const isAuthenticated = () => {
        const token = user.accessToken || getCookie('accessToken');
        return !!token && !!user.id;
    };

    /**
     * Check if user email is verified
     */
    const isEmailVerified = () => {
        return user.verified;
    };

    // Initialize user on mount
    useEffect(() => {
        getUser();
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        setUserData,
        clearError,
        login,
        logout,
        getUser,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        isAuthenticated,
        isEmailVerified,
    }), [user, loading, error]);

    // Show loading spinner while fetching user data
    if (loading) {
        return <Loader isLoading={true} />;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;