
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { APP_NAME, PRIMARY_COLOR_DARK, ROUTES, COMMON_TRANSLATIONS } from '../constants'; // Added COMMON_TRANSLATIONS
import { AuthContext } from '../contexts/AuthContext';
import { UserCircleIcon, MenuIcon, CloseIcon, HeartIcon, ChevronDownIcon } from './IconComponents';
import AuthModal from './AuthModal';
import { useLanguage } from '../contexts/LanguageContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { language, toggleLanguage } = useLanguage();
  const T = COMMON_TRANSLATIONS[language]; // Use T for translations
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const appDisplayName = language === 'ar' ? T.arAppName : APP_NAME;
  const isAdmin = user && user.email === 'admin@example.com';

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
    setIsCompanyDropdownOpen(false);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const toggleCompanyDropdown = () => setIsCompanyDropdownOpen(!isCompanyDropdownOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
      isActive ? 'bg-white text-royal-blue' : 'text-gray-200 hover:bg-white hover:text-royal-blue'
    }`;
  
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ease-in-out ${
    isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }`;

  const companyDropdownLinkClass = `block px-4 py-2 text-sm text-gray-700 hover:bg-light-gray hover:text-royal-blue w-full text-left`;
  
  const languageButtonClass = "text-gray-200 hover:bg-white hover:text-royal-blue px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold-accent";


  return (
    <>
      <nav className={`bg-${PRIMARY_COLOR_DARK} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to={ROUTES.HOME} className="flex-shrink-0">
                <span className="text-white text-lg md:text-2xl font-display font-bold leading-tight md:leading-normal">
                  {appDisplayName}
                </span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to={ROUTES.HOME} className={navLinkClass}>{T.home}</NavLink>
                <NavLink to={ROUTES.PROPERTIES} className={navLinkClass}>{T.properties}</NavLink>
                <NavLink to={ROUTES.PROPERTIES + '?status=For+Sale'} className={navLinkClass}>{T.forSale}</NavLink>
                <NavLink to={ROUTES.PROPERTIES + '?status=For+Rent'} className={navLinkClass}>{T.forRent}</NavLink>
                <NavLink to={ROUTES.PROPERTIES + '?status=Off-Plan'} className={navLinkClass}>{T.offPlan}</NavLink>
                
                <div className="relative" ref={companyDropdownRef}>
                  <button
                    onClick={toggleCompanyDropdown}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out ${isCompanyDropdownOpen ? 'bg-white text-royal-blue' : 'text-gray-200 hover:bg-white hover:text-royal-blue'}`}
                  >
                    {T.company} <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCompanyDropdownOpen && (
                    <div className={`absolute ${language==='ar' ? 'left-0' : 'right-0'} mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20`}>
                      <NavLink to={ROUTES.ABOUT_US} className={companyDropdownLinkClass} onClick={() => setIsCompanyDropdownOpen(false)}>{T.aboutUs}</NavLink>
                      <NavLink to={ROUTES.SERVICES} className={companyDropdownLinkClass} onClick={() => setIsCompanyDropdownOpen(false)}>{T.ourServices}</NavLink>
                      <NavLink to={ROUTES.OUR_TEAM} className={companyDropdownLinkClass} onClick={() => setIsCompanyDropdownOpen(false)}>{T.ourTeam}</NavLink>
                      <NavLink to={ROUTES.CONTACT_US} className={companyDropdownLinkClass} onClick={() => setIsCompanyDropdownOpen(false)}>{T.contactUs}</NavLink>
                    </div>
                  )}
                </div>

                {user && (
                  <NavLink to={ROUTES.FAVORITES} className={navLinkClass}>
                    <div className="flex items-center">
                      <HeartIcon className="w-5 h-5 mr-1" /> {T.favorites}
                    </div>
                  </NavLink>
                )}
                {isAdmin && (
                  <NavLink to={ROUTES.ADMIN.DASHBOARD} className={navLinkClass}>
                    {T.adminDashboard}
                  </NavLink>
                )}
                 {/* Language Switcher Button - Desktop */}
                <button
                  onClick={toggleLanguage}
                  className={languageButtonClass}
                  aria-label={language === 'en' ? T.switchLanguageToArabic : T.switchLanguageToEnglish}
                  title={language === 'en' ? T.switchLanguageToArabic : T.switchLanguageToEnglish}
                >
                  {language === 'en' ? 'ع' : 'EN'}
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              {user ? (
                <div className="ml-4 flex items-center md:ml-6">
                  <span className={`text-gray-300 text-sm ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>{T.welcome}, {user.email.split('@')[0]}</span>
                  <button
                    onClick={logout}
                    className="bg-gold-accent text-royal-blue hover:bg-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {T.logout}
                  </button>
                </div>
              ) : (
                <div className="ml-4 flex items-center md:ml-6 space-x-2">
                  <button
                    onClick={() => openAuthModal('login')}
                    className="text-gray-200 hover:bg-white hover:text-royal-blue px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {T.login}
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="bg-gold-accent text-royal-blue hover:bg-yellow-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {T.register}
                  </button>
                </div>
              )}
            </div>
            <div className="-mr-2 flex md:hidden">
               <button
                  onClick={toggleLanguage}
                  className={`${languageButtonClass} mr-2`}
                  aria-label={language === 'en' ? T.switchLanguageToArabic : T.switchLanguageToEnglish}
                >
                  {language === 'en' ? 'ع' : 'EN'}
                </button>
              <button
                onClick={toggleMobileMenu}
                type="button"
                className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">{T.openMainMenu}</span>
                {isMobileMenuOpen ? (
                  <CloseIcon className="block h-6 w-6" />
                ) : (
                  <MenuIcon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to={ROUTES.HOME} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.home}</NavLink>
              <NavLink to={ROUTES.PROPERTIES} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.properties}</NavLink>
              <NavLink to={ROUTES.PROPERTIES + '?status=For+Sale'} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.forSale}</NavLink>
              <NavLink to={ROUTES.PROPERTIES + '?status=For+Rent'} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.forRent}</NavLink>
              <NavLink to={ROUTES.PROPERTIES + '?status=Off-Plan'} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.offPlan}</NavLink>
              <NavLink to={ROUTES.ABOUT_US} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.aboutUs}</NavLink>
              <NavLink to={ROUTES.SERVICES} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.ourServices}</NavLink>
              <NavLink to={ROUTES.OUR_TEAM} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.ourTeam}</NavLink>
              <NavLink to={ROUTES.CONTACT_US} className={mobileNavLinkClass} onClick={toggleMobileMenu}>{T.contactUs}</NavLink>
              {user && (
                <NavLink to={ROUTES.FAVORITES} className={mobileNavLinkClass} onClick={toggleMobileMenu}>
                   <div className="flex items-center">
                      <HeartIcon className="w-5 h-5 mr-1" /> {T.favorites}
                    </div>
                </NavLink>
              )}
              {isAdmin && (
                <NavLink to={ROUTES.ADMIN.DASHBOARD} className={mobileNavLinkClass} onClick={toggleMobileMenu}>
                  {T.adminDashboard}
                </NavLink>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
              {user ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <UserCircleIcon className="h-10 w-10 rounded-full text-gray-400" />
                  </div>
                  <div className={`ml-3 ${language === 'ar' ? 'mr-3 ml-0' : 'ml-3'}`}>
                    <div className="text-base font-medium leading-none text-white">{user.email.split('@')[0]}</div>
                    <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                  </div>
                </div>
              ) : null}
              <div className="mt-3 px-2 space-y-1">
                {user ? (
                  <button
                    onClick={() => { logout(); toggleMobileMenu(); }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    {T.logout}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => openAuthModal('login')}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      {T.login}
                    </button>
                    <button
                      onClick={() => openAuthModal('register')}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      {T.register}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {isAuthModalOpen && <AuthModal mode={authMode} onClose={closeAuthModal} onSwitchMode={setAuthMode} />}
    </>
  );
};

export default Header;
