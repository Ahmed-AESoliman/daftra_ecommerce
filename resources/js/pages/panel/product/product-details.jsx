import { Button } from '@/components/ui/button';
import ProductModal from '@/components/ui/popup-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useModal } from '@/contexts/modal-context';
import { formatPrice, handleProductApiError, productService } from '@/services/product';
import { Eye, Package, Pencil, ShoppingCart, Tag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

const StatusItem = ({ icon, label, value }) => {
    return (
        <div className="flex items-center justify-between rounded-md border p-3 shadow-sm">
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {value ? 'Yes' : 'No'}
            </span>
        </div>
    );
};

const ActionButton = ({ icon, label, onClick, disabled, color = 'primary', danger = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm font-semibold shadow-sm transition-colors ${
            danger
                ? 'bg-red-500 text-white hover:bg-red-500/90'
                : color === 'primary'
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-muted text-foreground hover:bg-muted-foreground/10'
        } disabled:cursor-not-allowed disabled:opacity-50`}
    >
        {icon}
        {label}
    </button>
);

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const { setBreadcrumb } = useBreadcrumb();
    const { showModal, closeModal } = useModal();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await productService.getProduct(slug);
                setProduct(response.data);
                setLoading(false);
            } catch (err) {
                setError(handleProductApiError(err));
                console.error(err);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    useEffect(() => {
        if (!product) return;
        setBreadcrumb(product.name, `/admin/products/${product.slug}`);
    }, [product, setBreadcrumb]);

    const showDeleteModal = () => {
        if (!product) return;
        showModal(
            <ProductModal title={'Delete Product'}>
                <p className="text-sm text-muted-foreground">
                    Warning: You are about to delete the product "{product.name}" from the system. This action cannot be undone.
                </p>
                <p className="mt-4 text-sm text-red-500">Are you sure you want to proceed with deleting this product?</p>
                <div className="mt-4 flex w-full justify-end">
                    <Button className="mr-2 cursor-pointer" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer bg-red-500 text-white hover:bg-red-400" onClick={handleDelete}>
                        Yes, Delete {product.name}
                    </Button>
                </div>
            </ProductModal>,
        );
    };

    // Delete handler
    const handleDelete = async () => {
        closeModal();
        if (!product) return;
        setDeleteLoading(true);
        try {
            await productService.deleteProduct(product.slug);
            toast.success('Product deleted successfully');
            navigate('/admin/products');
        } catch (e) {
            toast.error(handleProductApiError(e));
        }
        setDeleteLoading(false);
    };

    if (error) {
        return (
            <div className="p-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Product Information */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-20 w-20 rounded-lg" />
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
                                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                        {product?.featured_image ? (
                                            <img src={product.featured_image} alt={product.name} className="h-full w-full rounded-lg object-cover" />
                                        ) : (
                                            <Package className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex items-end justify-between">
                                            <h1 className="text-xl font-bold text-gray-900">{product?.name}</h1>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/products/${product?.slug}/edit`}
                                                    className="cursor-pointer rounded bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200"
                                                >
                                                    <Pencil size={18} />
                                                </Link>
                                                <button
                                                    onClick={showDeleteModal}
                                                    disabled={deleteLoading}
                                                    className="cursor-pointer rounded bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 disabled:opacity-50"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">{product?.sku}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                                <Tag size={12} />
                                                {product?.category?.name || 'Uncategorized'}
                                            </span>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                    product?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {product?.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {product?.description && (
                                    <div className="mt-4 border-t pt-4">
                                        <h3 className="text-sm font-semibold text-gray-900">Description</h3>
                                        <p className="mt-2 text-sm text-gray-600">{product.description}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Product Images */}
                    {product?.images && product.images.length > 0 && (
                        <div className="rounded-lg border bg-white p-6">
                            <h3 className="mb-4 text-lg font-semibold">Product Images</h3>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                {product.images.map((image, index) => (
                                    <div key={index} className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                        <img
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                            onClick={() => window.open(image, '_blank')}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Product Stats */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Product Details</h3>
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full rounded" />
                                <Skeleton className="h-16 w-full rounded" />
                                <Skeleton className="h-16 w-full rounded" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Price</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">{formatPrice(product?.current_price)}</div>
                                            {product?.price !== product?.current_price && (
                                                <div className="text-sm text-gray-500 line-through">{formatPrice(product?.price)}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-lg bg-gray-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">Stock</span>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-gray-900">{product?.stock_quantity}</div>
                                            <div className={`text-sm ${product?.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                                                {product?.in_stock ? 'In Stock' : 'Out of Stock'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Status */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-semibold">Status</h3>
                        {loading ? (
                            <div className="space-y-3">
                                <Skeleton className="h-14 w-full rounded" />
                                <Skeleton className="h-14 w-full rounded" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <StatusItem label="Active" value={product?.is_active} icon={<Eye size={20} className="text-gray-500" />} />
                                <StatusItem label="In Stock" value={product?.in_stock} icon={<ShoppingCart size={20} className="text-gray-500" />} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
