import { useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context";

function getStoredUser() {
  const userFromStorage = localStorage.getItem("user");

  if (!userFromStorage) {
    return null;
  }

  try {
    return JSON.parse(userFromStorage);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const login = (userData) => {
    setUser(userData);
    if (mountedRef.current) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (mountedRef.current) {
      localStorage.removeItem("user");
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
