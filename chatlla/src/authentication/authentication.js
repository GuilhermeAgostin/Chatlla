const KEY = `Logged`;

export const isAuthenticated = () => localStorage.getItem(KEY) !== null;

export const login = (token) => {
  localStorage.setItem(KEY, token);
};

export const logout = () => {
  localStorage.removeItem(KEY);
};
