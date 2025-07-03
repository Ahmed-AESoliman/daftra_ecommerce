import AppPagination from '@/components/app-pagination';
import AppToolTip from '@/components/app-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import OrderModal from '@/components/ui/popup-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableHead from '@/components/ui/table-head';
import { useModal } from '@/contexts/modal-context';
import { useDebounce } from '@/hooks/use-debounce';
import { getAllowedStatusTransitions, getStatusUpdateOptions, handleOrderApiError, orderService } from '@/services/order';
import { CircleCheck, CircleX, Clock, Edit, Eye, Package, ShoppingCart, Trash2, Truck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const tableHeader = [
    { key: 'order_number', label: 'Order Number' },
    { key: 'customer', label: 'Customer' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'items', label: 'Items' },
    { key: 'date', label: 'Date' },
    { key: 'actions', label: 'Actions' },
];

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

const OrderTable = () => {
    const { showModal, closeModal } = useModal();
    const [data, setData] = useState({
        orders: [],
        pagination: {
            current_page: 0,
            last_page: 0,
            per_page: 0,
            total: 0,
            has_more_pages: false,
        },
    });

    const [errors, setErrors] = useState({});
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [filters, setFilters] = useState({
        per_page: 15,
        page: 1,
        search: '',
        status: '',
        date_from: '',
        date_to: '',
        min_amount: '',
        max_amount: '',
        sort_by: 'created_at',
        sort_order: 'desc',
        refresh: 0,
    });
    const debounce = useDebounce(filters, 1000);

    const showStatusUpdateModal = (order) => {
        const statusOptions = getStatusUpdateOptions(order.status);

        if (statusOptions.length === 0) {
            toast.error('No status updates available for this order');
            return;
        }

        showModal(
            <OrderModal title={'Update Order Status'}>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Update status for order "{order.order_number}" for customer "{order.customer_name}".
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-medium">Current status:</span>
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                            >
                                {React.createElement(statusIcons[order.status] || Clock, { size: 12 })}
                                {order.status_label}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select new status:</label>
                        <div className="grid gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleStatusUpdate(order.order_number, option.value)}
                                    className={`flex items-center gap-2 rounded-lg border-2 border-transparent p-3 transition-all hover:border-gray-300 ${option.color} hover:opacity-80`}
                                >
                                    {React.createElement(statusIcons[option.value] || Clock, { size: 16 })}
                                    <span className="font-medium">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex w-full justify-end">
                    <Button className="cursor-pointer" onClick={closeModal}>
                        Cancel
                    </Button>
                </div>
            </OrderModal>,
        );
    };

    const showDeleteModal = (orderNumber, customerName) => {
        showModal(
            <OrderModal title={'Delete Order'}>
                <p className="text-sm text-muted-foreground">
                    Warning: You are about to delete order "{orderNumber}" for customer "{customerName}" from the system. This action cannot be
                    undone.
                </p>
                <p className="mt-4 text-sm text-red-500">Are you sure you want to proceed with deleting this order?</p>
                <div className="mt-4 flex w-full justify-end">
                    <Button className="mr-2 cursor-pointer" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer bg-red-500 text-white hover:bg-red-400" onClick={() => handleDelete(orderNumber)}>
                        Yes, Delete Order
                    </Button>
                </div>
            </OrderModal>,
        );
    };

    const handleStatusUpdate = async (orderNumber, newStatus) => {
        closeModal();
        try {
            setLoadingOrders(true);
            await orderService.updateOrderStatus(orderNumber, newStatus);

            toast.success(`Order ${orderNumber} status updated to ${newStatus} successfully`, {
                duration: 5000,
            });

            setFilters({
                ...filters,
                refresh: filters.refresh + 1,
            });
            setLoadingOrders(false);
        } catch (error) {
            console.error(error);
            setErrors({ updateOrderError: handleOrderApiError(error) });
            setLoadingOrders(false);
        }
    };

    const handleDelete = async (orderNumber) => {
        closeModal();
        try {
            setLoadingOrders(true);
            await orderService.deleteOrder(orderNumber);

            toast.success(`Order ${orderNumber} deleted successfully`, {
                duration: 5000,
            });

            setFilters({
                ...filters,
                refresh: filters.refresh + 1,
            });
            setLoadingOrders(false);
        } catch (error) {
            console.error(error);
            setErrors({ deleteOrderError: handleOrderApiError(error) });
            setLoadingOrders(false);
        }
    };

    // Getting orders
    useEffect(() => {
        const getOrders = async () => {
            setLoadingOrders(true);
            try {
                const params = {
                    page: filters.page.toString(),
                    per_page: filters.per_page.toString(),
                    sort_by: filters.sort_by,
                    sort_order: filters.sort_order,
                    ...(filters.search && { search: filters.search }),
                    ...(filters.status && { status: filters.status }),
                    ...(filters.date_from && { date_from: filters.date_from }),
                    ...(filters.date_to && { date_to: filters.date_to }),
                    ...(filters.min_amount && { min_amount: filters.min_amount }),
                    ...(filters.max_amount && { max_amount: filters.max_amount }),
                };

                const response = await orderService.getOrders(params);
                setData({
                    orders: response.data.orders,
                    pagination: {
                        currentPage: response.data.pagination.current_page,
                        lastPage: response.data.pagination.last_page,
                        perPage: response.data.pagination.per_page,
                        total: response.data.pagination.total,
                        hasMorePages: response.data.pagination.has_more_pages,
                        // Keep original for fallback
                        ...response.data.pagination,
                    },
                });
                setLoadingOrders(false);
            } catch (error) {
                console.error(error);
                setErrors({ getOrdersError: handleOrderApiError(error) });
                setLoadingOrders(false);
            }
        };
        getOrders();
    }, [debounce]);

    const handleStatusFilter = (status) => {
        setFilters({ ...filters, status: status === 'all' ? '' : status, page: 1 });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-4">
            <div className="flex justify-between border-b border-primary pb-2 align-bottom">
                <Loader isLoading={loadingOrders} />
                <div>
                    <h1 className="text-lg leading-none font-bold text-neutral-800 capitalize dark:text-neutral-300">Orders Management</h1>
                    <p className="text-sm text-neutral-500">Manage customer orders</p>
                </div>
            </div>
            <div className="my-3">
                <AppPagination pagination={data.pagination} setFilters={setFilters} filters={filters} className={'!justify-end'} />
            </div>
            {/* Enhanced Filters Section */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="p-4">
                    {/* Primary Filters Row */}
                    <div className="mb-4 flex flex-col gap-4 lg:flex-row">
                        <div className="flex-1">
                            <div className="relative">
                                <Input
                                    autoFocus
                                    placeholder="Search orders by number, customer name, or email"
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                                    className="pr-10"
                                />
                                {filters.search && (
                                    <button
                                        onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Select value={filters.status || 'all'} onValueChange={(value) => handleStatusFilter(value)}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setFilters({
                                        per_page: 15,
                                        page: 1,
                                        search: '',
                                        status: '',
                                        date_from: '',
                                        date_to: '',
                                        min_amount: '',
                                        max_amount: '',
                                        sort_by: 'created_at',
                                        sort_order: 'desc',
                                        refresh: filters.refresh,
                                    })
                                }
                                className="whitespace-nowrap"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    {/* Advanced Filters - Collapsible */}
                    <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 lg:grid-cols-3">
                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date Range</label>
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    placeholder="From"
                                    value={filters.date_from}
                                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
                                    className="flex-1"
                                />
                                <Input
                                    type="date"
                                    placeholder="To"
                                    value={filters.date_to}
                                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Amount Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Amount Range</label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min ($)"
                                    value={filters.min_amount}
                                    onChange={(e) => setFilters({ ...filters, min_amount: e.target.value, page: 1 })}
                                    className="flex-1"
                                    min="0"
                                    step="0.01"
                                />
                                <Input
                                    type="number"
                                    placeholder="Max ($)"
                                    value={filters.max_amount}
                                    onChange={(e) => setFilters({ ...filters, max_amount: e.target.value, page: 1 })}
                                    className="flex-1"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        {/* Sort Options */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Sort Options</label>
                            <div className="flex gap-2">
                                <Select value={filters.sort_by} onValueChange={(value) => setFilters({ ...filters, sort_by: value, page: 1 })}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Date Created</SelectItem>
                                        <SelectItem value="order_number">Order Number</SelectItem>
                                        <SelectItem value="total_amount">Total Amount</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                        <SelectItem value="updated_at">Last Updated</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filters.sort_order} onValueChange={(value) => setFilters({ ...filters, sort_order: value, page: 1 })}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue placeholder="Order" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">↓</SelectItem>
                                        <SelectItem value="asc">↑</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Quick Filter Buttons */}
                    <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                        <span className="mr-2 text-sm font-medium text-gray-700">Quick filters:</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                setFilters({ ...filters, date_from: today, date_to: today, page: 1 });
                            }}
                            className="text-xs"
                        >
                            Today
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                setFilters({ ...filters, date_from: weekAgo.toISOString().split('T')[0], date_to: '', page: 1 });
                            }}
                            className="text-xs"
                        >
                            Last 7 days
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const monthAgo = new Date();
                                monthAgo.setDate(monthAgo.getDate() - 30);
                                setFilters({ ...filters, date_from: monthAgo.toISOString().split('T')[0], date_to: '', page: 1 });
                            }}
                            className="text-xs"
                        >
                            Last 30 days
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFilters({ ...filters, status: 'pending', page: 1 })}
                            className="text-xs"
                        >
                            Pending Orders
                        </Button>
                    </div>

                    {/* Active Filters Summary */}
                    {(filters.search || filters.status || filters.date_from || filters.date_to || filters.min_amount || filters.max_amount) && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
                            <span className="text-sm font-medium text-gray-700">Active filters:</span>
                            {filters.search && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    Search: "{filters.search}"
                                    <button
                                        onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.status && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    Status: {filters.status}
                                    <button
                                        onClick={() => setFilters({ ...filters, status: '', page: 1 })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.date_from && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    From: {filters.date_from}
                                    <button
                                        onClick={() => setFilters({ ...filters, date_from: '', page: 1 })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.date_to && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    To: {filters.date_to}
                                    <button
                                        onClick={() => setFilters({ ...filters, date_to: '', page: 1 })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.min_amount && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    Min: ${filters.min_amount}
                                    <button
                                        onClick={() => setFilters({ ...filters, min_amount: '', page: 1 })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {filters.max_amount && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    Max: ${filters.max_amount}
                                    <button
                                        onClick={() => setFilters({ ...filters, max_amount: '', page: 1 })}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Responsive Table Container */}
            <div className="my-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto md:block">
                    <table className="min-h-20 w-full text-left text-sm">
                        <TableHead tableHeader={tableHeader} />
                        <tbody>
                            {errors.getOrdersError && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-1 text-center text-red-500">
                                        {errors.getOrdersError}
                                    </td>
                                </tr>
                            )}

                            {errors.deleteOrderError && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-1 text-center text-red-500">
                                        {errors.deleteOrderError}
                                    </td>
                                </tr>
                            )}

                            {errors.updateOrderError && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-1 text-center text-red-500">
                                        {errors.updateOrderError}
                                    </td>
                                </tr>
                            )}

                            {!loadingOrders &&
                                data.orders &&
                                data.orders.length > 0 &&
                                data.orders.map((order) => {
                                    const StatusIcon = statusIcons[order.status] || Clock;
                                    return (
                                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="px-6 py-3">
                                                <div className="font-medium text-blue-600">{order.order_number}</div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div>
                                                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                                                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="font-medium">{order.formatted_total}</div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                                                >
                                                    <StatusIcon size={12} />
                                                    {order.status_label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-1">
                                                    <ShoppingCart size={14} className="text-gray-400" />
                                                    <span className="text-sm">{order.items_count} items</span>
                                                    <span className="text-xs text-gray-500">({order.total_quantity} qty)</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-sm">
                                                <div>{formatDate(order.created_at)}</div>
                                                <div className="text-xs text-gray-500">{order.created_at_human}</div>
                                            </td>
                                            <td className="px-6 py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <AppToolTip content="View Details">
                                                        <Link
                                                            to={`/admin/orders/${order.order_number}`}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Eye size={16} />
                                                        </Link>
                                                    </AppToolTip>
                                                    {getAllowedStatusTransitions(order.status).length > 0 && (
                                                        <AppToolTip content="Update Status">
                                                            <button
                                                                onClick={() => showStatusUpdateModal(order)}
                                                                className="text-green-600 hover:text-green-800"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        </AppToolTip>
                                                    )}
                                                    {!order.is_shipped && !order.is_delivered && (
                                                        <AppToolTip content="Delete Order">
                                                            <button
                                                                onClick={() => showDeleteModal(order.order_number, order.customer_name)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </AppToolTip>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                            {!loadingOrders && data.orders && data.orders.length === 0 && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingCart size={32} className="text-gray-300" />
                                            <p>No orders found</p>
                                            <p className="text-sm">Orders will appear here when customers place them</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    {errors.getOrdersError && <div className="p-4 text-center text-red-500">{errors.getOrdersError}</div>}

                    {errors.deleteOrderError && <div className="p-4 text-center text-red-500">{errors.deleteOrderError}</div>}

                    {errors.updateOrderError && <div className="p-4 text-center text-red-500">{errors.updateOrderError}</div>}

                    {!loadingOrders &&
                        data.orders &&
                        data.orders.length > 0 &&
                        data.orders.map((order) => {
                            const StatusIcon = statusIcons[order.status] || Clock;
                            return (
                                <div key={order.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <div className="text-lg font-medium text-blue-600">{order.order_number}</div>
                                            <div className="text-sm text-gray-500">{formatDate(order.created_at)}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">{order.formatted_total}</div>
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                                            >
                                                <StatusIcon size={12} />
                                                {order.status_label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-3 space-y-2">
                                        <div>
                                            <div className="font-medium text-gray-900">{order.customer_name}</div>
                                            <div className="text-sm text-gray-500">{order.customer_email}</div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <ShoppingCart size={14} className="text-gray-400" />
                                            <span className="text-sm">{order.items_count} items</span>
                                            <span className="text-xs text-gray-500">({order.total_quantity} qty)</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Link
                                            to={`/admin/orders/${order.order_number}`}
                                            className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:text-blue-800"
                                        >
                                            <Eye size={14} />
                                            View
                                        </Link>
                                        {getAllowedStatusTransitions(order.status).length > 0 && (
                                            <button
                                                onClick={() => showStatusUpdateModal(order)}
                                                className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1 text-sm text-green-600 transition-colors hover:text-green-800"
                                            >
                                                <Edit size={14} />
                                                Update
                                            </button>
                                        )}
                                        {!order.is_shipped && !order.is_delivered && (
                                            <button
                                                onClick={() => showDeleteModal(order.order_number, order.customer_name)}
                                                className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1 text-sm text-red-600 transition-colors hover:text-red-800"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                    {!loadingOrders && data.orders && data.orders.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <ShoppingCart size={32} className="text-gray-300" />
                                <p>No orders found</p>
                                <p className="text-sm">Orders will appear here when customers place them</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="my-3">
                <AppPagination pagination={data.pagination} setFilters={setFilters} filters={filters} className={'!justify-end'} />
            </div>
        </div>
    );
};

export default OrderTable;
