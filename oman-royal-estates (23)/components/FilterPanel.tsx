
import React, { useState, useEffect } from 'react';
import { PropertyStatus, PropertyType, FilterCriteria, City, Amenity } from '../types';
import { CITIES, AMENITIES } from '../data';
import { DEFAULT_CURRENCY, COMMON_TRANSLATIONS, PROPERTY_STATUS_TRANSLATIONS, PROPERTY_TYPE_TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface FilterPanelProps {
  initialFilters: FilterCriteria;
  onFilterChange: (filters: FilterCriteria) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ initialFilters, onFilterChange }) => {
  const [filters, setFilters] = useState<FilterCriteria>(initialFilters);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | undefined = value;
    if (type === 'number') {
      processedValue = value === '' ? undefined : parseFloat(value);
    }
    if (value === '') {
        processedValue = undefined;
    }

    setFilters(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleAmenityChange = (amenityName: string) => {
    setFilters(prev => {
      const currentAmenities = prev.amenities || [];
      const newAmenities = currentAmenities.includes(amenityName)
        ? currentAmenities.filter(a => a !== amenityName)
        : [...currentAmenities, amenityName];
      return { ...prev, amenities: newAmenities.length > 0 ? newAmenities : undefined };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    const emptyFilters: FilterCriteria = { amenities: [] };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const inputClass = "p-2 border border-medium-gray rounded-md focus:ring-royal-blue focus:border-royal-blue outline-none";
  const selectInputClass = `${inputClass} bg-white w-full`;
  const textInputClass = `${inputClass} w-full`;
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-semibold text-royal-blue mb-4 border-b pb-2">{T.filterProperties}</h3>
      
      <div>
        <label htmlFor="status" className={labelClass}>{T.status}</label>
        <select id="status" name="status" value={filters.status || ''} onChange={handleInputChange} className={selectInputClass}>
          <option value="">{T.anyStatus}</option>
          {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{language === 'ar' ? PROPERTY_STATUS_TRANSLATIONS[s] : s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="type" className={labelClass}>{T.type}</label>
        <select id="type" name="type" value={filters.type || ''} onChange={handleInputChange} className={selectInputClass}>
          <option value="">{T.anyType}</option>
          {Object.values(PropertyType).map(t => <option key={t} value={t}>{language === 'ar' ? PROPERTY_TYPE_TRANSLATIONS[t] : t}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="city" className={labelClass}>{T.city}</label>
        <select id="city" name="city" value={filters.city || ''} onChange={handleInputChange} className={selectInputClass}>
          <option value="">{T.anyCity}</option>
          {CITIES.map(c => <option key={c.id} value={c.name}>{language === 'ar' ? c.name_ar : c.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>{T.priceRange.replace('{DEFAULT_CURRENCY}', DEFAULT_CURRENCY)}</label>
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <input type="number" name="minPrice" placeholder={T.minPrice} value={filters.minPrice || ''} onChange={handleInputChange} className={`${textInputClass} sm:w-1/2`} min="0" />
          <input type="number" name="maxPrice" placeholder={T.maxPrice} value={filters.maxPrice || ''} onChange={handleInputChange} className={`${textInputClass} sm:w-1/2`} min="0" />
        </div>
      </div>

      <div>
        <label className={labelClass}>{T.sizeSqft}</label>
        <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <input type="number" name="minSize" placeholder={T.minSize} value={filters.minSize || ''} onChange={handleInputChange} className={`${textInputClass} sm:w-1/2`} min="0" />
          <input type="number" name="maxSize" placeholder={T.maxSize} value={filters.maxSize || ''} onChange={handleInputChange} className={`${textInputClass} sm:w-1/2`} min="0" />
        </div>
      </div>
      
      <div>
        <label htmlFor="bedrooms" className={labelClass}>{T.bedrooms}</label>
        <select id="bedrooms" name="bedrooms" value={filters.bedrooms || ''} onChange={handleInputChange} className={selectInputClass}>
            <option value="">{T.any}</option>
            {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}{num === 6 ? '+' : ''} {num === 1 ? T.bed : T.beds}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>{T.amenities}</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
          {AMENITIES.map(amenity => (
            <label key={amenity.id} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities?.includes(amenity.name) || false}
                onChange={() => handleAmenityChange(amenity.name)}
                className="rounded text-royal-blue focus:ring-gold-accent"
              />
              <span>{language === 'ar' ? amenity.name_ar : amenity.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
        <button type="submit" className="w-full bg-royal-blue text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors font-semibold">
          {T.applyFilters}
        </button>
        <button type="button" onClick={handleReset} className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-semibold">
          {T.resetFilters}
        </button>
      </div>
    </form>
  );
};

export default FilterPanel;
