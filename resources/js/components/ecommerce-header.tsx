import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { ChevronDown, LogOut, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';
interface EcommerceHeaderProps {
    showPromo?: boolean;
    onCartToggle?: (show: boolean) => void;
    showCart?: boolean;
}

const EcommerceHeader = ({ showPromo = true }: EcommerceHeaderProps) => {
    const { itemCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const [showPromoBanner, setShowPromoBanner] = useState(showPromo);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserMenu(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            {/* Promotional Banner */}
            {showPromoBanner && (
                <div className="relative bg-black px-4 py-3 text-center text-white">
                    <span className="text-sm">
                        Sign up and get 20% off to your first order.
                        <button className="ml-1 font-medium underline">Sign Up Now</button>
                    </span>
                    <button
                        onClick={() => setShowPromoBanner(false)}
                        className="absolute top-1/2 right-4 -translate-y-1/2 transform rounded p-1 hover:bg-gray-800"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 py-4 lg:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center space-x-4 lg:space-x-8">
                        {/* Logo */}
                        <div className="flex flex-row items-center gap-3">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="hidden text-gray-600 transition-colors hover:text-gray-900 max-md:block"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <Link to="/" className="flex items-center space-x-2">
                                <div className="h-10 w-20 max-md:h-15 md:w-30">
                                    <img src={logo} alt="Logo" className="h-full w-full" />
                                </div>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden items-center space-x-6 md:flex">
                            <Link to="/products" className="text-gray-600 transition-colors hover:text-gray-900">
                                Products
                            </Link>

                            <button className="rounded bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800">
                                Sell Your Product
                            </button>
                        </nav>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden items-center space-x-4 md:flex">
                        <Link to="/cart" className="relative text-gray-600 transition-colors hover:text-gray-900">
                            <ShoppingCart className="h-6 w-6" />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated() ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                >
                                    <User className="h-5 w-5 text-gray-600" />
                                    <span>{user?.name || ''}</span>
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                                        <Link
                                            to="/admin/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-gray-100"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/admin/auth/login"
                                className="rounded bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-gray-800"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Right Side */}
                    <Link to="/cart" className="relative hidden text-gray-600 hover:text-gray-900 max-md:flex">
                        <ShoppingCart className="h-6 w-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="mt-4 border-t border-gray-200 pt-4 md:hidden">
                        <nav className="space-y-3">
                            <Link
                                to="/products"
                                className="block text-gray-600 transition-colors hover:text-gray-900"
                                onClick={() => setShowMobileMenu(false)}
                            >
                                Products
                            </Link>

                            <button className="w-full rounded bg-gray-100 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-200">
                                Sell Your Product
                            </button>

                            <div className="border-t border-gray-200 pt-3">
                                {isAuthenticated() ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <User className="h-5 w-5 text-gray-600" />
                                            <span className="text-sm text-gray-700">{user?.name || ''}</span>
                                        </div>
                                        <Link
                                            to="/admin/dashboard"
                                            className="block w-full rounded bg-black px-4 py-2 text-center text-sm text-white transition-colors hover:bg-gray-800"
                                            onClick={() => setShowMobileMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setShowMobileMenu(false);
                                            }}
                                            className="flex w-full items-center justify-center space-x-2 rounded border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        to="/admin/auth/login"
                                        className="block w-full rounded bg-black px-4 py-2 text-center text-sm text-white transition-colors hover:bg-gray-800"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
};

export default EcommerceHeader;
