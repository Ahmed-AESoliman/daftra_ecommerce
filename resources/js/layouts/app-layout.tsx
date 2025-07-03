import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import EcommerceLayout from '@/layouts/ecommerce-layout';
import EcommerceHeader from '@/components/ecommerce-header';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    layout?: 'admin' | 'ecommerce' | 'public';
    showPromo?: boolean;
    cartItems?: any[];
    cartTotal?: number;
}

export default ({ children, breadcrumbs, layout = 'admin', showPromo, cartItems, cartTotal, ...props }: AppLayoutProps) => {
    if (layout === 'ecommerce') {
        return (
            <EcommerceLayout showPromo={showPromo} cartItems={cartItems} cartTotal={cartTotal}>
                {children}
            </EcommerceLayout>
        );
    }

    // Public layout for pages outside admin panel (with optional breadcrumbs)
    if (layout === 'public') {
        return (
            <div className="min-h-screen bg-gray-50">
                <EcommerceHeader showPromo={showPromo} />
                
                <div className="max-w-7xl mx-auto">
                    <main className="p-6">
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <div className="mb-6">
                                <Breadcrumbs breadcrumbs={breadcrumbs} />
                            </div>
                        )}
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
    );
};
