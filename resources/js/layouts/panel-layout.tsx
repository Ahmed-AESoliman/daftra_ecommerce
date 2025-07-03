import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { Outlet, useMatches } from 'react-router-dom';

interface PanelLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ ...props }: PanelLayoutProps) => {
    const matches = useMatches();
    
    const routeBreadcrumbs = matches
        .map((match: any) => {
            if (match.handle?.breadcrumb) {
                return typeof match.handle.breadcrumb === 'function' ? match.handle.breadcrumb(match) : match.handle.breadcrumb;
            }
            return null;
        })
        .filter(Boolean);

    return (
        <AppLayoutTemplate breadcrumbs={routeBreadcrumbs} {...props}>
            <Outlet />
        </AppLayoutTemplate>
    );
};