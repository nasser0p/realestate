import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Property, PropertyStatus, PropertyType } from '../types';
// MOCK_PROPERTIES removed, data comes from Firebase
import LoadingSpinner from '../components/LoadingSpinner';
import PropertyGallery from '../components/PropertyGallery';
import MapPlaceholder from '../components/MapPlaceholder';
import { BedIcon, BathIcon, AreaIcon, ParkingIcon, CalendarIcon, LocationIcon, HeartIcon, ShareIcon, WhatsAppIcon, PhoneIcon } from '../components/IconComponents';
import { DEFAULT_CURRENCY, ROUTES, COMMON_TRANSLATIONS, PROPERTY_STATUS_TRANSLATIONS, PROPERTY_TYPE_TRANSLATIONS } from '../constants';
import NotFoundPage from './NotFoundPage';
import { FavoritesContext } from '../contexts/FavoritesContext';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

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

const PropertyDetailsPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const { isFavorite, toggleFavorite, isLoading: favoritesLoading } = useContext(FavoritesContext);
  const { user, isLoading: authLoading } = useContext(AuthContext);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      if (!propertyId) {
        setProperty(null);
        setIsLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'properties', propertyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProperty({ 
            id: docSnap.id, 
            ...data,
            // Ensure dateAdded is a Date object or string for consistent handling
            dateAdded: data.dateAdded instanceof Timestamp ? data.dateAdded.toDate() : new Date(data.dateAdded),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
           } as Property);
        } else {
          setProperty(null); // Property not found
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
        setProperty(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);


  const handleFavoriteToggle = async () => {
    if (property && user && !authLoading && !favoritesLoading) {
      await toggleFavorite(property.id);
    } else if (!user && !authLoading) {
      alert(language === 'ar' ? "الرجاء تسجيل الدخول لإضافة العقارات إلى المفضلة." : "Please login to add properties to your favorites.");
    }
  };

  const handleShare = () => {
    const shareTitle = language === 'ar' && property?.title_ar ? property.title_ar : property?.title;
    if (navigator.share && property) {
      navigator.share({
        title: shareTitle,
        text: language === 'ar' ? `تحقق من هذا العقار: ${shareTitle}` : `Check out this property: ${shareTitle}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert(language === 'ar' ? "تم نسخ الرابط إلى الحافظة!" : "Link copied to clipboard!"))
        .catch(() => alert(language === 'ar' ? "لا يمكن نسخ الرابط." : "Could not copy link."));
    }
  };
  
  const formatDate = (dateInput: Date | Timestamp | string | undefined): string => {
    if (!dateInput) return T.loading;
    let date: Date;
    if (dateInput instanceof Timestamp) {
        date = dateInput.toDate();
    } else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else {
        date = dateInput as Date; // Assume it's already a Date object
    }
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
};


  if (isLoading || property === undefined) {
    return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }

  if (!property) {
    return <NotFoundPage message={language === 'ar' ? "العقار غير موجود." : "Property not found."} />;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', { style: 'currency', currency: DEFAULT_CURRENCY, minimumFractionDigits: 0 }).format(price);
  };

  const PropertySpecItem: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center p-3 bg-light-gray rounded-lg text-center shadow-sm">
      <div className="text-royal-blue mb-1">{icon}</div>
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-md font-semibold text-royal-blue">{value}</span>
    </div>
  );
  
  const displayTitle = language === 'ar' && property.title_ar ? property.title_ar : property.title;
  const displayAddress = language === 'ar' && property.location.address_ar ? property.location.address_ar : property.location.address;
  const displayCity = language === 'ar' && property.city_ar ? property.city_ar : property.city;
  const displayDescription = language === 'ar' && property.description_ar ? property.description_ar : property.description;
  const displayStatus = language === 'ar' ? PROPERTY_STATUS_TRANSLATIONS[property.status] : property.status;
  const displayType = language === 'ar' ? PROPERTY_TYPE_TRANSLATIONS[property.type] : property.type;
  
  const displayAmenities = (language === 'ar' && property.amenities_ar) ? property.amenities_ar : property.amenities;

  const agentName = (language === 'ar' && property.agent?.name_ar) ? property.agent.name_ar : property.agent?.name;
  const agentPhone = property.agent?.phone;

  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="text-sm text-royal-blue hover:underline mb-2 sm:mb-0"
                >
                    {T.backToListings}
                </button>
                <h1 className="text-3xl md:text-4xl font-bold text-royal-blue font-display">{displayTitle}</h1>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <LocationIcon className={`w-4 h-4 text-gray-400 ${language === 'ar' ? 'ml-1' : 'mr-1'}`} />
                    <span>{displayAddress}, {displayCity}</span>
                </div>
            </div>
            <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                {user && (
                    <button
                    onClick={handleFavoriteToggle}
                    disabled={favoritesLoading || authLoading || isLoading} // Disable while any loading state is true
                    className={`p-2 rounded-full border flex items-center transition-colors ${isFavorite(property.id) ? 'bg-gold-accent text-royal-blue border-gold-accent' : 'bg-white text-gray-600 border-medium-gray hover:border-royal-blue hover:text-royal-blue'}`}
                    aria-label={isFavorite(property.id) ? T.favorited : T.favorite}
                    >
                    <HeartIcon className="w-5 h-5" filled={isFavorite(property.id)} /> 
                    <span className={`ml-2 text-sm hidden sm:inline ${language === 'ar' ? 'mr-2 ml-0' : 'ml-2'}`}>{isFavorite(property.id) ? T.favorited : T.favorite}</span>
                    </button>
                )}
                <button
                    onClick={handleShare}
                    className="p-2 rounded-full border bg-white text-gray-600 border-medium-gray hover:border-royal-blue hover:text-royal-blue flex items-center transition-colors"
                    aria-label={T.share}
                >
                    <ShareIcon className="w-5 h-5" />
                    <span className={`ml-2 text-sm hidden sm:inline ${language === 'ar' ? 'mr-2 ml-0' : 'ml-2'}`}>{T.share}</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <PropertyGallery images={property.gallery} altText={displayTitle} />
          </div>
          <div className="lg:col-span-1 bg-light-gray p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-2xl font-bold text-royal-blue mb-1">
              {formatPrice(property.price)}
              {property.status === PropertyStatus.RENT && <span className="text-sm font-normal text-gray-500"> {T.perMonth}</span>}
            </h2>
            <span className="text-sm bg-royal-blue text-white px-3 py-1 rounded inline-block mb-4">{displayStatus} - {displayType}</span>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {property.type !== PropertyType.LAND && (
                <>
                <PropertySpecItem icon={<BedIcon />} label={T.bedrooms} value={`${property.bedrooms}`} />
                <PropertySpecItem icon={<BathIcon />} label={T.baths} value={`${property.bathrooms}`} />
                </>
              )}
              <PropertySpecItem icon={<AreaIcon />} label={T.areaSqft} value={`${property.size.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}`} />
              {property.type !== PropertyType.LAND && (
                <PropertySpecItem icon={<ParkingIcon />} label={T.parking} value={`${property.parking}`} />
              )}
              <PropertySpecItem icon={<CalendarIcon />} label={T.listedOn} value={formatDate(property.dateAdded)} />
            </div>

            {property.agent && (
              <div className="mt-auto pt-4 border-t border-medium-gray">
                <h3 className="text-lg font-semibold text-royal-blue mb-2">{T.contactAgent}</h3>
                <p className="text-sm text-gray-700"><strong>{agentName}</strong></p>
                {property.agent.email && <p className="text-sm text-gray-600">{T.email}: <a href={`mailto:${property.agent.email}`} className="text-royal-blue hover:underline">{property.agent.email}</a></p>}
                {agentPhone && <p className="text-sm text-gray-600">{T.phone}: <a href={formatPhoneNumberForLink(agentPhone, 'tel')} className="text-royal-blue hover:underline">{agentPhone}</a></p>}
                
                {agentPhone && (
                  <div className="flex flex-col space-y-2 mt-3">
                    <a
                      href={formatPhoneNumberForLink(agentPhone, 'wa')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-green-500 text-white py-2.5 px-4 rounded-md hover:bg-green-600 transition-colors font-semibold text-sm flex items-center justify-center"
                    >
                      <WhatsAppIcon className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {T.messageOnWhatsApp}
                    </a>
                    <a
                      href={formatPhoneNumberForLink(agentPhone, 'tel')}
                      className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-md hover:bg-blue-600 transition-colors font-semibold text-sm flex items-center justify-center"
                    >
                      <PhoneIcon className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {T.callAgent}
                    </a>
                  </div>
                )}
              </div>
            )}
            {!property.agent && (
                 <button className="mt-auto w-full bg-royal-blue text-white py-3 rounded-md hover:bg-opacity-90 transition-colors font-semibold text-lg">
                    {T.requestDetails}
                </button>
            )}
          </div>
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-royal-blue mb-3 font-display">{T.propertyDescription}</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{displayDescription}</p>
        </div>

        {displayAmenities && displayAmenities.length > 0 && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-royal-blue mb-4 font-display">{T.amenities}</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {displayAmenities.map(amenity => (
                <li key={amenity} className="flex items-center text-gray-700 text-sm">
                  <span className={`text-gold-accent ${language === 'ar' ? 'ml-2' : 'mr-2'}`}>&#10003;</span> {amenity}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {property.floorPlanUrl && (
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-royal-blue mb-4 font-display">{T.floorPlan}</h3>
            <div className="flex justify-center">
              <img src={property.floorPlanUrl} alt={T.floorPlan} className="max-w-full h-auto rounded-md border border-medium-gray" />
            </div>
          </div>
        )}

        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-royal-blue mb-4 font-display">{T.location}</h3>
          <MapPlaceholder address={displayAddress} />
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsPage;