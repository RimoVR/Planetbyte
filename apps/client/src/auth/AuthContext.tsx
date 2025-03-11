import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Faction } from '@planetbyte/common';

// Define the user interface
interface User {
  id: string;
  username: string;
  faction: Faction;
  experience: number;
  level: number;
  eloRating: number;
}

// Define the auth state interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

// Define the auth context interface
interface AuthContextType {
  authState: AuthState;
  login: (username: string, faction: Faction) => Promise<void>;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  authState: {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
  },
  login: async () => {},
  logout: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: false,
    user: null,
    error: null,
  });

  // Function to handle user login
  const login = async (username: string, faction: Faction) => {
    setAuthState({ ...authState, isLoading: true });

    try {
      // In a real implementation, this would make an API call to authenticate the user
      // For now, we'll just simulate a successful login with a mock user
      const mockUser: User = {
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        username,
        faction,
        experience: 0,
        level: 1,
        eloRating: 1000, // Starting Elo rating
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: mockUser,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error instanceof Error ? error.message : 'Failed to login',
      });
    }
  };

  // Function to handle user logout
  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
  };

  // Provide the auth context to children
  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};