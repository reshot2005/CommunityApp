import { createContext, useContext, useState } from "react";
import {
  clearStoredAuth,
  getStoredRole,
  getStoredToken,
  getStoredUser,
  getStoredUserId,
  setStoredAuth
} from "../utils/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = getStoredToken();
    const role = getStoredRole();
    const userId = getStoredUserId();
    const storedUser = getStoredUser();

    if (!token) {
      return null;
    }

    return {
      token,
      role,
      id: userId,
      ...storedUser
    };
  });

  const login = (payload) => {
    setStoredAuth({
      token: payload.token,
      role: payload.role,
      userId: payload.id,
      user: payload.user
    });
    setUser({
      token: payload.token,
      role: payload.role,
      id: payload.id,
      ...(payload.user || {})
    });
  };
  const logout = () => {
    clearStoredAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
