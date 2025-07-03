import { DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/auth-context';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { LogOut } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        cleanup();
        try {
            await logout();
            // Redirect to login page after logout
            window.location.href = '/admin/auth/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">{/* <UserInfo user={user} showEmail={true} /> */}</div>
            </DropdownMenuLabel>

            <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2" />
                Log out
            </DropdownMenuItem>
        </>
    );
}
