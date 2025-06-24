
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboardPage: React.FC = () => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-royal-blue mb-8 font-display">{T.adminDashboard}</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700 mb-4">
          {T.adminWelcome}
        </p>
        <p className="text-red-500 text-sm mb-6">
          <strong>{T.adminNotePlaceholder.split(':')[0]}:</strong>{T.adminNotePlaceholder.substring(T.adminNotePlaceholder.indexOf(':') + 1)}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to={ROUTES.ADMIN.LISTINGS} className="block p-6 bg-light-gray rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-royal-blue mb-2">{T.manageListings}</h2>
            <p className="text-sm text-gray-600">{T.manageListingsDesc}</p>
          </Link>
           <Link to={ROUTES.ADMIN.HOME_SETTINGS} className="block p-6 bg-light-gray rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-royal-blue mb-2">{T.manageHomePageHero}</h2>
            <p className="text-sm text-gray-600">{T.manageHomePageHeroDesc}</p>
          </Link>
          <Link to={ROUTES.ADMIN.CONTENT_PAGES} className="block p-6 bg-light-gray rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-royal-blue mb-2">{T.manageContentPages}</h2>
            <p className="text-sm text-gray-600">{T.manageContentPagesDesc}</p>
          </Link>
           <Link to={ROUTES.ADMIN.USERS} className="block p-6 bg-light-gray rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-royal-blue mb-2">{T.manageUsers}</h2>
            <p className="text-sm text-gray-600">{T.manageUsersDesc}</p>
          </Link>
          <Link to={ROUTES.ADMIN.CATEGORIES} className="block p-6 bg-light-gray rounded-lg shadow hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-royal-blue mb-2">{T.manageCategories}</h2>
            <p className="text-sm text-gray-600">{T.manageCategoriesDesc}</p>
          </Link>
           <div className="block p-6 bg-gray-200 rounded-lg shadow cursor-not-allowed">
            <h2 className="text-xl font-semibold text-gray-500 mb-2">{T.featuredPropertiesAdmin}</h2>
            <p className="text-sm text-gray-500">{T.featuredPropertiesAdminDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
