import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Property, PropertyStatus } from '../types';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS, DEFAULT_CURRENCY, ROUTES } from '../constants';

// Fix for default Leaflet icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface PropertyMapProps {
  properties: Property[];
}

const formatPrice = (price: number, language: 'en' | 'ar') => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: 0,
  }).format(price);
};

const BoundsUpdater: React.FC<{ bounds?: LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      // Check if map is already in the process of fitting bounds to avoid recursive calls or race conditions
      // This is a simple check; more sophisticated checks might involve state if needed.
      if (!map.getBounds().equals(L.latLngBounds(bounds), 0.01)) { // Added a tolerance
         map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [map, bounds]);
  return null;
};

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  const mapRef = useRef<L.Map>(null);

  const validProperties = properties.filter(p => p.location && typeof p.location.lat === 'number' && typeof p.location.lng === 'number');

  const defaultCenter: LatLngExpression = [21.4735, 55.9754]; // Approx center of Oman
  const defaultZoom = 7;

  let bounds: LatLngBoundsExpression | undefined = undefined;
  if (validProperties.length > 0) {
    const lats = validProperties.map(p => p.location.lat);
    const lngs = validProperties.map(p => p.location.lng);
    bounds = [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]];
  }


  return (
    <div className="h-[600px] w-full rounded-lg shadow-lg overflow-hidden" aria-label="Map of properties">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={mapInstance => { 
          mapRef.current = mapInstance; 
          // It's sometimes helpful to invalidate size after the container is definitely visible and sized
          // However, react-leaflet usually handles this. If problems persist, uncomment:
          // setTimeout(() => mapInstance.invalidateSize(), 0);
        }}
        // Removed bounds and boundsOptions from here
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* BoundsUpdater will now solely handle fitting the map to the properties */}
        {bounds && <BoundsUpdater bounds={bounds} />}
        
        {validProperties.map(property => {
          const displayTitle = language === 'ar' && property.title_ar ? property.title_ar : property.title;
          const propertyPrice = formatPrice(property.price, language);
          const perMonthText = property.status === PropertyStatus.RENT ? ` ${T.perMonth}` : '';

          return (
            <Marker 
              key={property.id} 
              position={[property.location.lat, property.location.lng]}
              alt={displayTitle}
            >
              <Popup>
                <div>
                  {property.gallery && property.gallery.length > 0 && (
                    <img src={property.gallery[0]} alt={displayTitle} style={{ maxWidth: '200px', height: 'auto', borderRadius: '4px', marginBottom: '8px' }} />
                  )}
                  <h3>{displayTitle}</h3>
                  <p className="font-semibold text-royal-blue">{propertyPrice}{perMonthText}</p>
                  <Link 
                    to={`${ROUTES.PROPERTY_DETAIL}/${property.id}`} 
                    className="text-sm text-gold-accent hover:underline font-medium"
                  >
                    {T.viewDetails}
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;