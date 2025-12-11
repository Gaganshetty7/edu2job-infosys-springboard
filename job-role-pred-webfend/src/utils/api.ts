export const isAuthenticated = (): boolean => {
    const access = localStorage.getItem('access');
    return !!access;
};

export const getUserRole = (): string | null => {
    return localStorage.getItem('role');
};
