import { apiClient } from '@/lib/axios';

/**
 * Product API service
 * Handles all product-related API calls
 */
export const productService = {
    /**
     * Get paginated list of products
     * @param {Object} params - Query parameters (page, per_page, search, category_id, etc.)
     * @returns {Promise} API response
     */
    getProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });

        const response = await apiClient.get(`/admin/products?${queryParams}`);
        return response.data;
    },

    /**
     * Get a specific product by slug
     * @param {string} slug - Product slug
     * @returns {Promise} API response
     */
    getProduct: async (slug) => {
        const response = await apiClient.get(`/admin/products/${slug}`);
        return response.data;
    },

    /**
     * Create a new product
     * @param {Object} productData - Product data
     * @returns {Promise} API response
     */
    createProduct: async (productData) => {
        // Create FormData for file uploads
        const formData = new FormData();
        
        // Add method spoofing for Laravel PUT request with files
        formData.append('_method', 'PUT');
        
        Object.keys(productData).forEach(key => {
            if (key === 'image' && productData.image) {
                formData.append('image', productData.image);
            } else if (typeof productData[key] === 'boolean') {
                formData.append(key, productData[key] ? '1' : '0');
            } else if (productData[key] !== undefined && productData[key] !== '') {
                formData.append(key, productData[key]);
            }
        });

        const response = await apiClient.post('/admin/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Update an existing product
     * @param {string} slug - Product slug
     * @param {Object} productData - Updated product data
     * @returns {Promise} API response
     */
    updateProduct: async (slug, productData) => {
        // Create FormData for file uploads
        const formData = new FormData();
        
        
        Object.keys(productData).forEach(key => {
            if (key === 'image' && productData.image) {
                formData.append('image', productData.image);
            } else if (typeof productData[key] === 'boolean') {
                formData.append(key, productData[key] ? '1' : '0');
            } else if (productData[key] !== undefined && productData[key] !== '') {
                formData.append(key, productData[key]);
            }
        });

        const response = await apiClient.post(`/admin/products/${slug}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Delete a product
     * @param {string} slug - Product slug
     * @returns {Promise} API response
     */
    deleteProduct: async (slug) => {
        const response = await apiClient.delete(`/admin/products/${slug}`);
        return response.data;
    },

    /**
     * Get categories for select options (hierarchical and cached)
     * @returns {Promise} API response
     */
    getCategories: async () => {
        const response = await apiClient.get('/admin/products/categories');
        return response.data;
    },

    /**
     * Search products
     * @param {string} query - Search query
     * @param {Object} filters - Additional filters
     * @returns {Promise} API response
     */
    searchProducts: async (query, filters = {}) => {
        const params = {
            search: query,
            ...filters
        };
        return productService.getProducts(params);
    },

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getProductsByCategory: async (categoryId, params = {}) => {
        const searchParams = {
            category_id: categoryId,
            ...params
        };
        return productService.getProducts(searchParams);
    },

    /**
     * Filter products by price range
     * @param {number} minPrice - Minimum price
     * @param {number} maxPrice - Maximum price
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    filterByPriceRange: async (minPrice, maxPrice, params = {}) => {
        const searchParams = {
            min_price: minPrice,
            max_price: maxPrice,
            ...params
        };
        return productService.getProducts(searchParams);
    },

    /**
     * Get products with specific status
     * @param {boolean} isActive - Product status
     * @param {Object} params - Additional parameters
     * @returns {Promise} API response
     */
    getProductsByStatus: async (isActive, params = {}) => {
        const searchParams = {
            status: isActive ? 'active' : 'inactive',
            ...params
        };
        return productService.getProducts(searchParams);
    },

    /**
     * Get public products list (no authentication required)
     * @param {Object} params - Query parameters
     * @returns {Promise} API response
     */
    getPublicProducts: async (params = {}) => {
        const queryParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });

        const response = await apiClient.get(`/public/products?${queryParams}`);
        return response.data;
    },

    /**
     * Get public product by slug (no authentication required)
     * @param {string} slug - Product slug
     * @returns {Promise} API response
     */
    getPublicProductBySlug: async (slug) => {
        const response = await apiClient.get(`/public/products/${slug}`);
        return response.data;
    },

    /**
     * Get public categories (no authentication required)
     * @returns {Promise} API response
     */
    getPublicCategories: async () => {
        const response = await apiClient.get('/public/categories');
        return response.data;
    },

    /**
     * Validate cart stock (no authentication required)
     * @param {Array} cartItems - Array of cart items with id and quantity
     * @returns {Promise} API response
     */
    validateCartStock: async (cartItems) => {
        const response = await apiClient.post('/public/cart/validate-stock', {
            items: cartItems
        });
        return response.data;
    },

    /**
     * Create a new order (no authentication required)
     * @param {Object} orderData - Order data including items, billing address, etc.
     * @returns {Promise} API response
     */
    createOrder: async (orderData) => {
        const response = await apiClient.post('/public/orders', orderData);
        return response.data;
    },
};

/**
 * Product-specific error handling helper
 * Extracts user-friendly error messages from product API responses
 */
export const handleProductApiError = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    if (error.response?.data?.errorMessages) {
        const errors = error.response.data.errorMessages;
        
        // Handle common product validation errors
        if (errors.name) {
            return `Product name: ${errors.name[0]}`;
        }
        if (errors.sku) {
            return `SKU: ${errors.sku[0]}`;
        }
        if (errors.price) {
            return `Price: ${errors.price[0]}`;
        }
        if (errors.category_id) {
            return `Category: ${errors.category_id[0]}`;
        }
        if (errors.image) {
            return `Image: ${errors.image[0]}`;
        }
        
        // Fallback to first error
        const firstField = Object.keys(errors)[0];
        return errors[firstField]?.[0] || 'Validation error occurred';
    }

    return error.message || 'An unexpected error occurred';
};

/**
 * Product API response helper
 * Checks if product API response indicates success
 */
export const isProductApiSuccess = (response) => {
    return response?.statusCode >= 200 && response?.statusCode < 300;
};

/**
 * Format product data for form display
 * Transforms API response data for form components
 */
export const formatProductForForm = (productData) => {
    return {
        name: productData.name || '',
        description: productData.description || '',
        short_description: productData.short_description || '',
        sku: productData.sku || '',
        price: productData.price || '',
        sale_price: productData.sale_price || '',
        stock_quantity: productData.stock_quantity || '',
        in_stock: productData.in_stock ?? true,
        is_active: productData.is_active ?? true,
        category_id: productData.category?.id || '',
        image: null, // Reset image for edit mode, keep existing on server
    };
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(price);
};

export default productService;