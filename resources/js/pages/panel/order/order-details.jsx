import { Button } from '@/components/ui/button';
import OrderModal from '@/components/ui/popup-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useModal } from '@/contexts/modal-context';
import { formatPrice, handleOrderApiError, orderService } from '@/services/order';
import { Clock, CreditCard, MapPin, Package, ShoppingCart, Trash2, Truck, CircleCheck, CircleX, User, Mail, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const StatusItem = ({ icon, label, value, valueColor }) => {
    return (
        <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${valueColor || 'bg-gray-100 text-gray-700'}`}>
                {value}
            </span>
        </div>
    );
};

const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CircleCheck,
    cancelled: CircleX,
};

const OrderDetails = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { setBreadcrumb } = useBreadcrumb();
    const { showModal, closeModal } = useModal();

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            try {
                const response = await orderService.getOrder(orderNumber);
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                setError(handleOrderApiError(err));
                console.error(err);
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderNumber]);

    useEffect(() => {
        if (!order) return;
        setBreadcrumb(`Order ${order.order_number}`, `/admin/orders/${order.order_number}`);
    }, [order, setBreadcrumb]);

    const showDeleteModal = () => {
        if (!order) return;
        showModal(
            <OrderModal title={'Delete Order'}>
                <p className="text-sm text-muted-foreground">
                    Warning: You are about to delete order "{order.order_number}" from the system. This action cannot be undone.
                </p>
                <p className="mt-4 text-sm text-red-500">Are you sure you want to proceed with deleting this order?</p>
                <div className="mt-4 flex w-full justify-end">
                    <Button className="mr-2 cursor-pointer" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer bg-red-500 text-white hover:bg-red-400" onClick={handleDelete}>
                        Yes, Delete Order
                    </Button>
                </div>
            </OrderModal>,
        );
    };

    // Delete handler
    const handleDelete = async () => {
        closeModal();
        if (!order) return;
        setDeleteLoading(true);
        try {
            await orderService.deleteOrder(order.order_number);
            toast.success('Order deleted successfully');
            navigate('/admin/orders');
        } catch (e) {
            toast.error(handleOrderApiError(e));
        }
        setDeleteLoading(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
            </div>
        );
    }

    const StatusIcon = order ? statusIcons[order.status] : Clock;

    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Information */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-16 w-16 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-1/2" />
                                        <Skeleton className="h-4 w-1/3" />
                                    </div>
                                </div>
                                <Skeleton className="mt-2 h-4 w-1/4" />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-start gap-4 sm:flex-row">
                                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                        <ShoppingCart className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <div className="w-full">
                                        <div className="flex items-end justify-between">
                                            <h1 className="text-xl font-bold text-gray-900">{order?.order_number}</h1>
                                            <div className="flex items-center gap-2">
                                                {!order?.is_shipped && !order?.is_delivered && (
                                                    <button
                                                        onClick={showDeleteModal}
                                                        disabled={deleteLoading}
                                                        className="cursor-pointer rounded bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">Customer: {order?.billing_address?.name}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusColors[order?.status]}`}>
                                                <StatusIcon size={12} />
                                                {order?.status_label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Created {order?.created_at_human}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {order?.notes && (
                                    <div className="mt-4 border-t pt-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Order Notes</h3>
                                        <p className="mt-2 text-sm text-gray-600">{order.notes}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Order Items</h3>
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {order?.order_items?.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-3">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-100">
                                            {item.product?.featured_image ? (
                                                <img
                                                    src={item.product.featured_image}
                                                    alt={item.product_name}
                                                    className="h-full w-full rounded object-cover"
                                                />
                                            ) : (
                                                <Package className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                            <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.quantity} × {item.formatted_price}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{item.formatted_total}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Billing Address */}
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <CreditCard size={20} />
                                Billing Address
                            </h3>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{order?.billing_address?.name}</p>
                                    <p className="flex items-center gap-1">
                                        <Mail size={14} />
                                        {order?.billing_address?.email}
                                    </p>
                                    {order?.billing_address?.phone && (
                                        <p className="flex items-center gap-1">
                                            <Phone size={14} />
                                            {order?.billing_address?.phone}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-start gap-1">
                                        <MapPin size={14} className="mt-0.5 text-gray-400" />
                                        <div>
                                            <p>{order?.billing_address?.address}</p>
                                            <p>
                                                {order?.billing_address?.city}, {order?.billing_address?.state} {order?.billing_address?.postal_code}
                                            </p>
                                            <p>{order?.billing_address?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Truck size={20} />
                                Shipping Address
                            </h3>
                            {loading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    <p className="font-medium">{order?.shipping_address?.name}</p>
                                    <div className="mt-3 flex items-start gap-1">
                                        <MapPin size={14} className="mt-0.5 text-gray-400" />
                                        <div>
                                            <p>{order?.shipping_address?.address}</p>
                                            <p>
                                                {order?.shipping_address?.city}, {order?.shipping_address?.state} {order?.shipping_address?.postal_code}
                                            </p>
                                            <p>{order?.shipping_address?.country}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Order Summary</h3>
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full rounded" />
                                <Skeleton className="h-16 w-full rounded" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(order?.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax:</span>
                                    <span>{formatPrice(order?.tax_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping:</span>
                                    <span>{formatPrice(order?.shipping_amount)}</span>
                                </div>
                                {order?.discount_amount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount:</span>
                                        <span>-{formatPrice(order?.discount_amount)}</span>
                                    </div>
                                )}
                                <hr />
                                <div className="flex justify-between font-semibold">
                                    <span>Total:</span>
                                    <span>{order?.formatted_total}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Status */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Timeline</h3>
                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-14 w-full rounded" />
                                <Skeleton className="h-14 w-full rounded" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <StatusItem
                                    label="Order Placed"
                                    value={formatDate(order?.created_at)}
                                    icon={<Clock size={20} className="text-gray-500" />}
                                />
                                {order?.shipped_at && (
                                    <StatusItem
                                        label="Shipped"
                                        value={formatDate(order?.shipped_at)}
                                        icon={<Truck size={20} className="text-purple-500" />}
                                        valueColor="bg-purple-100 text-purple-700"
                                    />
                                )}
                                {order?.delivered_at && (
                                    <StatusItem
                                        label="Delivered"
                                        value={formatDate(order?.delivered_at)}
                                        icon={<CircleCheck size={20} className="text-green-500" />}
                                        valueColor="bg-green-100 text-green-700"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;