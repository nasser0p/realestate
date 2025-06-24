
import React, { useState, useEffect } from 'react';
import { ContentPageData, ServiceItem } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

const ServicesPage: React.FC = () => {
  const [pageData, setPageData] = useState<ContentPageData | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    const fetchPageAndServices = async () => {
      setIsLoading(true);
      try {
        // Fetch intro content
        const pageDocRef = doc(db, 'content_pages', 'services');
        const pageDocSnap = await getDoc(pageDocRef);
        if (pageDocSnap.exists()) {
          const data = pageDocSnap.data() as Omit<ContentPageData, 'slug' | 'lastUpdated'> & {updatedAt?: Timestamp};
          setPageData({
            slug: 'services',
            title: data.title,
            title_ar: data.title_ar,
            content: data.content,
            content_ar: data.content_ar,
            lastUpdated: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          });
        } else {
          console.warn("Services page intro content not found.");
        }

        // Fetch services list
        const servicesColRef = collection(db, 'services');
        const q = query(servicesColRef, orderBy('order', 'asc')); // Assuming 'order' field for sorting
        const servicesSnapshot = await getDocs(q);
        const servicesList = servicesSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as ServiceItem));
        setServices(servicesList);

      } catch (error) {
        console.error("Error fetching services page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageAndServices();
  }, []);

  const displayPageTitle = language === 'ar' && pageData?.title_ar ? pageData.title_ar : pageData?.title;
  const displayPageContent = language === 'ar' && pageData?.content_ar ? pageData.content_ar : pageData?.content;

  if (isLoading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[50vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }

  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-royal-blue mb-6 font-display text-center">
          {displayPageTitle || T.ourServices}
        </h1>
        {displayPageContent && (
           <p className="text-lg text-gray-600 mb-10 text-center max-w-3xl mx-auto">
            {displayPageContent.split('\\n').map((paragraph, index) => (
              <span key={index} className="block">{paragraph}</span>
            ))}
          </p>
        )}

        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const displayServiceTitle = language === 'ar' && service.title_ar ? service.title_ar : service.title;
              const displayServiceDescription = language === 'ar' && service.description_ar ? service.description_ar : service.description;
              return (
                <div key={service.id} className="bg-light-gray p-6 rounded-lg shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <img 
                    src={service.iconUrl || 'https://picsum.photos/seed/serviceicon/100/100'} 
                    alt={`${displayServiceTitle} icon`} 
                    className="w-20 h-20 mb-4 object-contain"
                  />
                  <h3 className="text-xl font-semibold text-royal-blue mb-2">{displayServiceTitle}</h3>
                  <p className="text-sm text-gray-600 flex-grow">{displayServiceDescription}</p>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && <p className="text-gray-600 text-center">{T.serviceInfoNotAvailable}</p>
        )}
        
        {pageData?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-12 text-center">
            {language === 'ar' ? 'آخر تحديث لبيانات الصفحة:' : 'Page information last updated:'} {new Date(pageData.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
