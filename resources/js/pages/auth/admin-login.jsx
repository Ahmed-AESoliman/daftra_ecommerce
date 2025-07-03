import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/layouts/auth/auth-layout';
import { authService, handleApiError, isApiSuccess } from '@/services/auth';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

const AdminLogin = () => {
    const { setUserData } = useAuth();
    const navigate = useNavigate();

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        email: '',
        password: '',
    });

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Please enter a valid email address.').required('Email is required.'),
        password: Yup.string().required('Password is required.'),
    });

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear specific field error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }

        // Clear general error
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setError(null);

        try {
            // Validate form data
            await validationSchema.validate(data, { abortEarly: false });

            // Attempt admin login
            const response = await authService.login(data);

            if (isApiSuccess(response)) {
                setUserData(response.data);
                navigate('/admin/dashboard');
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (validationError) {
            if (validationError.inner) {
                // Handle Yup validation errors
                const validationErrors = {};
                validationError.inner.forEach((error) => {
                    validationErrors[error.path] = error.message;
                });
                setErrors(validationErrors);
            } else {
                // Handle API errors
                const errorMessage = handleApiError(validationError);
                setError(errorMessage);
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Welcome back" description="Please enter your details to sign in" showPromo={true} showForgotPassword={true}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                        Email
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoFocus
                        autoComplete="email"
                        value={data.email}
                        onChange={handleChange}
                        placeholder="Enter your admin email"
                        className={`w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={processing}
                    />
                    <InputError message={errors.email} />
                </div>

                <div>
                    <Label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            className={`w-full rounded-md border px-3 py-2 pr-10 focus:border-transparent focus:ring-2 focus:ring-black focus:outline-none ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            disabled={processing}
                        />
                        <button
                            type="button"
                            onClick={handleShowPassword}
                            className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                            disabled={processing}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                <Button
                    type="submit"
                    disabled={processing}
                    className="flex w-full items-center justify-center rounded-md bg-black px-4 py-2 text-white transition duration-200 hover:bg-gray-800 disabled:opacity-50"
                >
                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    {processing ? 'Signing in...' : 'Sign in'}
                </Button>

                <div className="flex flex-col space-y-3 text-center text-sm">
                    <Link to="/admin/auth/forgot-password" className="text-blue-600 hover:text-blue-500 hover:underline">
                        Forgot your password?
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default AdminLogin;
