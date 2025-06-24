
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Property, PropertyStatus, PropertyType } from '../types';
import { ROUTES, DEFAULT_CURRENCY, PROPERTY_STATUS_TRANSLATIONS, PROPERTY_TYPE_TRANSLATIONS, COMMON_TRANSLATIONS } from '../constants';
import { BedIcon, BathIcon, AreaIcon, LocationIcon, HeartIcon, WhatsAppIcon, PhoneIcon } from './IconComponents';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const formatPhoneNumberForLink = (phone: string, type: 'tel' | 'wa'): string => {
  let cleaned = phone.replace(/\D/g, '');
  if (type === 'wa') {
    if (cleaned.length === 8 && ['9', '7', '2'].includes(cleaned.charAt(0))) {
      cleaned = `968${cleaned}`;
    }
    return `https://wa.me/${cleaned}`;
  }
  return `tel:${phone}`;
};

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { isFavorite, toggleFavorite, isLoading: favoritesLoading } = useContext(FavoritesContext);
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (user && !authLoading && !favoritesLoading) {
      toggleFavorite(property.id);
    } else if (!user && !authLoading) {
      alert("Please login to add properties to your favorites."); // TODO: Translate alert
    }
  };

  const handleContactAction = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank');
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', { style: 'currency', currency: DEFAULT_CURRENCY, minimumFractionDigits: 0 }).format(price);
  };

  const displayTitle = language === 'ar' && property.title_ar ? property.title_ar : property.title;
  const displayCity = language === 'ar' && property.city_ar ? property.city_ar : property.city;
  const displayStatus = language === 'ar' ? PROPERTY_STATUS_TRANSLATIONS[property.status] : property.status;
  
  const agentPhone = property.agent?.phone;

  return (
    <Link to={`${ROUTES.PROPERTY_DETAIL}/${property.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl h-full flex flex-col">
        <div className="relative">
          <img 
            src={property.gallery[0] || 'https://picsum.photos/400/300'} 
            alt={displayTitle} 
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} bg-royal-blue text-white text-xs font-semibold px-3 py-1 rounded`}>
            {displayStatus}
          </div>
          
          <div className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} flex space-x-2`}>
            {user && (
              <button
                onClick={handleFavoriteToggle}
                disabled={favoritesLoading || authLoading}
                className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                aria-label={isFavorite(property.id) ? T.favorited : T.favorite}
              >
                <HeartIcon className="w-5 h-5 text-gold-accent" filled={isFavorite(property.id)} />
              </button>
            )}
          </div>
           {property.isFeatured && (
            <div className={`absolute bottom-3 ${language === 'ar' ? 'right-3' : 'left-3'} bg-gold-accent text-royal-blue text-xs font-bold px-3 py-1 rounded`}>
              {language === 'ar' ? 'مميز' : 'FEATURED'}
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-royal-blue mb-1 truncate group-hover:text-gold-accent transition-colors" title={displayTitle}>
            {displayTitle}
          </h3>
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <LocationIcon className={`w-4 h-4 text-gray-400 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
            <span>{displayCity}</span>
          </div>
          <p className="text-2xl font-bold text-royal-blue mb-3">
            {formatPrice(property.price)}
            {property.status === PropertyStatus.RENT && <span className="text-sm font-normal text-gray-500"> {T.perMonth}</span>}
          </p>
          
          <div className="flex flex-wrap text-sm text-gray-600 gap-x-4 gap-y-2 mb-4">
            {property.type !== PropertyType.LAND && (
              <>
                <div className="flex items-center">
                  <BedIcon className={`${language === 'ar' ? 'ml-1' : 'mr-1'} text-royal-blue`} /> {property.bedrooms} {property.bedrooms === 1 ? T.bed : T.beds}
                </div>
                <div className="flex items-center">
                  <BathIcon className={`${language === 'ar' ? 'ml-1' : 'mr-1'} text-royal-blue`} /> {property.bathrooms} {property.bathrooms === 1 ? T.bath : T.baths}
                </div>
              </>
            )}
            <div className="flex items-center">
              <AreaIcon className={`${language === 'ar' ? 'ml-1' : 'mr-1'} text-royal-blue`} /> {property.size.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {language === 'ar' ? 'قدم مربع' : 'sqft'}
            </div>
          </div>

          {agentPhone && (
            <div className="flex space-x-2 mb-3 mt-auto pt-3 border-t border-gray-100">
              <button
                onClick={(e) => handleContactAction(e, formatPhoneNumberForLink(agentPhone, 'wa'))}
                className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-all duration-150 ease-in-out text-xs font-medium flex items-center justify-center shadow-sm hover:shadow-md"
                aria-label={T.messageOnWhatsApp}
              >
                <WhatsAppIcon className={`w-4 h-4 ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} /> {T.messageOnWhatsApp}
              </button>
              <button
                onClick={(e) => handleContactAction(e, formatPhoneNumberForLink(agentPhone, 'tel'))}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all duration-150 ease-in-out text-xs font-medium flex items-center justify-center shadow-sm hover:shadow-md"
                aria-label={T.callAgent}
              >
                <PhoneIcon className={`w-4 h-4 ${language === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} /> {T.callAgent}
              </button>
            </div>
          )}
          
          <div className={`mt-auto ${!agentPhone ? 'pt-3 border-t border-gray-100' : ''}`}>
            <p className="text-xs text-gray-400">
              {T.added}: {new Date(property.dateAdded).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
