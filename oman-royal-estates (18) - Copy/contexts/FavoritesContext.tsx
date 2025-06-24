import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { FavoritesContextType } from '../types';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext<FavoritesContextType>({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: async () => {},
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
    const loadFavorites = async () => {
      if (authIsLoading) return;
      setIsLoading(true);

      if (user) {
        try {
          const favoritesColRef = collection(db, 'users', user.uid, 'favorites');
          const querySnapshot = await getDocs(favoritesColRef);
          const ids = querySnapshot.docs.map(docSnap => docSnap.id); // Favorite property ID is the document ID
          setFavoriteIds(ids);
        } catch (error) {
          console.error("Error loading favorites from Firestore:", error);
          setFavoriteIds([]);
        }
      } else {
        setFavoriteIds([]); // Clear favorites if user logs out
      }
      setIsLoading(false);
    };

    loadFavorites();
  }, [user, authIsLoading]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) {
      console.warn("User not logged in. Cannot toggle favorite.");
      return;
    }
    if (isLoading) return; // Prevent multiple operations if already loading

    setIsLoading(true); // Indicate that an operation is in progress

    const newIsFavorite = !favoriteIds.includes(propertyId);
    const favoriteDocRef = doc(db, 'users', user.uid, 'favorites', propertyId);

    try {
      if (newIsFavorite) {
        // Add to favorites: create a document with the propertyId as its ID
        // The document can be empty or store a timestamp, e.g., { addedAt: serverTimestamp() }
        await setDoc(favoriteDocRef, { propertyId, addedAt: new Date() }); // Using client-side date for simplicity
        setFavoriteIds(prevIds => [...prevIds, propertyId]);
      } else {
        // Remove from favorites
        await deleteDoc(favoriteDocRef);
        setFavoriteIds(prevIds => prevIds.filter(id => id !== propertyId));
      }
    } catch (error) {
      console.error("Error toggling favorite in Firestore:", error);
      // Optionally, revert UI state or show error to user
    } finally {
      setIsLoading(false); // Operation finished
    }
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