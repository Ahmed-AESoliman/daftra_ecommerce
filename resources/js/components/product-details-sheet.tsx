import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useCart } from '@/contexts/cart-context';
import { productService } from '@/services/product';
import type { Product } from '@/utils/cart';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    productSlug: string | null;
}

const ProductDetailsSheet = ({ isOpen, onClose, productSlug }: ProductDetailsSheetProps) => {
    const { getCartItem, addToCart, updateQuantity: updateCartQuantity } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (isOpen && productSlug) {
            loadProduct();
        }
    }, [isOpen, productSlug]);

    // Set initial quantity when product loads or cart item changes
    useEffect(() => {
        if (product) {
            const cartItem = getCartItem(product.id);
            if (cartItem) {
                setQuantity(cartItem.quantity);
            } else {
                setQuantity(1);
            }
        }
    }, [product, getCartItem]);

    const loadProduct = async () => {
        if (!productSlug) return;

        try {
            setLoading(true);
            const response = await productService.getPublicProductBySlug(productSlug);
            setProduct(response.data);
            setQuantity(1);
        } catch (error) {
            console.error('Failed to load product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product && quantity > 0) {
            if (cartItem) {
                // Update existing cart item with new quantity
                updateCartQuantity(product.id, quantity);
            } else {
                // Add new item to cart
                addToCart(product, quantity);
                setQuantity(1);
            }
        }
    };

    const cartItem = product ? getCartItem(product.id) : undefined;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full max-w-sm overflow-y-auto p-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4 p-4">
                        <div className="h-64 rounded bg-gray-200"></div>
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                        <div className="h-8 rounded bg-gray-200"></div>
                    </div>
                ) : product ? (
                    <div className="flex h-full flex-col">
                        {/* Product Image */}
                        <div className="p-4 pb-0">
                            <div className="overflow-hidden rounded-lg bg-gray-50">
                                <img
                                    src={product.featured_image ?? product.image_url ?? '/api/placeholder/400/400'}
                                    alt={product.name}
                                    className="h-64 w-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 space-y-4 p-4">
                            {/* Title and Category */}
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <h1 className="text-xl font-semibold text-gray-900">{product.name}</h1>
                                    <span className="text-sm text-gray-500">
                                        {typeof product.category === 'object' ? product.category?.name : product.category}
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="border-b pb-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl font-bold text-gray-900">${product.current_price}</span>
                                    {product.sale_price && <span className="text-lg text-gray-400 line-through">${product.price}</span>}
                                </div>
                            </div>

                            {/* Product Details Section */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-gray-900">Product Details</h3>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Category:</span>
                                    <span className="text-gray-900">
                                        {typeof product.category === 'object' ? product.category?.name : product.category}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Stock:</span>
                                    <span className={`${product.in_stock ? 'text-gray-900' : 'text-red-600'}`}>
                                        {product.in_stock ? `${product.stock_quantity} items` : 'Out of stock'}
                                    </span>
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            {product.in_stock && (
                                <>
                                    <div className="flex items-center justify-between space-y-3 pt-4">
                                        <div>
                                            <label className="block font-semibold text-gray-900">Quantity</label>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-center space-x-4 rounded-lg border-2 border-gray-300 p-0">
                                                <button
                                                    onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-50"
                                                    disabled={quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <input
                                                    value={quantity.toString()}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value === '' || /^\d+$/.test(value)) {
                                                            const numValue = parseInt(value) || 1;
                                                            if (numValue >= 1 && numValue <= product.stock_quantity) {
                                                                setQuantity(numValue);
                                                            }
                                                        }
                                                    }}
                                                    onBlur={(e) => {
                                                        const value = parseInt(e.target.value) || 1;
                                                        setQuantity(Math.min(Math.max(1, value), product.stock_quantity));
                                                    }}
                                                    className="w-12 border-none bg-transparent text-center text-lg font-medium outline-none"
                                                    type="text"
                                                />
                                                <button
                                                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-50"
                                                    disabled={quantity >= product.stock_quantity}
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4">
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full rounded-lg bg-black py-3 font-medium text-white transition-colors hover:bg-gray-800"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex h-64 items-center justify-center">
                        <p className="text-gray-500">Product not found</p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default ProductDetailsSheet;
