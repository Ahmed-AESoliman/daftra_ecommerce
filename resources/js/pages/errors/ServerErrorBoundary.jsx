import { useEffect, useState } from 'react';

export default function ServerErrorBoundary({ code, message, title }) {
    const [errorInfo, setErrorInfo] = useState({
        code: ':(',
        message: 'Something went wrong',
        details: "Let's take you back home.",
    });

    useEffect(() => {
        if (code) {
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

            const preset = presets[code] || {
                message: 'Unexpected error.',
                details: "Let's take you back home.",
            };

            setErrorInfo({
                code: code,
                message: preset.message,
                details: preset.details,
            });
        }
    }, [code]);

    return (
        // <BackgroundLines className="flex">
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
        // </BackgroundLines>
    );
}
