import ProductCard from '@/components/product-card';
import ProductDetailsSheet from '@/components/product-details-sheet';
import EcommerceLayout from '@/layouts/ecommerce-layout';
import { productService } from '@/services/product';
import { type User } from '@/types';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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


export default function Welcome() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProductSheet, setShowProductSheet] = useState(false);
    const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsResponse, categoriesResponse] = await Promise.all([
                productService.getPublicProducts({ per_page: 8 }),
                productService.getPublicCategories(),
            ]);

            setFeaturedProducts(productsResponse.data.products ?? []);
            setCategories(categoriesResponse.data ?? []);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (productSlug: string) => {
        setSelectedProductSlug(productSlug);
        setShowProductSheet(true);
    };

    const handleCloseSheet = () => {
        setShowProductSheet(false);
        setSelectedProductSlug(null);
    };


    const parentCategories = categories.filter((cat) => !cat.slug.includes('-') || cat.slug === 'casual' || cat.slug === 'semi-formal');

    return (
        <EcommerceLayout>
            {/* Hero Section */}
            <section className="mb-6 md:mb-12 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-700 p-4 sm:p-6 md:p-8 lg:p-12 text-white">
                <div className="max-w-2xl">
                    <h1 className="mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                        FIND CLOTHES THAT MATCHES YOUR STYLE
                    </h1>
                    <p className="mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl text-gray-300">
                        Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your
                        sense of style.
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center rounded-full bg-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 text-sm sm:text-base font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                    >
                        Shop Now
                        <ArrowRight className="ml-2" size={16} />
                    </Link>
                </div>

                <div className="mt-6 sm:mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 text-center">
                    <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold">200+</div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-300">International Brands</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold">2,000+</div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-300">High-Quality Products</div>
                    </div>
                    <div>
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold">30,000+</div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-300">Happy Customers</div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="mb-12">
                <h2 className="mb-8 text-center text-3xl font-bold">Browse by Category</h2>
                <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-3">
                    {parentCategories.map((category) => (
                        <Link
                            key={category.id}
                            to={`/products/${category.slug}`}
                            className="group rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
                        >
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-gray-200">
                                    <ShoppingBag size={24} className="text-gray-600" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">{category.name}</h3>
                                <p className="text-sm text-gray-600">Explore {category.name.toLowerCase()} collection</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="mb-12">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-3xl font-bold">Featured Products</h2>
                    <Link to="/products" className="flex items-center text-gray-600 hover:text-gray-900">
                        View All
                        <ArrowRight className="ml-1" size={16} />
                    </Link>
                </div>

                {loading ? (
                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
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
                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {featuredProducts.slice(0, 4).map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onProductClick={handleProductClick}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Newsletter Section */}
            <section className="rounded-2xl bg-black p-4 sm:p-6 md:p-8 lg:p-12 text-center text-white">
                <h2 className="mb-4 text-xl sm:text-2xl md:text-3xl font-bold">STAY UP TO DATE ABOUT OUR LATEST OFFERS</h2>
                <p className="mb-6 md:mb-8 text-sm sm:text-base text-gray-300">Subscribe to our newsletter and be the first to know about new collections and exclusive deals.</p>

                <div className="mx-auto flex max-w-sm sm:max-w-md gap-2 sm:gap-4">
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="flex-1 rounded-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
                    />
                    <button className="rounded-full bg-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold text-black transition-colors hover:bg-gray-100 whitespace-nowrap">
                        Subscribe
                    </button>
                </div>
            </section>

            {/* Product Details Sheet */}
            <ProductDetailsSheet
                isOpen={showProductSheet}
                onClose={handleCloseSheet}
                productSlug={selectedProductSlug}
            />
        </EcommerceLayout>
    );
}
