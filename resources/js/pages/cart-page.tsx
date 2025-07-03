import CustomerInfoModal, { type CustomerInfo } from '@/components/customer-info-modal';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import EcommerceLayout from '@/layouts/ecommerce-layout';
import { productService } from '@/services/product';
import { AlertCircle, Minus, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { items, total, removeFromCart, updateQuantity, validateStock, getStockValidation, clearCart } = useCart();
    const [isValidating, setIsValidating] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [showCustomerModal, setShowCustomerModal] = useState(false);

    const handleStockValidation = useCallback(async () => {
        setIsValidating(true);
        try {
            await validateStock();
        } finally {
            setIsValidating(false);
        }
    }, [validateStock]);

    const handlePlaceOrderClick = async () => {
        setOrderError('');

        try {
            // Validate stock one more time before showing modal
            await validateStock();

            // Check if there are still stock issues
            const hasStockIssues = items.some((item) => {
                const validation = getStockValidation(item.id);
                return validation && !validation.valid;
            });

            if (hasStockIssues) {
                setOrderError('Please resolve stock issues before placing your order');
                return;
            }

            // Show customer info modal
            setShowCustomerModal(true);
        } catch (error: unknown) {
            console.error('Stock validation failed:', error);
            setOrderError('Failed to validate stock. Please try again.');
        }
    };

    const handleCustomerInfoSubmit = async (billingInfo: CustomerInfo, shippingInfo?: CustomerInfo) => {
        setIsPlacingOrder(true);
        setOrderError('');

        try {
            // Prepare order data with real customer information
            const orderData = {
                items: items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                })),
                billing_address: billingInfo,
                shipping_address: shippingInfo || billingInfo,
                notes: `Order placed from cart at ${new Date().toISOString()}`,
            };

            const response = await productService.createOrder(orderData);

            if (response.statusCode === 200) {
                setOrderSuccess(true);
                setShowCustomerModal(false);
                clearCart();
                // Show success message for a few seconds
                setTimeout(() => {
                    setOrderSuccess(false);
                }, 5000);
            } else {
                setOrderError(response.message || 'Failed to create order');
            }
        } catch (error: unknown) {
            console.error('Order creation failed:', error);
            const errorMessage =
                error && typeof error === 'object' && 'response' in error
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Failed to place order. Please try again.';
            setOrderError(errorMessage || 'Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleQuantityChange = (productId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            updateQuantity(productId, newQuantity);
        }
    };

    const handleRemoveItem = (productId: number) => {
        removeFromCart(productId);
    };

    const formatPrice = (price: number | string) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return `$${(numPrice || 0).toFixed(2)}`;
    };

    const shippingCost = 15.0;
    const tax = total * 0.08;
    const finalTotal = total + shippingCost + tax;

    // Check if any items have stock issues
    const hasStockIssues = items.some((item) => {
        const validation = getStockValidation(item.id);
        return validation && !validation.valid;
    });

    if (items.length === 0) {
        return (
            <EcommerceLayout>
                <div className="mb-6">
                    {/* Breadcrumb */}
                    <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900">cart</span>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
                        <p className="mb-8 text-gray-600">Your cart is empty</p>
                        <Button asChild>
                            <Link to="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </EcommerceLayout>
        );
    }

    return (
        <EcommerceLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    {/* Breadcrumb */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Link to="/">Home</Link>
                            <span>/</span>
                            <span className="text-gray-900">cart</span>
                        </div>
                        <button
                            onClick={handleStockValidation}
                            disabled={isValidating}
                            className="flex items-center space-x-2 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={isValidating ? 'animate-spin' : ''} />
                            <span>Check Stock</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Cart Items */}
                    <div className="">
                        <div className="space-y-4">
                            {items.map((item) => {
                                const stockValidation = getStockValidation(item.id);
                                const hasStockIssue = stockValidation && !stockValidation.valid;

                                return (
                                    <div
                                        key={item.id}
                                        className={`flex items-start space-x-4 rounded-lg border bg-white p-4 ${hasStockIssue ? 'border-red-200 bg-red-50' : ''}`}
                                    >
                                        <div className="h-30 w-25 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </div>

                                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                                            <div className="">
                                                <h3 className="truncate font-medium text-gray-900">{item.name}</h3>
                                                <p className="text-sm font-medium text-gray-900">{formatPrice(item.price)}</p>
                                                <p className="text-xs text-gray-500">
                                                    Stock: {stockValidation?.availableQuantity ?? item.stock_quantity}
                                                </p>

                                                {/* Stock validation error */}
                                                {hasStockIssue && (
                                                    <div className="mt-2 flex items-center space-x-1 text-xs text-red-600">
                                                        <AlertCircle size={12} />
                                                        <span>{stockValidation.error}</span>
                                                        {stockValidation.availableQuantity !== undefined && (
                                                            <span className="font-medium">(Available: {stockValidation.availableQuantity})</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between space-x-4 rounded-lg border-2 border-gray-300 p-0">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-12 border-none bg-transparent text-center text-lg font-medium outline-none">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-50"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <button onClick={() => handleRemoveItem(item.id)} className="rounded-full p-2 text-red-500 hover:bg-red-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="rounded-lg border bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">Order Summary ( #{Math.floor(Math.random() * 1000) + 123} )</h2>
                            <div className="mb-4 text-xs text-gray-500">3 May 2023</div>

                            <div className="mb-6 space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{formatPrice(shippingCost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{formatPrice(tax)}</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span>{formatPrice(finalTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handlePlaceOrderClick}
                                className="w-full bg-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                                disabled={hasStockIssues || isValidating}
                            >
                                {hasStockIssues ? 'Fix Stock Issues to Continue' : isValidating ? 'Validating...' : 'Place Order'}
                            </Button>

                            {hasStockIssues && (
                                <p className="mt-2 text-center text-xs text-red-600">Please resolve stock issues before placing your order</p>
                            )}

                            {orderError && <p className="mt-2 text-center text-xs text-red-600">{orderError}</p>}

                            {orderSuccess && <p className="mt-2 text-center text-xs text-green-600">Order placed successfully! 🎉</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Info Modal */}
            <CustomerInfoModal
                isOpen={showCustomerModal}
                onClose={() => setShowCustomerModal(false)}
                onSubmit={handleCustomerInfoSubmit}
                isLoading={isPlacingOrder}
            />
        </EcommerceLayout>
    );
};

export default CartPage;
