import GlowingRingsLoader from '@/components/ui/GlowingRingsLoader';

const Loader = ({ isLoading, size = 12, className = '' }) => {
    return (
        <div
            className={`${isLoading ? 'flex' : 'hidden'} bg-background/5 absolute top-0 right-0 z-[999] h-full w-full items-center justify-center rounded-lg backdrop-blur-[2px] ${className}`}
        >
            {/*<LoaderCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin w-8 h-8" />*/}
            <div className={` size-${size} h-full max-h-[48px] w-full max-w-[48px]`}>
                <GlowingRingsLoader className={` ${isLoading ? 'flex' : 'hidden'} `} />
            </div>
        </div>
    );
};

export default Loader;
