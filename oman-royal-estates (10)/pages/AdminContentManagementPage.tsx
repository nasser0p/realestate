import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_CONTENT_PAGES } from '../data';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import { ExternalLinkIcon } from '../components/IconComponents'; 
import { useLanguage } from '../contexts/LanguageContext';

const AdminContentManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-royal-blue font-display">{T.manageContentPagesTitle}</h1>
        <Link 
            to={ROUTES.ADMIN.DASHBOARD} 
            className="text-sm text-royal-blue hover:underline"
        >
            {T.backToDashboard}
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-700 mb-6">
          {T.manageContentPagesInstructions}
          <span className="text-red-500 text-xs block mt-1">{T.adminContentEditingNote}</span>
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-light-gray">
              <tr>
                <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {T.pageTitleLabel}
                </th>
                <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {T.slugLabel}
                </th>
                <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {T.lastUpdatedLabel}
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {T.actionsLabel}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {MOCK_CONTENT_PAGES.map((page) => {
                const displayTitle = language === 'ar' && page.title_ar ? page.title_ar : page.title;
                return (
                <tr key={page.slug}>
                  <td className={`px-6 py-4 whitespace-nowrap ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="text-sm font-medium text-gray-900">{displayTitle}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    <div className="text-sm text-gray-500">/{page.slug}</div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {page.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : (language === 'ar' ? 'غير متاح' : 'N/A')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <Link
                      to={`${ROUTES.ADMIN.EDIT_CONTENT_PAGE}/${page.slug}`}
                      className="text-royal-blue hover:text-gold-accent transition-colors px-3 py-1 bg-medium-gray hover:bg-dark-gray rounded-md"
                    >
                      {T.edit}
                    </Link>
                    <a 
                        href={`#${ROUTES.HOME}${page.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={T.viewLivePage}
                        className="text-gray-500 hover:text-gold-accent transition-colors inline-flex items-center px-2 py-1"
                    >
                        <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminContentManagementPage;
