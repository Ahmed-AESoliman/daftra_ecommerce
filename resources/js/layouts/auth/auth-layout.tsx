import EcommerceHeader from '@/components/ecommerce-header';

const AuthLayout = ({ children, title, description, showPromo = true, showForgotPassword = false }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <EcommerceHeader showPromo={showPromo} />

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm max-sm:border-0 max-sm:bg-transparent max-sm:shadow-none">
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-2xl font-semibold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-600">{description}</p>
                        </div>

                        {children}

                        {/* {showForgotPassword && (
                            <div className="mt-6 text-center">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/auth/forgot-password')}
                                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
