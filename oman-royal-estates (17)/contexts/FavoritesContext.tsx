
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { FavoritesContextType } from '../types';
import { AuthContext } from './AuthContext';


export const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  isLoading: true,
});

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authIsLoading } = useContext(AuthContext);

  useEffect(() => {
    if (authIsLoading) return; // Wait for auth state to be determined

    setIsLoading(true);
    if (user) {
      // User is logged in, load their favorites
      // In a real app, this would be an API call. For demo, use localStorage scoped by user ID.
      const storedFavorites = localStorage.getItem(`favoritePropertyIds_${user.id}`);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      } else {
        setFavoriteIds([]); // No favorites stored for this user
      }
    } else {
      // User is not logged in, clear favorites
      setFavoriteIds([]);
    }
    setIsLoading(false);
  }, [user, authIsLoading]);


  const toggleFavorite = (propertyId: string) => {
    if (!user) return; // Should not happen if UI controls this, but good check

    setFavoriteIds(prevIds => {
      const newIds = prevIds.includes(propertyId)
        ? prevIds.filter(id => id !== propertyId)
        : [...prevIds, propertyId];
      
      // Persist to localStorage (mocking backend)
      localStorage.setItem(`favoritePropertyIds_${user.id}`, JSON.stringify(newIds));
      return newIds;
    });
  };

  const isFavorite = (propertyId: string): boolean => {
    return favoriteIds.includes(propertyId);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
};
