
import React, { useState } from 'react';

interface PropertyGalleryProps {
  images: string[];
  altText: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, altText }) => {
  const [mainImage, setMainImage] = useState(images[0] || 'https://picsum.photos/800/600?text=No+Image');

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 rounded-lg flex items-center justify-center h-96">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md">
        <img 
          src={mainImage} 
          alt={altText} 
          className="w-full h-full object-cover transition-opacity duration-300" 
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setMainImage(img)}
              className={`aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 transition-all
                          ${mainImage === img ? 'ring-2 ring-royal-blue ring-offset-2' : 'opacity-75 hover:opacity-100'}`}
            >
              <img 
                src={img} 
                alt={`${altText} thumbnail ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
