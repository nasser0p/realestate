
import React, { useState, useEffect } from 'react';
import { MOCK_CONTENT_PAGES } from '../data';
import { ContentPageData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';

const AboutUsPage: React.FC = () => {
  const [pageData, setPageData] = useState<ContentPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const data = MOCK_CONTENT_PAGES.find(p => p.slug === 'about-us');
      setPageData(data || null);
      setIsLoading(false);
    }, 300);
  }, []);

  const displayTitle = language === 'ar' && pageData?.title_ar ? pageData.title_ar : pageData?.title;
  const displayContent = language === 'ar' && pageData?.content_ar ? pageData.content_ar : pageData?.content;

  if (isLoading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[50vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }

  if (!pageData) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[50vh]">
        <h1 className="text-3xl font-bold text-royal-blue mb-6 font-display">{T.aboutUs}</h1>
        <p className="text-gray-600">{language === 'ar' ? 'المحتوى لهذه الصفحة غير متوفر حاليًا.' : 'Content for this page is not available at the moment.'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-royal-blue mb-8 font-display text-center">{displayTitle}</h1>
        <div className="max-w-3xl mx-auto bg-light-gray p-6 md:p-8 rounded-lg shadow-lg">
          <article className="prose prose-lg lg:prose-xl max-w-none text-gray-700">
            {displayContent?.split('\\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
          {pageData.lastUpdated && (
            <p className="text-xs text-gray-500 mt-8 text-right">
              {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(pageData.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
