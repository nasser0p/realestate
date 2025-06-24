
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PropertyListingsPage from './pages/PropertyListingsPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './constants';

// Import new static pages
import AboutUsPage from './pages/AboutUsPage';
import ServicesPage from './pages/ServicesPage';
import TeamPage from './pages/TeamPage';
import ContactUsPage from './pages/ContactUsPage';

// Import new admin pages
import AdminContentManagementPage from './pages/AdminContentManagementPage';
import AdminEditContentPage from './pages/AdminEditContentPage';
import AdminManageListingsPage from './pages/AdminManageListingsPage';
import AdminEditPropertyPage from './pages/AdminEditPropertyPage';
import AdminHomePageSettingsPage from './pages/AdminHomePageSettingsPage'; // New Admin page for Home Hero


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.PROPERTIES} element={<PropertyListingsPage />} />
            <Route path={`${ROUTES.PROPERTY_DETAIL}/:propertyId`} element={<PropertyDetailsPage />} />
            <Route path={ROUTES.FAVORITES} element={<FavoritesPage />} />

            {/* Static Content Pages */}
            <Route path={ROUTES.ABOUT_US} element={<AboutUsPage />} />
            <Route path={ROUTES.SERVICES} element={<ServicesPage />} />
            <Route path={ROUTES.OUR_TEAM} element={<TeamPage />} />
            <Route path={ROUTES.CONTACT_US} element={<ContactUsPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
            <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboardPage />} /> 
            <Route path={ROUTES.ADMIN.LISTINGS} element={<AdminManageListingsPage />} />
            <Route path={`${ROUTES.ADMIN.EDIT_PROPERTY}/:propertyId`} element={<AdminEditPropertyPage />} />
            <Route path={ROUTES.ADMIN.CONTENT_PAGES} element={<AdminContentManagementPage />} />
            <Route path={`${ROUTES.ADMIN.EDIT_CONTENT_PAGE}/:pageSlug`} element={<AdminEditContentPage />} />
            <Route path={ROUTES.ADMIN.HOME_SETTINGS} element={<AdminHomePageSettingsPage />} /> {/* New Route */}


            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;