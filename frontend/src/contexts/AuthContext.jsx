// frontend/src/contexts/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // --- TAMBAH LOG INI ---
  console.log('AuthContext Provider Rendered. User:', user, 'Token:', token ? 'Exists' : 'Null', 'LoadingAuth:', loadingAuth);
  // --- END LOG ---

  useEffect(() => {
    // --- TAMBAH LOG INI ---
    console.log('AuthContext useEffect triggered.');
    // --- END LOG ---
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // --- TAMBAH LOG INI ---
      console.log('AuthContext: Found stored token.');
      // --- END LOG ---
      setToken(storedToken);
      setUser({ username: 'Logged In User' });
    }
    setLoadingAuth(false);
    // --- TAMBAH LOG INI ---
    console.log('AuthContext: Finished initial loading.');
    // --- END LOG ---
  }, []);

  const login = async (email, password) => {
    try {
      setLoadingAuth(true);
      const response = await axios.post('/api/users/login', { email, password });
      const { token: receivedToken, _id, username, email: userEmail } = response.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser({ _id, username, email: userEmail });
      setLoadingAuth(false);
      // --- TAMBAH LOG INI ---
      console.log('AuthContext: Login successful. Token and user set.');
      // --- END LOG ---
      return { success: true };
    } catch (error) {
      setLoadingAuth(false);
      console.error("Login error:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    // ... (Kode sama, tambahkan log serupa jika ingin debugging register juga)
    try {
      setLoadingAuth(true);
      const response = await axios.post('/api/users/register', { username, email, password });
      const { token: receivedToken, _id, username: newUsername, email: newUserEmail } = response.data;

      localStorage.setItem('token', receivedToken);
      setToken(receivedToken);
      setUser({ _id, username: newUsername, email: newUserEmail });
      setLoadingAuth(false);
      console.log('AuthContext: Registration successful. Token and user set.');
      return { success: true };
    } catch (error) {
      setLoadingAuth(false);
      console.error("Register error:", error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    // --- TAMBAH LOG INI ---
    console.log('AuthContext: Calling logout. Clearing localStorage and state.');
    // --- END LOG ---
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loadingAuth,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};