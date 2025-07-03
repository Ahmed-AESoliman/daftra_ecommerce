import AppPagination from '@/components/app-pagination';
import AppToolTip from '@/components/app-tooltip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '@/components/ui/loader';
import ProductModal from '@/components/ui/popup-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TableHead from '@/components/ui/table-head';
import { useModal } from '@/contexts/modal-context';
import { useDebounce } from '@/hooks/use-debounce';
import { formatPrice, handleProductApiError, productService } from '@/services/product';
import { CircleCheckIcon, CircleX, Eye, Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const tableHeader = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
];

const ProductTable = () => {
    const [categories, setCategories] = useState([]);
    const { showModal, closeModal } = useModal();
    const navigate = useNavigate();
    const [data, setData] = useState({
        products: [],
        pagination: {
            currentPage: 0,
            lastPage: 0,
            perPage: 0,
            total: 0,
            hasMorePages: false,
        },
    });

    const [errors, setErrors] = useState({});
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [filters, setFilters] = useState({
        per_page: 15,
        page: 1,
        search: '',
        category_id: '',
        refresh: 0,
    });
    const debounce = useDebounce(filters, 1000);

    const getCategories = async () => {
        try {
            const response = await productService.getCategories();
            setCategories(response.data);
        } catch (error) {
            setErrors({ categoriesApiError: handleProductApiError(error) });
        }
    };

    useEffect(() => {
        getCategories();
    }, []);

    const showDeleteModal = (slug, name) => {
        showModal(
            <ProductModal title={'Delete Product'}>
                <p className="text-sm text-muted-foreground">
                    Warning: You are about to delete the product "{name}" from the system. This action cannot be undone.
                </p>
                <p className="mt-4 text-sm text-red-500">Are you sure you want to proceed with deleting this product?</p>
                <div className="mt-4 flex w-full justify-end">
                    <Button className="mr-2 cursor-pointer" onClick={closeModal}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer bg-red-500 text-white hover:bg-red-400" onClick={() => handleDelete(slug, name)}>
                        Yes, Delete {name}
                    </Button>
                </div>
            </ProductModal>,
        );
    };
    const handleDelete = async (slug, name) => {
        closeModal();
        try {
            setLoadingProducts(true);
            await productService.deleteProduct(slug);

            toast.success(`${name} product deleted successfully`, {
                duration: 5000,
            });

            setFilters({
                ...filters,
                refresh: filters.refresh + 1,
            });
            setLoadingProducts(false);
        } catch (error) {
            console.error(error);
            setErrors({ deleteProductError: handleProductApiError(error) });
            setLoadingProducts(false);
        }
    };
    // Getting products
    useEffect(() => {
        const getProducts = async () => {
            setLoadingProducts(true);
            try {
                const params = {
                    page: filters.page.toString(),
                    per_page: filters.per_page.toString(),
                    ...(filters.search && { search: filters.search }),
                    ...(filters.category_id && { category_id: filters.category_id }),
                };

                const response = await productService.getProducts(params);
                setData({
                    products: response.data.products,
                    pagination: response.data.pagination || data.pagination,
                });
                setLoadingProducts(false);
            } catch (error) {
                console.error(error);
                setErrors({ getProductsError: handleProductApiError(error) });
                setLoadingProducts(false);
            }
        };
        getProducts();
    }, [debounce]);

    const handleCategoryFilter = (categoryId) => {
        setFilters({ ...filters, category_id: categoryId === 'all' ? '' : categoryId, page: 1 });
    };

    return (
        <div className="p-4">
            <div className="flex justify-between border-b border-primary pb-2 align-bottom">
                <Loader isLoading={loadingProducts} />
                <div>
                    <h1 className="text-lg leading-none font-bold text-neutral-800 capitalize dark:text-neutral-300">Products Management</h1>
                    <p className="text-sm text-neutral-500">Manage your product catalog</p>
                </div>
                <div className="flex gap-1">
                    <Button
                        onClick={() => {
                            navigate('/admin/products/create');
                        }}
                        className="cursor-pointer font-semibold capitalize"
                    >
                        <Plus size={16} />
                        Add Product
                    </Button>
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
                                    placeholder="Search products by name, SKU, or description"
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
                            <Select value={filters.category_id || 'all'} onValueChange={(value) => handleCategoryFilter(value)}>
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.length > 0 &&
                                        categories.map((category) => (
                                            <SelectItem key={category.value} value={category.value.toString()}>
                                                {category.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setFilters({
                                        per_page: 15,
                                        page: 1,
                                        search: '',
                                        category_id: '',
                                        refresh: filters.refresh,
                                    })
                                }
                                className="whitespace-nowrap"
                            >
                                Clear All
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {(filters.search || filters.category_id) && (
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
                            {filters.category_id && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                    Category: {categories.find((cat) => cat.value.toString() === filters.category_id)?.label || 'Selected'}
                                    <button
                                        onClick={() => setFilters({ ...filters, category_id: '', page: 1 })}
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
                            {errors.getProductsError && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-1 text-center text-red-500">
                                        {errors.getProductsError}
                                    </td>
                                </tr>
                            )}

                            {errors.deleteProductError && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-1 text-center text-red-500">
                                        {errors.deleteProductError}
                                    </td>
                                </tr>
                            )}

                            {!loadingProducts &&
                                data.products &&
                                data.products.length > 0 &&
                                data.products.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                {product.featured_image ? (
                                                    <img src={product.featured_image} alt={product.name} className="h-10 w-10 rounded object-cover" />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-200">
                                                        <Package size={16} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900">{product.name}</div>
                                                    <div className="max-w-xs truncate text-sm text-gray-500">
                                                        {product.description?.slice(0, 50)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-mono text-sm">{product.sku}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                                {product.category || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{formatPrice(product.current_price)}</span>
                                                {product.price !== product.current_price && (
                                                    <span className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className={`inline-flex items-center gap-1 ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {product.in_stock ? <CircleCheckIcon size={14} /> : <CircleX size={14} />}
                                                    {product.stock_quantity}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <AppToolTip content="View Details">
                                                    <Link to={`/admin/products/${product.slug}`} className="text-blue-600 hover:text-blue-800">
                                                        <Eye size={16} />
                                                    </Link>
                                                </AppToolTip>
                                                <AppToolTip content="Edit Product">
                                                    <Link to={`/admin/products/${product.slug}/edit`} className="text-green-600 hover:text-green-800">
                                                        <Pencil size={16} />
                                                    </Link>
                                                </AppToolTip>
                                                <AppToolTip content="Delete Product">
                                                    <button
                                                        onClick={() => showDeleteModal(product.slug, product.name)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </AppToolTip>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            {!loadingProducts && data.products && data.products.length === 0 && (
                                <tr>
                                    <td colSpan={tableHeader.length} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={32} className="text-gray-300" />
                                            <p>No products found</p>
                                            <Button onClick={() => navigate('/admin/products/create')} size="sm">
                                                <Plus size={16} />
                                                Add your first product
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    {errors.getProductsError && <div className="p-4 text-center text-red-500">{errors.getProductsError}</div>}

                    {errors.deleteProductError && <div className="p-4 text-center text-red-500">{errors.deleteProductError}</div>}

                    {!loadingProducts &&
                        data.products &&
                        data.products.length > 0 &&
                        data.products.map((product) => (
                            <div key={product.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                                <div className="mb-3 flex items-start gap-3">
                                    {product.featured_image ? (
                                        <img
                                            src={product.featured_image}
                                            alt={product.name}
                                            className="h-16 w-16 flex-shrink-0 rounded object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-gray-200">
                                            <Package size={20} className="text-gray-400" />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-gray-900">{product.name}</div>
                                        <div className="truncate text-sm text-gray-500">{product.description?.slice(0, 80)}...</div>
                                        <div className="mt-1 font-mono text-xs text-gray-600">SKU: {product.sku}</div>
                                    </div>
                                </div>

                                <div className="mb-3 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500">Category</div>
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                            {product.category || 'Uncategorized'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Price</div>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{formatPrice(product.current_price)}</span>
                                            {product.price !== product.current_price && (
                                                <span className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Stock</div>
                                        <div className="flex items-center gap-1">
                                            <span
                                                className={`inline-flex items-center gap-1 ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}
                                            >
                                                {product.in_stock ? <CircleCheckIcon size={14} /> : <CircleX size={14} />}
                                                {product.stock_quantity}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Status</div>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Link
                                        to={`/admin/products/${product.slug}`}
                                        className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-600 transition-colors hover:text-blue-800"
                                    >
                                        <Eye size={14} />
                                        View
                                    </Link>
                                    <Link
                                        to={`/admin/products/${product.slug}/edit`}
                                        className="flex items-center gap-1 rounded-md bg-green-50 px-3 py-1 text-sm text-green-600 transition-colors hover:text-green-800"
                                    >
                                        <Pencil size={14} />
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => showDeleteModal(product.slug, product.name)}
                                        className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1 text-sm text-red-600 transition-colors hover:text-red-800"
                                    >
                                        <Trash2 size={14} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                    {!loadingProducts && data.products && data.products.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                                <Package size={32} className="text-gray-300" />
                                <p>No products found</p>
                                <Button onClick={() => navigate('/admin/products/create')} size="sm">
                                    <Plus size={16} />
                                    Add your first product
                                </Button>
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

export default ProductTable;
