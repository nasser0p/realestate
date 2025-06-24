import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import { ExternalLinkIcon } from '../components/IconComponents'; 
import { useLanguage } from '../contexts/LanguageContext';
import { ContentPageData } from '../types';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminContentManagementPage: React.FC = () => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  const [contentPages, setContentPages] = useState<ContentPageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentPages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const pagesColRef = collection(db, 'content_pages');
      // Typically, content pages might not need an 'order' field but if they do, use it.
      // For now, ordering by slug or title. Let's assume slug is the ID and we can order by that if needed, or by title.
      // Firestore doesn't directly support ordering by document ID if it's auto-generated in a complex way.
      // Let's assume we want to order by title for now, or just fetch them as they are.
      // If a specific order is needed, an 'order' field in Firestore docs would be best.
      const q = query(pagesColRef, orderBy('title', 'asc')); // Example: order by English title
      
      const querySnapshot = await getDocs(q);
      const pagesList = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          slug: docSnap.id, // slug is the document ID
          title: data.title,
          title_ar: data.title_ar,
          content: data.content, // Not strictly needed for this list view, but good to have the full type
          content_ar: data.content_ar,
          lastUpdated: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        } as ContentPageData;
      });
      setContentPages(pagesList);
    } catch (err) {
      console.error("Error fetching content pages:", err);
      setError(language === 'ar' ? 'فشل تحميل صفحات المحتوى.' : 'Failed to load content pages.');
      setContentPages([]);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchContentPages();
  }, [fetchContentPages]);


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
        </p>

        {isLoading ? (
          <LoadingSpinner text={T.loading} />
        ) : error ? (
           <p className="text-red-500 text-center">{error}</p>
        ) : contentPages.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{language === 'ar' ? 'لم يتم العثور على صفحات محتوى.' : 'No content pages found.'}</p>
        ) : (
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
                {contentPages.map((page) => {
                  const displayTitle = language === 'ar' && page.title_ar ? page.title_ar : page.title;
                  let livePageRoute = ROUTES.HOME; // Default to home
                  switch (page.slug) {
                    case 'about-us': livePageRoute += 'about-us'; break;
                    case 'services': livePageRoute += 'services'; break;
                    case 'our-team': livePageRoute += 'our-team'; break;
                    case 'contact-us': livePageRoute += 'contact-us'; break;
                    default: livePageRoute += `content/${page.slug}`; // Fallback for other slugs
                  }

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
                          href={livePageRoute} 
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
        )}
      </div>
    </div>
  );
};

export default AdminContentManagementPage;