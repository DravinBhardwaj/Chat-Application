import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL.replace(/['"]/g, "");
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const setAxiosToken = (tok) => {
    if (tok) axios.defaults.headers.common["token"] = tok;
    else delete axios.defaults.headers.common["token"];
  };

  useEffect(() => setAxiosToken(token), [token]);

  const checkAuth = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get("/api/auth/check-auth", { headers: { token } });
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      } else {
        setAuthUser(null);
        localStorage.removeItem("token");
        setAxiosToken(null);
      }
    } catch (err) {
      toast.error(err.message);
      setAuthUser(null);
      localStorage.removeItem("token");
      setAxiosToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (state, credentials) => {
    try {
      // Only send relevant fields
      const payload = state === "signup"
        ? credentials
        : { email: credentials.email, password: credentials.password };

      const { data } = await axios.post(`/api/auth/${state}`, payload);

      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setAxiosToken(data.token);
        connectSocket(data.userData);
        toast.success(data.message);
        navigate("/profile");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    setAxiosToken(null);
    if (socket) socket.disconnect();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body, {
        headers: { token: localStorage.getItem("token") },
      });
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } else toast.error(data.message || "Update failed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, { query: { userId: userData._id } });
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => setOnlineUsers(userIds));
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
