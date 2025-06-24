
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'user@example.com' && pass === 'password') {
          const mockUser: User = { id: '1', email };
          setUser(mockUser);
          localStorage.setItem('authUser', JSON.stringify(mockUser));
          resolve();
        } else if (email === 'admin@example.com' && pass === 'adminpass') {
           const mockUser: User = { id: 'admin01', email };
          setUser(mockUser);
          localStorage.setItem('authUser', JSON.stringify(mockUser));
          resolve();
        }
        else {
          reject(new Error('Invalid email or password. Try user@example.com / password'));
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const register = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
     return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo, registration always succeeds and logs in the new user
        // In a real app, check if email exists, etc.
        if (!email.includes('@')) {
            reject(new Error('Invalid email format.'));
            setIsLoading(false);
            return;
        }
        const mockUser: User = { id: Date.now().toString(), email };
        setUser(mockUser);
        localStorage.setItem('authUser', JSON.stringify(mockUser));
        resolve();
        setIsLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authUser');
    // Also clear favorites on logout, or handle this based on app logic
    localStorage.removeItem('favoritePropertyIds'); 
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
