import { useAppearance } from '@/hooks/use-appearance';
import { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { appearance, updateAppearance } = useAppearance();
    const [theme, setTheme] = useState(appearance);

    const setMode = (value) => {
        updateAppearance(value);
        setTheme(value);
    };

    const getMode = () => {
        return theme;
    };

    const isDarkMode = () => {
        if (theme === 'system') {
            return document.documentElement.classList.contains('dark');
        }
        return theme === 'dark';
    };

    return <ThemeContext.Provider value={{ theme, getMode, setMode, isDarkMode }}>{children}</ThemeContext.Provider>;
};
