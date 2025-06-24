import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { collection, doc, getDoc, query, where, documentId, getDocs, Timestamp } from 'firebase/firestore';


const FavoritesPage: React.FC = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { favoriteIds, isLoading: favoritesContextLoading } = useContext(FavoritesContext);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  const location = useLocation();

  const fetchFavoriteProperties = useCallback(async () => {
    if (!user || favoriteIds.length === 0) {
      setFavoriteProperties([]);
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    try {
      // Firestore allows 'in' queries for up to 30 items.
      // If more favorites, pagination or multiple queries would be needed.
      const propertiesRef = collection(db, "properties");
      const fetchedProperties: Property[] = [];
      
      // Batch IDs into groups of 30 for 'in' query limitation
      const idChunks: string[][] = [];
      for (let i = 0; i < favoriteIds.length; i += 30) {
          idChunks.push(favoriteIds.slice(i, i + 30));
      }

      for (const chunk of idChunks) {
          if (chunk.length > 0) {
            const q = query(propertiesRef, where(documentId(), "in", chunk));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                fetchedProperties.push({
                    id: docSnap.id,
                    ...data,
                    dateAdded: data.dateAdded instanceof Timestamp ? data.dateAdded.toDate() : new Date(data.dateAdded),
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
                } as Property);
            });
          }
      }
      
      // Sort to match favoriteIds order, or by another criteria like dateAdded
      const sortedFavorites = fetchedProperties.sort((a, b) => favoriteIds.indexOf(a.id) - favoriteIds.indexOf(b.id));
      setFavoriteProperties(sortedFavorites);

    } catch (error) {
      console.error("Error fetching favorite properties:", error);
      setFavoriteProperties([]);
    } finally {
      setPageLoading(false);
    }
  }, [user, favoriteIds]);


  useEffect(() => {
    // Wait for auth and favorites context to finish loading
    if (!authLoading && !favoritesContextLoading) {
      fetchFavoriteProperties();
    }
  }, [authLoading, favoritesContextLoading, fetchFavoriteProperties]);


  if (authLoading || pageLoading || favoritesContextLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-royal-blue mb-8 font-display">{T.myFavoriteProperties}</h1>
      {favoriteProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold text-royal-blue">{T.noFavoritesYet}</h3>
          <p className="text-gray-500 mt-2 mb-6">
            {T.noFavoritesDesc}
          </p>
          <Link 
            to={ROUTES.PROPERTIES}
            className="bg-royal-blue text-white px-6 py-3 rounded-md hover:bg-opacity-90 transition-colors font-semibold"
          >
            {T.browseProperties}
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;