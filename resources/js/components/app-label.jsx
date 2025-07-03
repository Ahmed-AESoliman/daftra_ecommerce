import GlowingRingsLoader from '@/components/ui/GlowingRingsLoader';

const AppLabel = ({ className, children, required = false, htmlFor, disabled, loading = false }) => {
    return (
        <label
            htmlFor={htmlFor}
            className={`flex items-center justify-between text-sm font-semibold text-muted-foreground ${className} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
            <span>
                {children} {required && <span className="text-destructive">*</span>}{' '}
            </span>
            {loading && (
                <span className="ml-2 flex items-center justify-end gap-1">
                    <GlowingRingsLoader className="h-4 w-4" />
                    <span className="text-xs text-muted-foreground">Collecting data...</span>
                </span>
            )}
        </label>
    );
};

export default AppLabel;
