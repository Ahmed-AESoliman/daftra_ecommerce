import EcommerceHeader from '@/components/ecommerce-header';

interface EcommerceLayoutProps {
    children: React.ReactNode;
    showPromo?: boolean;
}

const EcommerceLayout = ({ children, showPromo = true }: EcommerceLayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <EcommerceHeader showPromo={showPromo} />

            {/* Main Content */}
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <main className="flex-1 py-4 md:py-6">{children}</main>
            </div>
        </div>
    );
};

export default EcommerceLayout;
