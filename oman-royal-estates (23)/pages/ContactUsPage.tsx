
import React, { useState, useEffect } from 'react';
import { ContentPageData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { LocationIcon } from '../components/IconComponents';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

const ContactUsPage: React.FC = () => {
  const [pageData, setPageData] = useState<ContentPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const docRef = doc(db, 'content_pages', 'contact-us');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
           const data = docSnap.data() as Omit<ContentPageData, 'slug' | 'lastUpdated'> & {updatedAt?: Timestamp};
           setPageData({
            slug: 'contact-us',
            title: data.title,
            title_ar: data.title_ar,
            content: data.content,
            content_ar: data.content_ar,
            lastUpdated: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          });
        } else {
          console.warn("Contact Us page content not found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching Contact Us page content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend or a service like EmailJS/Formspree
    console.log("Form submitted (mock):", formValues);
    setIsSubmitted(true);
    setFormValues({ name: '', email: '', subject: '', message: '' }); // Reset form
    setTimeout(() => setIsSubmitted(false), 5000); 
  };
  
  const inputClass = "w-full p-3 border border-medium-gray rounded-md focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-shadow bg-white text-gray-900";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  const displayPageTitle = language === 'ar' && pageData?.title_ar ? pageData.title_ar : pageData?.title;
  // Content from Firestore might be structured, e.g. JSON, or a Markdown/HTML string
  // For this example, assuming content is a simple string that might contain newlines for paragraphs.
  const displayPageContent = language === 'ar' && pageData?.content_ar ? pageData.content_ar : pageData?.content;

  if (isLoading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[50vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }
  
  // Extract specific parts from content string if structured (example assumes newlines)
  const contentParts = displayPageContent?.split('\\n\\n') || []; // Split by double newline for main sections
  const contactInfoBlock = contentParts[0] || ''; // First block assumed to be contact details
  const formIntro = contentParts.slice(1).join('\n\n'); // Rest is form intro

  return (
    <div className="bg-light-gray py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-royal-blue mb-10 font-display text-center">{displayPageTitle || T.contactUs}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-royal-blue mb-6">{T.contactFormGetInTouch}</h2>
            {contactInfoBlock.split('\\n').map((line, index) => {
                 if (line.startsWith('**') && line.endsWith('**')) { // Simple bold markdown
                    return <h3 key={index} className="text-lg font-medium text-gray-800 mt-3 mb-1">{line.slice(2,-2)}</h3>;
                  }
                  return <p key={index} className="text-gray-600 leading-relaxed">{line}</p>;
            })}
             <div className="mt-6 pt-6 border-t border-medium-gray">
                <p className="flex items-center text-gray-700 mb-2">
                    <LocationIcon className={`w-5 h-5 text-royal-blue ${language === 'ar' ? 'ml-2' : 'mr-2'}`} /> 
                    <span>{T.contactFormAddressPlaceholder}</span>
                </p>
             </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-semibold text-royal-blue mb-2">{T.contactFormSendUsMessage}</h2>
            {formIntro && <p className="text-gray-600 mb-6 text-sm">{formIntro}</p>}

            {isSubmitted && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                {T.contactFormSubmitted}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className={labelClass}>{T.contactFormFullName}</label>
                <input type="text" name="name" id="name" value={formValues.name} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="email" className={labelClass}>{T.emailAddressLabel}</label>
                <input type="email" name="email" id="email" value={formValues.email} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="subject" className={labelClass}>{T.contactFormSubject}</label>
                <input type="text" name="subject" id="subject" value={formValues.subject} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="message" className={labelClass}>{T.contactFormMessage}</label>
                <textarea name="message" id="message" rows={4} value={formValues.message} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <button 
                  type="submit"
                  className="w-full bg-royal-blue text-white py-3 px-4 rounded-md hover:bg-opacity-90 transition-colors font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue"
                >
                  {T.contactFormSendMessage}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {pageData?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-12 text-center">
            {language === 'ar' ? 'آخر تحديث:' : 'Last updated:'} {new Date(pageData.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ContactUsPage;
