import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';
import { authService, handleApiError, isApiSuccess } from '@/services/auth';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

const ForgotPassword = () => {
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState({
        email: '',
    });

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Please enter a valid email address.').required('Email address is required.'),
    });

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

            // Request password reset
            const response = await authService.forgotPassword(data.email);

            if (isApiSuccess(response)) {
                setSuccess(true);
            } else {
                throw new Error(response.message || 'Failed to send reset email. Please try again.');
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
            <AuthLayout title="Check your email" description="We've sent a password reset link to your email">
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            If an account with email <strong>{data.email}</strong> exists, you will receive a password reset link shortly.
                        </p>
                        <p className="text-sm text-gray-500">Didn't receive the email? Check your spam folder or try again.</p>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={() => {
                                setSuccess(false);
                                setData({ email: '' });
                            }}
                            variant="outline"
                            className="w-full"
                        >
                            Try another email
                        </Button>

                        <Link to={loginPath} className="block">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to sign in
                            </Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Forgot password?" description="Enter your email and we'll send you a reset link">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoFocus
                        autoComplete="email"
                        value={data.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        className={errors.email ? 'border-red-500' : ''}
                        disabled={processing}
                    />
                    <InputError message={errors.email} />
                </div>

                {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? 'Sending reset link...' : 'Send reset link'}
                </Button>

                <div className="text-center">
                    <Link to={loginPath} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to sign in
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ForgotPassword;
