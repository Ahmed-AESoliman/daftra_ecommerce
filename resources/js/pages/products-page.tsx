import AppPagination from '@/components/app-pagination';
import ProductCard from '@/components/product-card';
import ProductDetailsSheet from '@/components/product-details-sheet';
import ProductFilterSheet from '@/components/product-filter-sheet';
import { useCart } from '@/contexts/cart-context';
import EcommerceLayout from '@/layouts/ecommerce-layout';
import { productService } from '@/services/product';
import { Minus, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    current_price: number;
    featured_image?: string;
    category?:
        | {
              id: number;
              name: string;
          }
        | string;
    stock_quantity: number;
    is_active: boolean;
    in_stock: boolean;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    children?: Category[];
}

const ProductsPage = () => {
    const { categorySlug } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [sortBy] = useState('name');
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [showProductSheet, setShowProductSheet] = useState(false);
    const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
    const [showFilterSheet, setShowFilterSheet] = useState(false);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        lastPage: 0,
        perPage: 0,
        total: 0,
        hasMorePages: false,
    });
    const [filters, setFilters] = useState<{
        page: number;
        per_page: number;
        search: string;
        sort_by: string;
        min_price?: number | null;
        max_price?: number | null;
        category_id: number | null;
    }>({
        page: 1,
        per_page: 15,
        search: '',
        sort_by: 'name',
        min_price: null,
        max_price: null,
        category_id: null,
    });

    const { items: cartItems, total: cartTotal, updateQuantity: updateCartQuantity } = useCart();

    const loadCategoriesCallback = useCallback(async () => {
        try {
            const response = await productService.getPublicCategories();
            setCategories(response.data);
            if (categorySlug) {
                const category = response.data.find((cat: Category) => cat.slug === categorySlug);
                setSelectedCategory(category || null);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }, [categorySlug]);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params: any = {
                search: filters.search || undefined,
                sort_by: filters.sort_by,
                per_page: filters.per_page,
                page: filters.page,
                min_price: filters.min_price || undefined,
                max_price: filters.max_price || undefined,
                category_id: filters.category_id || undefined,
            };

            if (categorySlug && selectedCategory) {
                params.category_id = selectedCategory.id;
            }

            const response = await productService.getPublicProducts(params);
            setProducts(response.data.products || response.data.data || []);

            // Update pagination info
            setPagination(response.data.pagination || pagination);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    }, [filters, categorySlug, selectedCategory]);

    useEffect(() => {
        loadCategoriesCallback();
    }, [loadCategoriesCallback]);

    useEffect(() => {
        setFilters((prev) => ({
            ...prev,
            search: searchQuery,
            sort_by: sortBy,
            min_price: priceRange[0],
            max_price: priceRange[1],
            category_id: selectedCategory?.id || null,
        }));
    }, [searchQuery, sortBy, priceRange, selectedCategory]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadProducts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [loadProducts]);

    const handleProductClick = (productSlug: string) => {
        setSelectedProductSlug(productSlug);
        setShowProductSheet(true);
    };

    const handleCloseSheet = () => {
        setShowProductSheet(false);
        setSelectedProductSlug(null);
    };

    // Products are now filtered server-side, so we use them directly
    const filteredProducts = products;

    const categoryTitle = selectedCategory?.name || 'all products';

    return (
        <EcommerceLayout>
            <div className="fixed top-1/5 left-0 max-lg:hidden">
                <button
                    onClick={() => setShowFilterSheet(true)}
                    className="flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 shadow hover:bg-gray-50"
                    aria-label="Open filters"
                >
                    <SlidersHorizontal size={30} />
                </button>
            </div>
            <div>
                <div className="mt-4 mb-6">
                    {/* Breadcrumb */}
                    <div className="mb-4 flex items-center space-x-2 text-sm text-gray-600">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900">{selectedCategory?.name || 'all products'}</span>
                    </div>
                </div>
                <div className="flex gap-8">
                    {/* Main Content */}
                    <div className="flex-1 rounded-lg border border-gray-200 bg-white p-6">
                        <div className="mb-6">
                            <div className="relative mb-2 w-full flex-1">
                                <Search className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by product name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none"
                                />
                                <button
                                    onClick={() => setShowFilterSheet(true)}
                                    className="bg-geray-200 absolute top-1/2 right-3 flex -translate-y-1/2 transform items-center justify-center rounded-full border border-gray-300 p-2 shadow hover:bg-gray-50 lg:hidden"
                                    aria-label="Open filters"
                                >
                                    <SlidersHorizontal size={15} />
                                </button>
                            </div>
                            <h1 className="my-3 text-2xl font-bold">{categoryTitle}</h1>
                            <p className="text-gray-600">
                                Showing {(pagination.currentPage - 1) * pagination.perPage + 1}-
                                {Math.min(pagination.currentPage * pagination.perPage, pagination.total)} of {pagination.total} Products
                            </p>
                        </div>

                        {loading ? (
                            <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
                                        <div className="h-64 bg-gray-200"></div>
                                        <div className="p-4">
                                            <div className="mb-2 h-4 rounded bg-gray-200"></div>
                                            <div className="mb-4 h-3 rounded bg-gray-200"></div>
                                            <div className="h-8 rounded bg-gray-200"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} onProductClick={handleProductClick} />
                                ))}
                            </div>
                        )}

                        {!loading && filteredProducts.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="mb-4 text-gray-500">No products found</p>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setPriceRange([0, 500]);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}

                        <div className="flex w-full justify-center">
                            <AppPagination pagination={pagination} setFilters={setFilters} filters={filters} className={'!justify-center'} />
                        </div>
                    </div>

                    {/* Cart Summary Sidebar */}
                    <div className="hidden w-80 lg:block">
                        <div className="sticky top-6">
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                                <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>

                                {cartItems.length === 0 ? (
                                    <p className="text-gray-500">Your cart is empty</p>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-3">
                                                    <img
                                                        src={item.image || '/api/placeholder/60/60'}
                                                        alt={item.name}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                                        <div className="mt-1 flex items-center space-x-2">
                                                            <button
                                                                onClick={() => updateCartQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                                className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="text-sm font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                                className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                            <span className="ml-auto text-sm font-medium">
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-6 space-y-2 border-t pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span>Subtotal</span>
                                                <span>${cartTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Shipping</span>
                                                <span>$15.00</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Tax</span>
                                                <span>$12.50</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-2 font-semibold">
                                                <span>Total</span>
                                                <span>${(cartTotal + 15 + 12.5).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Link
                                            to="/cart"
                                            className="mt-6 block w-full rounded-lg bg-black py-3 text-center font-medium text-white transition-colors hover:bg-gray-800"
                                        >
                                            Proceed to Checkout
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Product Details Sheet */}
                <ProductDetailsSheet isOpen={showProductSheet} onClose={handleCloseSheet} productSlug={selectedProductSlug} />
                {/* Product Filter Sheet */}
                <ProductFilterSheet
                    isOpen={showFilterSheet}
                    onClose={() => setShowFilterSheet(false)}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
            </div>
        </EcommerceLayout>
    );
};

export default ProductsPage;
