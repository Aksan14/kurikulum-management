"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService, AuthUser, LoginRequest, RegisterRequest, ProfileUpdateRequest, ChangePasswordRequest } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = authService.getCurrentUser();
        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        setUser(response.data.user);
        // Redirect based on role
        const redirectPath = response.data.user.role === 'kaprodi' 
          ? '/kaprodi/dashboard' 
          : '/dosen/dashboard';
        router.push(redirectPath);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (response.success) {
        // After registration, redirect to login
        router.push('/login');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const updateProfile = useCallback(async (data: ProfileUpdateRequest) => {
    const response = await authService.updateProfile(data);
    if (response.success && response.data) {
      setUser(response.data);
    } else {
      throw new Error(response.message || 'Failed to update profile');
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    const response = await authService.changePassword(data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user && authService.isAuthenticated(),
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { 
    roles?: ('kaprodi' | 'dosen')[];
    redirectTo?: string;
  }
) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(options?.redirectTo || '/login');
      } else if (!isLoading && isAuthenticated && options?.roles) {
        if (!options.roles.includes(user!.role)) {
          // Redirect to user's own dashboard if role doesn't match
          router.push(`/${user!.role}/dashboard`);
        }
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (options?.roles && !options.roles.includes(user!.role)) {
      return null;
    }

    return <Component {...props} />;
  };
}

export default AuthContext;
