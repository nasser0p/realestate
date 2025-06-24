import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUserType, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase'; // Import initialized Firebase auth
import { User, AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUserType | null) => {
      if (firebaseUser) {
        // Map Firebase user to your app's User type
        // TODO: Potentially fetch additional user profile data from Firestore here
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          // name: firebaseUser.displayName, // if available or fetched from Firestore
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state
    } catch (error: any) {
      console.error("Firebase login error:", error);
      // Map Firebase error codes to user-friendly messages
      let message = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string): Promise<void> => {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      // onAuthStateChanged will handle setting the user state
      // TODO: Potentially create a user profile document in Firestore here
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      let message = "Registration failed. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. It should be at least 6 characters.';
      }
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will handle setting user to null
    } catch (error) {
      console.error("Firebase logout error:", error);
      throw new Error("Logout failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};