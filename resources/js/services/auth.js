import { apiClient } from '@/lib/axios';

/**
 * Authentication API service
 * Handles all authentication-related API calls
 */
export const authService = {
    /**
     * User login
     * @param {Object} credentials - Email and password
     * @returns {Promise} API response
     */
    login: async (credentials) => {
        const response = await apiClient.post('/admin/auth/login', credentials);
        return response.data;
    },

    /**
     * User logout
     * @returns {Promise} API response
     */
    logout: async () => {
        const response = await apiClient.post('/admin/auth/logout');
        return response.data;
    },

    /**
     * Get authenticated user
     * @returns {Promise} API response
     */
    getUser: async () => {
        const response = await apiClient.get('/admin/auth/authenticated-user');
        return response.data;
    },

    /**
     * Update user profile
     * @param {Object} profileData - User profile data
     * @returns {Promise} API response
     */
    updateProfile: async (profileData) => {
        const response = await apiClient.post('/admin/auth/update', profileData);
        return response.data;
    },

    /**
     * Update user password
     * @param {Object} passwordData - Current and new password
     * @returns {Promise} API response
     */
    updatePassword: async (passwordData) => {
        const response = await apiClient.put('/admin/auth/password', passwordData);
        return response.data;
    },

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise} API response
     */
    forgotPassword: async (email) => {
        const response = await apiClient.post('/admin/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with token
     * @param {Object} resetData - Token, email, password, password_confirmation
     * @returns {Promise} API response
     */
    resetPassword: async (resetData) => {
        const response = await apiClient.post('/admin/auth/reset-password', resetData);
        return response.data;
    },

    /**
     * Resend password reset email
     * @param {string} email - User email
     * @returns {Promise} API response
     */
    resendPasswordReset: async (email) => {
        const response = await apiClient.post('/admin/auth/resend', { email });
        return response.data;
    },

    /**
     * Verify email with token
     * @param {Object} verificationData - Verification data
     * @returns {Promise} API response
     */
    verifyEmail: async (verificationData) => {
        const response = await apiClient.post('/admin/auth/verify', verificationData);
        return response.data;
    },

    /**
     * Resend email verification
     * @param {string} email - User email
     * @returns {Promise} API response
     */
    resendEmailVerification: async (email) => {
        const response = await apiClient.post('/admin/auth/resend-verify', { email });
        return response.data;
    },
};

/**
 * Error handling helper
 * Extracts user-friendly error messages from API responses
 */
export const handleApiError = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.errorMessages) {
        const errors = error.response.data.errorMessages;
        const firstField = Object.keys(errors)[0];
        return errors[firstField]?.[0] || 'Validation error occurred';
    }

    return error.message || 'An unexpected error occurred';
};

/**
 * API response helper
 * Checks if API response indicates success
 */
export const isApiSuccess = (response) => {
    return response?.statusCode >= 200 && response?.statusCode < 300;
};

export default authService;
