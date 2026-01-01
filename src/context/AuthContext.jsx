import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Restore login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      // Let the useEffect handle the user state
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
      return meRes.data;
    } catch (error) {
      throw error;
    }
  };

  // ✅ REGISTER
  const register = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      localStorage.setItem("token", res.data.token);
      const meRes = await api.get("/auth/me");
      setUser(meRes.data);
      return meRes.data;
    } catch (error) {
      throw error;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
