import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context";
import {
  AUTH_SESSION_EVENT,
  clearStoredUser,
  getStoredUser,
  storeUser,
} from "../utils/authSession";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const syncUserFromStorage = () => {
      setUser(getStoredUser());
    };

    window.addEventListener(AUTH_SESSION_EVENT, syncUserFromStorage);
    window.addEventListener("storage", syncUserFromStorage);

    return () => {
      mountedRef.current = false;
      window.removeEventListener(AUTH_SESSION_EVENT, syncUserFromStorage);
      window.removeEventListener("storage", syncUserFromStorage);
    };
  }, []);

  const login = (userData) => {
    const normalizedUser = storeUser(userData);
    setUser(normalizedUser);
  };

  const logout = () => {
    setUser(null);
    if (mountedRef.current) {
      clearStoredUser();
    }
  };

  const value = {
    user,
    login,
    logout,
    loading: false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
