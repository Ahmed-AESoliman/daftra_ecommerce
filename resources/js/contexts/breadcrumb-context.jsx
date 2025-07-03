import { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbContext = createContext();

export const BreadcrumbProvider = ({ children }) => {
    const [breadcrumb, setbread] = useState({ title: '', href: '' });

    const setBreadcrumb = useCallback((title, href = '') => {
        setbread({ title, href });
    }, []);

    const getBreadcrumb = useCallback(() => {
        return breadcrumb;
    }, [breadcrumb]);

    return <BreadcrumbContext.Provider value={{ breadcrumb, getBreadcrumb, setBreadcrumb }}>{children}</BreadcrumbContext.Provider>;
};

export const useBreadcrumb = () => useContext(BreadcrumbContext);
