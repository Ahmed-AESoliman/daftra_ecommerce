import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { 
    CartItem, 
    Product, 
    saveCartToCookie, 
    loadCartFromCookie, 
    clearCartCookie, 
    calculateCartTotal, 
    getCartItemCount,
    convertProductToCartItem 
} from '@/utils/cart';
import { productService } from '@/services/product';

interface CartState {
    items: CartItem[];
    total: number;
    itemCount: number;
    isLoading: boolean;
    stockValidation: Record<number, { valid: boolean; error?: string; availableQuantity?: number; }>;
}

type CartAction =
    | { type: 'LOAD_CART'; payload: CartItem[] }
    | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
    | { type: 'REMOVE_FROM_CART'; payload: number }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: number; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_STOCK_VALIDATION'; payload: Record<number, { valid: boolean; error?: string; availableQuantity?: number; }> };

interface CartContextType extends CartState {
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    getCartItem: (productId: number) => CartItem | undefined;
    validateStock: () => Promise<void>;
    getStockValidation: (productId: number) => { valid: boolean; error?: string; availableQuantity?: number; } | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'LOAD_CART': {
            const items = action.payload;
            return {
                ...state,
                items,
                total: calculateCartTotal(items),
                itemCount: getCartItemCount(items),
                isLoading: false
            };
        }

        case 'ADD_TO_CART': {
            const { product, quantity } = action.payload;
            const existingItemIndex = state.items.findIndex(item => item.id === product.id);
            
            let newItems: CartItem[];
            
            if (existingItemIndex >= 0) {
                // Update existing item
                const existingItem = state.items[existingItemIndex];
                const newQuantity = Math.min(
                    existingItem.quantity + quantity,
                    product.stock_quantity
                );
                
                newItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: newQuantity }
                        : item
                );
            } else {
                // Add new item
                const cartItem = convertProductToCartItem(product, quantity);
                newItems = [...state.items, cartItem];
            }
            
            const newState = {
                ...state,
                items: newItems,
                total: calculateCartTotal(newItems),
                itemCount: getCartItemCount(newItems)
            };
            
            saveCartToCookie(newItems);
            return newState;
        }

        case 'REMOVE_FROM_CART': {
            const newItems = state.items.filter(item => item.id !== action.payload);
            const newState = {
                ...state,
                items: newItems,
                total: calculateCartTotal(newItems),
                itemCount: getCartItemCount(newItems)
            };
            
            saveCartToCookie(newItems);
            return newState;
        }

        case 'UPDATE_QUANTITY': {
            const { productId, quantity } = action.payload;
            
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                const newItems = state.items.filter(item => item.id !== productId);
                const newState = {
                    ...state,
                    items: newItems,
                    total: calculateCartTotal(newItems),
                    itemCount: getCartItemCount(newItems)
                };
                
                saveCartToCookie(newItems);
                return newState;
            }
            
            const newItems = state.items.map(item =>
                item.id === productId
                    ? { ...item, quantity: Math.min(quantity, item.stock_quantity) }
                    : item
            );
            
            const newState = {
                ...state,
                items: newItems,
                total: calculateCartTotal(newItems),
                itemCount: getCartItemCount(newItems)
            };
            
            saveCartToCookie(newItems);
            return newState;
        }

        case 'CLEAR_CART': {
            const newState = {
                ...state,
                items: [],
                total: 0,
                itemCount: 0
            };
            
            clearCartCookie();
            return newState;
        }

        case 'SET_LOADING': {
            return {
                ...state,
                isLoading: action.payload
            };
        }

        case 'SET_STOCK_VALIDATION': {
            return {
                ...state,
                stockValidation: action.payload
            };
        }

        default:
            return state;
    }
};

const initialState: CartState = {
    items: [],
    total: 0,
    itemCount: 0,
    isLoading: true,
    stockValidation: {}
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from cookie on mount
    useEffect(() => {
        const savedCart = loadCartFromCookie();
        dispatch({ type: 'LOAD_CART', payload: savedCart });
    }, []);

    const addToCart = (product: Product, quantity: number = 1) => {
        dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    };

    const removeFromCart = (productId: number) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    };

    const updateQuantity = (productId: number, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getCartItem = (productId: number): CartItem | undefined => {
        return state.items.find(item => item.id === productId);
    };

    const validateStock = async (): Promise<void> => {
        if (state.items.length === 0) {
            dispatch({ type: 'SET_STOCK_VALIDATION', payload: {} });
            return;
        }

        try {
            const cartItems = state.items.map(item => ({
                id: item.id,
                quantity: item.quantity
            }));

            const response = await productService.validateCartStock(cartItems);
            
            if (response.statusCode === 200 && response.data?.items) {
                const validationMap: Record<number, { valid: boolean; error?: string; availableQuantity?: number; }> = {};
                
                response.data.items.forEach((item: any) => {
                    validationMap[item.id] = {
                        valid: item.valid,
                        error: item.error,
                        availableQuantity: item.available_quantity
                    };
                });

                dispatch({ type: 'SET_STOCK_VALIDATION', payload: validationMap });
            }
        } catch (error) {
            console.error('Stock validation failed:', error);
            // Set all items as invalid on error
            const errorValidation: Record<number, { valid: boolean; error?: string; availableQuantity?: number; }> = {};
            state.items.forEach(item => {
                errorValidation[item.id] = {
                    valid: false,
                    error: 'Unable to validate stock'
                };
            });
            dispatch({ type: 'SET_STOCK_VALIDATION', payload: errorValidation });
        }
    };

    const getStockValidation = (productId: number) => {
        return state.stockValidation[productId];
    };

    const contextValue: CartContextType = {
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartItem,
        validateStock,
        getStockValidation
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};