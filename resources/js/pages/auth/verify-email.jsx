import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/layouts/auth/auth-layout';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const VerifyEmail = () => {
    const { user, resendEmailVerification, getUser } = useAuth();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // Check if user is already verified
        if (user.verified) {
            setVerified(true);
            return;
        }

        // Handle verification from URL parameters (if coming from email link)
        const id = searchParams.get('id');
        const hash = searchParams.get('hash');
        const expires = searchParams.get('expires');
        const signature = searchParams.get('signature');

        if (id && hash && expires && signature) {
            // This would typically verify the email via API
            // For now, we'll just refresh user data
            handleVerificationFromUrl();
        }
    }, [user, searchParams]);

    const handleVerificationFromUrl = async () => {
        setLoading(true);
        try {
            // Refresh user data to check if verification was successful
            await getUser();
            setMessage('Email verified successfully!');
            setVerified(true);
        } catch (error) {
            setError('Verification failed. The link may be expired or invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setMessage('');
        setError('');

        try {
            const result = await resendEmailVerification();
            if (result.success) {
                setMessage('Verification email sent! Please check your inbox.');
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Failed to resend verification email. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // Dynamic navigation paths
    const dashboardPath = 'admin/dashboard';
    const loginPath = '/admin/auth/login';
    if (loading) {
        return (
            <AuthLayout title="Verifying email" description="Please wait while we verify your email address">
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-sm text-gray-600">Verifying your email address...</p>
                </div>
            </AuthLayout>
        );
    }

    if (verified) {
        return (
            <AuthLayout title="Email verified" description="Your email has been successfully verified">
                <div className="space-y-6 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            Your email address has been verified successfully. You now have full access to your account.
                        </p>
                    </div>

                    <Link to={dashboardPath} className="block">
                        <Button className="w-full">Continue to dashboard</Button>
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Verify your email" description="We've sent a verification link to your email address">
            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Mail className="h-8 w-8 text-blue-600" />
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-gray-600">We've sent a verification link to:</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">
                        Click the link in the email to verify your account. If you don't see it, check your spam folder.
                    </p>
                </div>

                {message && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-600">{message}</div>}

                {error && (
                    <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <Button onClick={handleResendVerification} disabled={resendLoading} variant="outline" className="w-full">
                        {resendLoading ? 'Sending...' : 'Resend verification email'}
                    </Button>

                    <p className="text-xs text-gray-500">
                        Didn't receive the email? Make sure to check your spam folder and ensure {user.email} is correct.
                    </p>
                </div>

                <div className="border-t pt-4">
                    <p className="mb-3 text-sm text-gray-600">Need to use a different email address?</p>
                    <Link to={loginPath} className="block">
                        <Button variant="ghost" className="w-full">
                            Sign in with different account
                        </Button>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyEmail;
