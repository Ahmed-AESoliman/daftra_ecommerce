export interface CartItem {
    id: number;
    name: string;
    slug: string;
    price: number;
    quantity: number;
    image: string;
    stock_quantity: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    current_price: number;
    featured_image?: string;
    category?: {
        id: number;
        name: string;
    } | string;
    stock_quantity: number;
    is_active: boolean;
    in_stock: boolean;
}

const CART_COOKIE_NAME = 'ecommerce_cart';
const CART_COOKIE_EXPIRES_DAYS = 30;

export const saveCartToCookie = (cartItems: CartItem[]): void => {
    try {
        const cartData = JSON.stringify(cartItems);
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + CART_COOKIE_EXPIRES_DAYS);
        
        document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(cartData)};expires=${expirationDate.toUTCString()};path=/;SameSite=Lax`;
    } catch (error) {
        console.error('Failed to save cart to cookie:', error);
    }
};

export const loadCartFromCookie = (): CartItem[] => {
    try {
        const cookies = document.cookie.split(';');
        const cartCookie = cookies.find(cookie => 
            cookie.trim().startsWith(`${CART_COOKIE_NAME}=`)
        );
        
        if (!cartCookie) {
            return [];
        }
        
        const cartData = decodeURIComponent(cartCookie.split('=')[1]);
        const parsedCart = JSON.parse(cartData);
        
        // Validate cart data structure
        if (Array.isArray(parsedCart)) {
            return parsedCart.filter(item => 
                item && 
                typeof item.id === 'number' && 
                typeof item.quantity === 'number' && 
                item.quantity > 0
            );
        }
        
        return [];
    } catch (error) {
        console.error('Failed to load cart from cookie:', error);
        return [];
    }
};

export const clearCartCookie = (): void => {
    try {
        document.cookie = `${CART_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    } catch (error) {
        console.error('Failed to clear cart cookie:', error);
    }
};

export const calculateCartTotal = (cartItems: CartItem[]): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export const getCartItemCount = (cartItems: CartItem[]): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
};

export const convertProductToCartItem = (product: Product, quantity: number = 1): CartItem => {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.current_price,
        quantity: Math.max(1, Math.min(quantity, product.stock_quantity)),
        image: product.featured_image || '/api/placeholder/60/60',
        stock_quantity: product.stock_quantity
    };
};