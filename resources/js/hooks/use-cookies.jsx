export function useCookies() {
    // Get
    const getCookie = (name) => {
        const cookies = document.cookie.split('; ');
        for (let cookie of cookies) {
            const [key, value] = cookie.split('=');
            if (key === name) return decodeURIComponent(value);
        }
        return null;
    };

    // Set
    const setCookie = (name, value, days = 1, isSession = false) => {
        const expires = new Date();
        if (isSession) expires.setTime('Thu, 01 Jan 1970 00:00:00 UTC');
        else expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; Secure; SameSite=Strict`;
    };

    // Remove
    const removeCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    return { getCookie, setCookie, removeCookie };
}
