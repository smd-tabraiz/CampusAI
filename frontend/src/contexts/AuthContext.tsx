import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { campusApi } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  demoLogin: (role: 'student' | 'faculty' | 'admin') => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isFaculty: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('campusai_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refreshUser = async () => {
    try {
      const activeToken = localStorage.getItem('campusai_token');
      if (!activeToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await campusApi.getMe();
      setUser(res.data.user);
    } catch {
      localStorage.removeItem('campusai_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await campusApi.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;

      localStorage.setItem('campusai_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid credentials. Please check your login details.';
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'student' | 'faculty' | 'admin'): Promise<boolean> => {
    const creds = {
      student: { email: 'student@college.edu', password: 'password123' },
      faculty: { email: 'faculty@college.edu', password: 'password123' },
      admin: { email: 'admin@college.edu', password: 'admin123' }
    };
    return login(creds[role].email, creds[role].password);
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await campusApi.register(data);
      const { token: jwtToken, user: userData } = res.data;

      localStorage.setItem('campusai_token', jwtToken);
      setToken(jwtToken);
      setUser(userData);
      showToast('Registration successful! Welcome to CampusAI.', 'success');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create account. Please try again.';
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('campusai_token');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        demoLogin,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isFaculty: user?.role === 'FACULTY' || user?.role === 'ADMIN'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
