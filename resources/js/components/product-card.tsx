import { useCart } from '@/contexts/cart-context';
import type { Product } from '@/utils/cart';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
    onProductClick: (slug: string) => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
    const { getCartItem, addToCart, updateQuantity: updateCartQuantity } = useCart();
    const cartItem = getCartItem(product.id);
    const [quantity, setQuantity] = useState(cartItem?.quantity || 1);

    const updateQuantity = (newQuantity: number) => {
        const validQuantity = Math.max(1, Math.min(newQuantity, product.stock_quantity));
        setQuantity(validQuantity);

        if (cartItem) {
            updateCartQuantity(product.id, validQuantity);
        } else {
            addToCart(product, validQuantity);
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-lg border shadow-md transition-shadow hover:shadow-lg">
            {/* Product Image */}
            <div className="group relative cursor-pointer" onClick={() => onProductClick(product.slug)}>
                <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                        src={product.featured_image ?? 'https://placehold.co/600x400'}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                {/* Cart quantity indicator */}
                {cartItem && (
                    <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                        {cartItem.quantity}
                    </div>
                )}

                {product.sale_price && (
                    <div className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">SALE</div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
                {/* Title and Category */}
                <div>
                    <h3
                        className="line-clamp-2 cursor-pointer text-sm font-semibold text-gray-900 hover:text-gray-700 sm:text-base"
                        onClick={() => onProductClick(product.slug)}
                    >
                        {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 sm:text-sm">
                        {typeof product.category === 'object' ? product.category?.name : product.category}
                    </p>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-gray-900 sm:text-lg">${product.current_price}</span>
                    {product.sale_price && <span className="text-xs text-gray-400 line-through sm:text-sm">${product.price}</span>}
                </div>

                {/* Stock */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Stock:</span>
                    <span className={product.in_stock ? 'text-gray-900' : 'text-red-600'}>
                        {product.in_stock ? product.stock_quantity : 'Out of stock'}
                    </span>
                </div>

                {/* Quantity Controls */}
                {product.in_stock && (
                    <div className="pt-1 sm:pt-2">
                        <div className="flex items-center justify-start">
                            <div className="flex items-center space-x-1 rounded-lg border border-gray-300 p-1 sm:space-x-2">
                                <button
                                    onClick={() => updateQuantity(quantity - 1)}
                                    className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 hover:bg-gray-200 sm:h-8 sm:w-8"
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={12} className="sm:hidden" />
                                    <Minus size={14} className="hidden sm:block" />
                                </button>
                                <span className="px-1 text-xs font-medium sm:px-2 sm:text-sm">{quantity}</span>
                                <button
                                    onClick={() => updateQuantity(quantity + 1)}
                                    className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 hover:bg-gray-200 sm:h-8 sm:w-8"
                                    disabled={quantity >= product.stock_quantity}
                                >
                                    <Plus size={12} className="sm:hidden" />
                                    <Plus size={14} className="hidden sm:block" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
