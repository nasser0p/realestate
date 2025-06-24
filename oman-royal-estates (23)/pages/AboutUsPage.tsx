
import React, { useState, useEffect } from 'react';
import { ContentPageData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

const AboutUsPage: React.FC = () => {
  const [pageData, setPageData] = useState<ContentPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'content_pages', 'about-us');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<ContentPageData, 'slug' | 'lastUpdated'> & {updatedAt?: Timestamp};
          setPageData({
            slug: 'about-us',
            title: data.title,
            title_ar: data.title_ar,
            content: data.content,
            content_ar: data.content_ar,
            lastUpdated: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          });
        } else {
          console.warn("About Us page content not found in Firestore.");
          setPageData(null);
        }
      } catch (error) {
        console.error("Error fetching About Us page content:", error);
        setPageData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
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
        <p className="text-gray-600">{T.contentNotAvailable}</p>
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
