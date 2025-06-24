import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyStatus, PropertyType, City } from '../types';
import { CITIES } from '../data';
import { ROUTES, PROPERTY_STATUS_TRANSLATIONS, PROPERTY_TYPE_TRANSLATIONS, COMMON_TRANSLATIONS } from '../constants';
import { SearchIcon } from './IconComponents';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  onSearch?: (criteria: { searchTerm?: string; status?: PropertyStatus; type?: PropertyType; city?: string }) => void;
  inline?: boolean;
  onSearchExecuted?: () => void; // New prop
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, inline = false, onSearchExecuted }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<PropertyStatus | ''>('');
  const [type, setType] = useState<PropertyType | ''>('');
  const [city, setCity] = useState<string>('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set('q', searchTerm);
    if (status) queryParams.set('status', status);
    if (type) queryParams.set('type', type);
    if (city) queryParams.set('city', city);
    
    navigate(`${ROUTES.PROPERTIES}?${queryParams.toString()}`);
    
    if (onSearch) {
      onSearch({ searchTerm: searchTerm || undefined, status: status || undefined, type: type || undefined, city: city || undefined });
    }
    if (onSearchExecuted) {
      onSearchExecuted();
    }
  };

  const baseInputClass = "p-3 border border-medium-gray rounded-md focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-shadow";
  const selectClass = `${baseInputClass} bg-white text-gray-900`;

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`w-full ${inline ? 'flex flex-wrap gap-2 items-center' : 'bg-white p-6 md:p-8 rounded-lg shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end'}`}
    >
      <div className={inline ? 'flex-grow' : 'lg:col-span-2'}>
        {!inline && <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">{T.keywordOrLocation}</label>}
        <input
          type="text"
          id="searchTerm"
          placeholder={T.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${baseInputClass} w-full text-gray-900`}
        />
      </div>

      <div>
        {!inline && <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">{T.status}</label>}
        <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus | '')} className={`${selectClass} w-full`}>
          <option value="">{T.anyStatus}</option>
          {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{language === 'ar' ? PROPERTY_STATUS_TRANSLATIONS[s] : s}</option>)}
        </select>
      </div>

      <div>
        {!inline && <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">{T.type}</label>}
        <select id="type" value={type} onChange={(e) => setType(e.target.value as PropertyType | '')} className={`${selectClass} w-full`}>
          <option value="">{T.anyType}</option>
          {Object.values(PropertyType).map(t => <option key={t} value={t}>{language === 'ar' ? PROPERTY_TYPE_TRANSLATIONS[t] : t}</option>)}
        </select>
      </div>
      
      {!inline && (
         <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">{T.city}</label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className={`${selectClass} w-full`}>
                <option value="">{T.anyCity}</option>
                {CITIES.map(c => <option key={c.id} value={c.name}>{language === 'ar' ? c.name_ar : c.name}</option>)}
            </select>
        </div>
      )}

      <button 
        type="submit" 
        className={`w-full ${inline ? 'p-3' : 'p-3 text-lg h-auto'} bg-royal-blue text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center font-semibold`}
        style={inline ? {} : {minHeight: 'calc(2.25rem + 2px + 1.5rem)'}} // This style was for the non-inline version.
                                                                        // The button inside the drawer will use the SearchBar's non-inline style.
      >
        <SearchIcon className="w-5 h-5 mr-2" />
        {T.search}
      </button>
    </form>
  );
};

export default SearchBar;