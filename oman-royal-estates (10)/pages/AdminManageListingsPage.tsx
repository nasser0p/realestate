import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_PROPERTIES, deleteMockProperty } from '../data';
import { ROUTES, DEFAULT_CURRENCY, COMMON_TRANSLATIONS } from '../constants';
import { Property, PropertyStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const AdminManageListingsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    setProperties([...MOCK_PROPERTIES]);
  }, []); 

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-OM' : 'en-OM', { style: 'currency', currency: DEFAULT_CURRENCY, minimumFractionDigits: 0 }).format(price);
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (window.confirm(T.confirmDeleteProperty)) {
      const success = deleteMockProperty(propertyId);
      if (success) {
        setProperties([...MOCK_PROPERTIES]); 
        alert(T.propertyDeletedSuccess);
      } else {
        alert(T.propertyDeletedFailed);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-royal-blue font-display">{T.manageListings}</h1>
        <div className="flex space-x-3">
          <Link 
              to={`${ROUTES.ADMIN.EDIT_PROPERTY}/new`}
              className="bg-gold-accent text-royal-blue px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors font-semibold"
          >
              {T.createNewListing}
          </Link>
          <Link 
              to={ROUTES.ADMIN.DASHBOARD} 
              className="text-sm text-royal-blue hover:underline self-center"
          >
              {T.backToDashboard}
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700 mb-6">
          {T.manageListingsInstructions}
          <span className="text-red-500 text-xs block mt-1">{T.adminClientSideNote}</span>
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-light-gray">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.titleLabel}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.cityLabel}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.statusLabel}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.priceLabel}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.agentPhoneLabel}
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.actionsLabel}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties.map((property: Property) => {
                const displayTitle = language === 'ar' && property.title_ar ? property.title_ar : property.title;
                const displayCity = language === 'ar' && property.city_ar ? property.city_ar : property.city;
                const displayStatus = language === 'ar' ? COMMON_TRANSLATIONS.ar[property.status.toLowerCase() as keyof typeof COMMON_TRANSLATIONS.ar] || property.status : property.status;

                return (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={displayTitle}>{displayTitle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{displayCity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === PropertyStatus.SALE ? 'bg-green-100 text-green-800' :
                        property.status === PropertyStatus.RENT ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(property.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.agent?.phone || (language === 'ar' ? 'غير متاح' : 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                      <Link
                        to={`${ROUTES.ADMIN.EDIT_PROPERTY}/${property.id}`}
                        className="text-royal-blue hover:text-gold-accent transition-colors px-3 py-1 bg-medium-gray hover:bg-dark-gray rounded-md"
                      >
                        {T.edit}
                      </Link>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="text-red-600 hover:text-red-800 transition-colors px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md"
                      >
                        {T.delete}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {properties.length === 0 && (
          <p className="text-center text-gray-500 py-4">{T.noPropertiesFound}</p>
        )}
      </div>
    </div>
  );
};

export default AdminManageListingsPage;
