import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import { Property, FilterCriteria, PropertyStatus, PropertyType } from '../types';
import { MOCK_PROPERTIES } from '../data';
import { PROPERTIES_PER_PAGE, COMMON_TRANSLATIONS } from '../constants';
import { FilterIcon, CloseIcon } from '../components/IconComponents';
import { useLanguage } from '../contexts/LanguageContext';

const PropertyListingsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const [allProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  
  const parseQueryFilters = useCallback((): FilterCriteria => {
    const params = new URLSearchParams(location.search);
    return {
      status: params.get('status') as PropertyStatus || undefined,
      type: params.get('type') as PropertyType || undefined,
      city: params.get('city') || undefined,
      minPrice: params.get('minPrice') ? parseFloat(params.get('minPrice')!) : undefined,
      maxPrice: params.get('maxPrice') ? parseFloat(params.get('maxPrice')!) : undefined,
      minSize: params.get('minSize') ? parseFloat(params.get('minSize')!) : undefined,
      maxSize: params.get('maxSize') ? parseFloat(params.get('maxSize')!) : undefined,
      bedrooms: params.get('bedrooms') ? parseInt(params.get('bedrooms')!, 10) : undefined,
      amenities: params.getAll('amenities') || undefined,
    };
  }, [location.search]);

  const [activeFilters, setActiveFilters] = useState<FilterCriteria>(parseQueryFilters());

  useEffect(() => {
    setActiveFilters(parseQueryFilters());
  }, [location.search, parseQueryFilters]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams(location.search);
    const searchTerm = params.get('q')?.toLowerCase();

    let propertiesToFilter = [...allProperties];

    if (searchTerm) {
        propertiesToFilter = propertiesToFilter.filter(p => 
            (language === 'ar' && p.title_ar ? p.title_ar.toLowerCase().includes(searchTerm) : p.title.toLowerCase().includes(searchTerm)) ||
            (language === 'ar' && p.description_ar ? p.description_ar.toLowerCase().includes(searchTerm) : p.description.toLowerCase().includes(searchTerm)) ||
            (language === 'ar' && p.city_ar ? p.city_ar.toLowerCase().includes(searchTerm) : p.city.toLowerCase().includes(searchTerm)) ||
            (language === 'ar' && p.location.address_ar ? p.location.address_ar.toLowerCase().includes(searchTerm) : p.location.address.toLowerCase().includes(searchTerm))
        );
    }
    
    const currentFilters = parseQueryFilters();

    const result = propertiesToFilter.filter(property => {
      if (currentFilters.status && property.status !== currentFilters.status) return false;
      if (currentFilters.type && property.type !== currentFilters.type) return false;
      if (currentFilters.city && property.city !== currentFilters.city) return false;
      if (currentFilters.minPrice && property.price < currentFilters.minPrice) return false;
      if (currentFilters.maxPrice && property.price > currentFilters.maxPrice) return false;
      if (currentFilters.minSize && property.size < currentFilters.minSize) return false;
      if (currentFilters.maxSize && property.size > currentFilters.maxSize) return false;
      if (currentFilters.bedrooms && property.bedrooms < currentFilters.bedrooms) return false;
      if (currentFilters.amenities && currentFilters.amenities.length > 0) {
        if (!currentFilters.amenities.every(a => property.amenities.includes(a))) return false;
      }
      return true;
    });

    setFilteredProperties(result);
    setCurrentPage(1);
    setIsLoading(false);
  }, [allProperties, location.search, parseQueryFilters, language]);


  const handleFilterChange = (newFilters: FilterCriteria) => {
    setActiveFilters(newFilters);
    const queryParams = new URLSearchParams(location.search);
    
    ['status', 'type', 'city', 'minPrice', 'maxPrice', 'minSize', 'maxSize', 'bedrooms'].forEach(key => queryParams.delete(key));
    queryParams.delete('amenities');

    if (newFilters.status) queryParams.set('status', newFilters.status);
    if (newFilters.type) queryParams.set('type', newFilters.type);
    if (newFilters.city) queryParams.set('city', newFilters.city);
    if (newFilters.minPrice) queryParams.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice) queryParams.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.minSize) queryParams.set('minSize', newFilters.minSize.toString());
    if (newFilters.maxSize) queryParams.set('maxSize', newFilters.maxSize.toString());
    if (newFilters.bedrooms) queryParams.set('bedrooms', newFilters.bedrooms.toString());
    if (newFilters.amenities) {
      newFilters.amenities.forEach(a => queryParams.append('amenities', a));
    }
    
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleFilterChangeAndCloseDrawer = (newFilters: FilterCriteria) => {
    handleFilterChange(newFilters);
    // Close drawer if it's open (which means we are on mobile)
    if (showFilterDrawer) {
        setShowFilterDrawer(false);
    }
  };

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return filteredProperties.slice(startIndex, startIndex + PROPERTIES_PER_PAGE);
  }, [filteredProperties, currentPage]);

  const totalPages = Math.ceil(filteredProperties.length / PROPERTIES_PER_PAGE);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 mt-4 p-4 bg-white rounded-lg shadow"> {/* Added mt-4 for spacing from top */}
          <h2 className="text-2xl font-bold text-royal-blue mb-4 font-display">{T.findYourProperty}</h2>
          <SearchBar />
        </div>

        {/* Mobile Filter Toggle Button */}
        <button 
          onClick={() => setShowFilterDrawer(true)}
          className="lg:hidden w-full flex items-center justify-center bg-royal-blue text-white p-3 rounded-md mb-6 hover:bg-opacity-90 transition-colors"
          aria-label={T.showFilters}
        >
          <FilterIcon className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} /> {T.filterProperties}
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Static Filter Panel */}
          <div className="hidden lg:block lg:w-1/4 self-start lg:sticky lg:top-24">
             <FilterPanel 
                initialFilters={activeFilters} 
                onFilterChange={handleFilterChange} 
             />
          </div>

          {/* Property Listings Area */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <LoadingSpinner text={T.loading} />
            ) : filteredProperties.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  {T.showingProperties.replace('{count}', paginatedProperties.length.toString()).replace('{total}', filteredProperties.length.toString())}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <h3 className="text-xl font-semibold text-royal-blue">{T.noPropertiesFound}</h3>
                <p className="text-gray-500 mt-2">{T.tryAdjustingFilters}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <div 
        className={`lg:hidden fixed inset-0 z-30 ${showFilterDrawer ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!showFilterDrawer}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${showFilterDrawer ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={() => setShowFilterDrawer(false)}
          tabIndex={-1}
        ></div>
        
        {/* Panel */}
        <div 
          className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-full max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
            showFilterDrawer ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-panel-title"
        >
          <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-medium-gray">
                  <h3 id="filter-panel-title" className="text-lg font-semibold text-royal-blue">{T.filterProperties}</h3>
                  <button 
                    onClick={() => setShowFilterDrawer(false)} 
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={T.hideFilters}
                  >
                      <CloseIcon className="w-6 h-6" />
                  </button>
              </div>
              <div className="overflow-y-auto flex-grow">
                <FilterPanel 
                  initialFilters={activeFilters} 
                  onFilterChange={handleFilterChangeAndCloseDrawer} 
                />
              </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyListingsPage;