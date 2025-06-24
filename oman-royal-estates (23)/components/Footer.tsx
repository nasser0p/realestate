
import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, PRIMARY_COLOR_DARK, ROUTES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const appDisplayName = language === 'ar' ? 'عقارات عمان الملكية' : APP_NAME;
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-${PRIMARY_COLOR_DARK} text-white mt-auto`}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-display font-semibold mb-4">{appDisplayName}</h3>
            <p className="text-gray-300 text-sm">
              {language === 'ar' ? 'شريكك الموثوق للعقارات المتميزة في عمان.' : 'Your trusted partner for premium real estate in Oman.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">{language === 'ar' ? 'العقارات' : 'Properties'}</h3>
            <ul className="space-y-2">
              <li><Link to={ROUTES.PROPERTIES} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'جميع العقارات' : 'All Properties'}</Link></li>
              <li><Link to={ROUTES.PROPERTIES + '?status=For+Sale'} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'للبيع' : 'For Sale'}</Link></li>
              <li><Link to={ROUTES.PROPERTIES + '?status=For+Rent'} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'للإيجار' : 'For Rent'}</Link></li>
              <li><Link to={ROUTES.PROPERTIES + '?status=Off-Plan'} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'مشاريع على الخارطة' : 'Off-Plan Projects'}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">{language === 'ar' ? 'الشركة' : 'Company'}</h3>
            <ul className="space-y-2">
              <li><Link to={ROUTES.ABOUT_US} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'معلومات عنا' : 'About Us'}</Link></li>
              <li><Link to={ROUTES.SERVICES} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'خدماتنا' : 'Our Services'}</Link></li>
              <li><Link to={ROUTES.OUR_TEAM} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'فريقنا' : 'Our Team'}</Link></li>
              <li><Link to={ROUTES.CONTACT_US} className="text-gray-300 hover:text-white text-sm">{language === 'ar' ? 'اتصل بنا' : 'Contact Us'}</Link></li>
              {/* Add Blog/Insights link here when implemented */}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-4">{language === 'ar' ? 'معلومات الاتصال' : 'Contact Info'}</h3>
            <p className="text-gray-300 text-sm">{language === 'ar' ? 'مسقط، عمان' : 'Muscat, Oman'}</p>
            <p className="text-gray-300 text-sm">{language === 'ar' ? 'البريد الإلكتروني: info@omanroyalestates.com' : 'Email: info@omanroyalestates.com'}</p>
            <p className="text-gray-300 text-sm">{language === 'ar' ? 'الهاتف: +968 1234 5678' : 'Phone: +968 1234 5678'}</p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} {appDisplayName}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;