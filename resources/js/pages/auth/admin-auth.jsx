import { Outlet } from 'react-router-dom';

const AdminAuth = () => {
    return (
        <div className="min-h-screen">
            <Outlet />
        </div>
    );
};

export default AdminAuth;
