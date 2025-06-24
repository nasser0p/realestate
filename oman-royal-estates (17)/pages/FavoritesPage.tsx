
import React, { useContext, useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { Property } from '../types';
import { MOCK_PROPERTIES } from '../data';
import PropertyCard from '../components/PropertyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const FavoritesPage: React.FC = () => {
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { favoriteIds, isLoading: favoritesLoading } = useContext(FavoritesContext);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    if (!authLoading && !favoritesLoading) {
      if (user) {
        const favs = MOCK_PROPERTIES.filter(p => favoriteIds.includes(p.id));
        setFavoriteProperties(favs);
      }
      setPageLoading(false);
    }
  }, [user, favoriteIds, authLoading, favoritesLoading]);

  if (authLoading || pageLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }

  if (!user) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
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
