import { Outlet } from 'react-router-dom';

const Product = () => {
    return (
        <div className="flex h-full flex-1 flex-col gap-2 rounded-xl">
            <Outlet />
        </div>
    );
};

export default Product;
