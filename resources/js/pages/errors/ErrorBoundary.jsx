import { useEffect, useState } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
    const error = useRouteError();

    const [errorInfo, setErrorInfo] = useState({
        code: ':(',
        message: 'Something went wrong',
        details: "Let's take you back home.",
    });

    useEffect(() => {
        if (isRouteErrorResponse(error)) {
            const presets = {
                404: {
                    message: "Oops! We couldn't find that page",
                    details: 'The link might be broken, or the page no longer exists.',
                },
                401: {
                    message: 'Unauthorized Access',
                    details: "You don't have permission to view this page.",
                },
            };

            const preset = presets[error.status] || {
                message: error.statusText || 'Unexpected error.',
                details: "Let's take you back home.",
            };

            setErrorInfo({
                code: error.status,
                message: preset.message,
                details: preset.details,
            });
        } else if (error instanceof Error) {
            setErrorInfo({
                code: ':(',
                message: 'Unexpected Error',
                details: error.message,
            });
        }
    }, [error]);

    return (
        <div className="z-1 flex h-screen w-screen flex-col items-center justify-center px-2 text-center">
            <div className={`mb-4 text-[16rem] leading-[100%] font-bold max-lg:text-[14rem] max-sm:text-[8rem]`}>{errorInfo.code}</div>
            <div className="text-[2rem] font-bold max-sm:text-[1.5rem]">{errorInfo.message}</div>
            <p className="mt-4 max-sm:text-[0.75rem]">
                {errorInfo.details} <br />
                <a href="/" className="text-blue-500 underline">
                    Back to Dashboard
                </a>
            </p>
        </div>
    );
}
