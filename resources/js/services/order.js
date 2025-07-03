import { apiClient } from '@/lib/axios';

/**
 * Order API service
 * Handles all order-related API calls (excluding create and update)
 */
export const orderService = {
    /**
     * Get paginated list of orders
     * @param {Object} params - Query parameters (page, per_page, search, status, etc.)
     * @returns {Promise} API response
     */
    getOrders: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });

        const response = await apiClient.get(`/admin/orders?${queryParams}`);
        return response.data;
    },

    /**
     * Get a specific order by order number
     * @param {string} orderNumber - Order number
     * @returns {Promise} API response
     */
    getOrder: async (orderNumber) => {
        const response = await apiClient.get(`/admin/orders/${orderNumber}`);
        return response.data;
    },

    /**
     * Update order status
     * @param {string} orderNumber - Order number
     * @param {string} status - New status (pending, processing, shipped, delivered, cancelled)
     * @returns {Promise} API response
     */
    updateOrderStatus: async (orderNumber, status) => {
        const response = await apiClient.put(`/admin/orders/${orderNumber}`, { status });
        return response.data;
    },

    /**
     * Delete an order
     * @param {string} orderNumber - Order number
     * @returns {Promise} API response
     */
    deleteOrder: async (orderNumber) => {
        const response = await apiClient.delete(`/admin/orders/${orderNumber}`);
        return response.data;
    },

    /**
     * Search orders
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise} API response
     */
    searchOrders: async (query, filters = {}) => {
        const params = {
            search: query,
            ...filters
        };
        return orderService.getOrders(params);
    },

    /**
     * Get orders by status
     * @param {string} status - Order status (pending, processing, shipped, delivered, cancelled)
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getOrdersByStatus: async (status, params = {}) => {
        const searchParams = {
            status: status,
            ...params
        };
        return orderService.getOrders(searchParams);
    },

    /**
     * Filter orders by date range
     * @param {string} dateFrom - Start date (YYYY-MM-DD)
     * @param {string} dateTo - End date (YYYY-MM-DD)
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    filterByDateRange: async (dateFrom, dateTo, params = {}) => {
        const searchParams = {
            date_from: dateFrom,
            date_to: dateTo,
            ...params
        };
        return orderService.getOrders(searchParams);
    },

    /**
     * Filter orders by amount range
     * @param {number} minAmount - Minimum amount
     * @param {number} maxAmount - Maximum amount
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    filterByAmountRange: async (minAmount, maxAmount, params = {}) => {
        const searchParams = {
            min_amount: minAmount,
            max_amount: maxAmount,
            ...params
        };
        return orderService.getOrders(searchParams);
    },

    /**
     * Get orders with pagination and sorting
     * @param {number} page - Page number
     * @param {number} perPage - Items per page
     * @param {string} sortBy - Sort field (created_at, order_number, status, total_amount)
     * @param {string} sortOrder - Sort order (asc, desc)
     * @param {Object} filters - Additional filters
     * @returns {Promise} API response
     */
    getOrdersPaginated: async (page = 1, perPage = 15, sortBy = 'created_at', sortOrder = 'desc', filters = {}) => {
        const params = {
            page,
            per_page: perPage,
            sort_by: sortBy,
            sort_order: sortOrder,
            ...filters
        };
        return orderService.getOrders(params);
    },

    /**
     * Get pending orders (orders that can be cancelled/deleted)
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getPendingOrders: async (params = {}) => {
        return orderService.getOrdersByStatus('pending', params);
    },

    /**
     * Get shipped orders
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getShippedOrders: async (params = {}) => {
        return orderService.getOrdersByStatus('shipped', params);
    },

    /**
     * Get delivered orders
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getDeliveredOrders: async (params = {}) => {
        return orderService.getOrdersByStatus('delivered', params);
    },

    /**
     * Get orders by customer
     * @param {string} customerEmail - Customer email
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getOrdersByCustomer: async (customerEmail, params = {}) => {
        const searchParams = {
            search: customerEmail,
            ...params
        };
        return orderService.getOrders(searchParams);
    },

    /**
     * Get recent orders (last 30 days)
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getRecentOrders: async (params = {}) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const searchParams = {
            date_from: thirtyDaysAgo.toISOString().split('T')[0],
            ...params
        };
        return orderService.getOrders(searchParams);
    },
};

/**
 * Order-specific error handling helper
 * Extracts user-friendly error messages from order API responses
 */
export const handleOrderApiError = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.errorMessages) {
        const errors = error.response.data.errorMessages;
        
        // Handle common order validation errors
        if (errors.order_number) {
            return `Order number: ${errors.order_number[0]}`;
        }
        if (errors.status) {
            return `Status: ${errors.status[0]}`;
        }
        if (errors.customer) {
            return `Customer: ${errors.customer[0]}`;
        }
        if (errors.total_amount) {
            return `Total amount: ${errors.total_amount[0]}`;
        }
        
        // Fallback to first error
        const firstField = Object.keys(errors)[0];
        return errors[firstField]?.[0] || 'Validation error occurred';
    }

    return error.message || 'An unexpected error occurred';
};

/**
 * Order API response helper
 * Checks if order API response indicates success
 */
export const isOrderApiSuccess = (response) => {
    return response?.statusCode >= 200 && response?.statusCode < 300;
};

/**
 * Format order status for display
 * @param {string} status - Order status
 * @returns {string} Formatted status
 */
export const formatOrderStatus = (status) => {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
};

/**
 * Get status color class
 * @param {string} status - Order status
 * @returns {string} CSS class for status styling
 */
export const getStatusColor = (status) => {
    const colorMap = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'processing': 'bg-blue-100 text-blue-800',
        'shipped': 'bg-purple-100 text-purple-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Check if order can be deleted
 * @param {Object} order - Order object
 * @returns {boolean} Whether order can be deleted
 */
export const canDeleteOrder = (order) => {
    return !order.is_shipped && !order.is_delivered && order.status !== 'delivered' && order.status !== 'shipped';
};

/**
 * Get allowed status transitions for current order status
 * @param {string} currentStatus - Current order status
 * @returns {Array} Array of allowed next statuses
 */
export const getAllowedStatusTransitions = (currentStatus) => {
    const statusTransitions = {
        'pending': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [], // Final state
        'cancelled': [], // Final state
    };
    return statusTransitions[currentStatus] || [];
};

/**
 * Check if status update is allowed
 * @param {string} currentStatus - Current order status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} Whether status update is allowed
 */
export const canUpdateOrderStatus = (currentStatus, newStatus) => {
    const allowedTransitions = getAllowedStatusTransitions(currentStatus);
    return allowedTransitions.includes(newStatus);
};

/**
 * Get status update options for display
 * @param {string} currentStatus - Current order status
 * @returns {Array} Array of status options with labels
 */
export const getStatusUpdateOptions = (currentStatus) => {
    const allowedStatuses = getAllowedStatusTransitions(currentStatus);
    const statusLabels = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    
    return allowedStatuses.map(status => ({
        value: status,
        label: statusLabels[status],
        color: getStatusColor(status)
    }));
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD') => {
    if (price === null || price === undefined) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(price);
};

/**
 * Format date for display
 * @param {string} dateString - Date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Calculate order totals
 * @param {Array} orderItems - Array of order items
 * @returns {Object} Calculated totals
 */
export const calculateOrderTotals = (orderItems) => {
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = orderItems.length;
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
        subtotal,
        itemCount,
        totalQuantity
    };
};

export default orderService;