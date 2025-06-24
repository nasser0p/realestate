import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface NotFoundPageProps {
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ message }) => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  
  const displayMessage = message || T.pageNotFoundMessage;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <img src="https://picsum.photos/seed/404page/300/200" alt={language === 'ar' ? 'ضائع' : 'Lost'} className="w-64 h-auto mb-8 rounded-lg shadow-md" />
      <h1 className="text-5xl font-bold text-royal-blue mb-4 font-display">{T.pageNotFoundTitle}</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-md">{displayMessage}</p>
      <Link 
        to={ROUTES.HOME}
        className="bg-royal-blue text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors font-semibold text-lg"
      >
        {T.goToHomepage}
      </Link>
    </div>
  );
};

export default NotFoundPage;
