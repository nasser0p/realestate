
import React from 'react';
import { LocationIcon } from './IconComponents';

interface MapPlaceholderProps {
  address?: string;
}

const MapPlaceholder: React.FC<MapPlaceholderProps> = ({ address }) => {
  return (
    <div className="w-full h-72 md:h-96 bg-medium-gray rounded-lg flex flex-col items-center justify-center text-center p-4 shadow">
      <LocationIcon className="w-16 h-16 text-gray-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Location Map</h3>
      {address && <p className="text-sm text-gray-600 mb-1">Address: {address}</p>}
      <p className="text-sm text-gray-500">(Map integration placeholder - e.g., Leaflet.js or Google Maps)</p>
    </div>
  );
};

export default MapPlaceholder;
