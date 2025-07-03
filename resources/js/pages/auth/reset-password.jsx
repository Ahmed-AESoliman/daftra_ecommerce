import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';
import { authService, handleApiError, isApiSuccess } from '@/services/auth';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as Yup from 'yup';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        token: '',
    });

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Please enter a valid email address.').required('Email address is required.'),
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters.')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
            )
            .required('Password is required.'),
        password_confirmation: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords do not match.')
            .required('Password confirmation is required.'),
    });

    // Initialize form with URL parameters
    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token) {
            const forgotPasswordPath = '/forgot-password';
            navigate(forgotPasswordPath);
            return;
        }

        setData((prev) => ({
            ...prev,
            token,
            email: email || '',
        }));
    }, [searchParams, navigate]);

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleShowPasswordConfirmation = () => {
        setShowPasswordConfirmation(!showPasswordConfirmation);
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

            // Attempt password reset
            const response = await authService.resetPassword(data);

            if (isApiSuccess(response)) {
                setSuccess(true);
            } else {
                throw new Error(response.message || 'Password reset failed. Please try again.');
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

    // Dynamic navigation paths
    const loginPath = '/admin/auth/login';
    if (success) {
        return (
            <AuthLayout title="Password reset successful" description="Your password has been reset successfully">
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            Your password has been successfully reset. You can now sign in with your new password.
                        </p>
                    </div>

                    <Link to={loginPath} className="block">
                        <Button className="w-full">Continue to sign in</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Reset password" description="Enter your new password below">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={errors.email ? 'border-red-500' : ''}
                        disabled={processing}
                        autoComplete="email"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={data.password}
                            onChange={handleChange}
                            placeholder="Enter your new password"
                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                            disabled={processing}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={handleShowPassword}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            disabled={processing}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                    <div className="relative">
                        <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type={showPasswordConfirmation ? 'text' : 'password'}
                            value={data.password_confirmation}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            className={errors.password_confirmation ? 'border-red-500 pr-10' : 'pr-10'}
                            disabled={processing}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={handleShowPasswordConfirmation}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                            disabled={processing}
                        >
                            {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password_confirmation} />
                </div>

                {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
                    <p className="mb-2 font-medium">Password requirements:</p>
                    <ul className="list-inside list-disc space-y-1">
                        <li>At least 8 characters long</li>
                        <li>One uppercase letter (A-Z)</li>
                        <li>One lowercase letter (a-z)</li>
                        <li>One number (0-9)</li>
                        <li>One special character (@$!%*?&)</li>
                    </ul>
                </div>

                <Button type="submit" className="w-full" disabled={processing || !data.token}>
                    {processing ? 'Resetting password...' : 'Reset password'}
                </Button>

                <div className="text-center">
                    <Link to={loginPath} className="text-sm text-gray-600 hover:text-gray-500">
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;
