import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-context';
import { type NavItem } from '@/types';
import { LayoutGrid, Package, ShoppingCart, Tags } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tags,
    },
];

export function AppSidebar() {
    const { user } = useAuth();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/admin/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    {mainNavItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton asChild>
                                    <Link to={item.href}>
                                        {IconComponent && <IconComponent />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
