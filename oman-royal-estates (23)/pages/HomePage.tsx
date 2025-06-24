
import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Property, HomePageSettings } from '../types';
// getHomePageSettings removed as settings now come from Firebase
import { MAX_FEATURED_PROPERTIES, APP_NAME, COMMON_TRANSLATIONS } from '../constants';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchIcon, CloseIcon } from '../components/IconComponents';
import { db } from '../firebase';
import { collection, query, where, orderBy, limit, getDocs, Timestamp, QuerySnapshot, DocumentData, doc, getDoc } from 'firebase/firestore';


const HomePage: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingHero, setIsLoadingHero] = useState(true);
  const [heroSettings, setHeroSettings] = useState<HomePageSettings | null>(null);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  const appNameTranslated = language === 'ar' ? 'عقارات عمان الملكية' : APP_NAME;
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);


  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setIsLoadingFeatured(true);
      try {
        const propertiesCol = collection(db, 'properties');
        const q = query(
          propertiesCol, 
          where('isFeatured', '==', true), 
          orderBy('createdAt', 'desc'), 
          limit(MAX_FEATURED_PROPERTIES)
        );
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const propsList = querySnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                dateAdded: data.dateAdded instanceof Timestamp ? data.dateAdded.toDate() : new Date(data.dateAdded),
                createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
                updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
            } as Property;
        });
        setFeaturedProperties(propsList);
      } catch (error) {
        console.error("Error fetching featured properties:", error);
        setFeaturedProperties([]);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    const loadHeroSettings = async () => {
        setIsLoadingHero(true);
        try {
            const settingsDocRef = doc(db, 'home_settings', 'main');
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                setHeroSettings(docSnap.data() as HomePageSettings);
            } else {
                console.warn("Home settings document 'main' not found. Using defaults or showing nothing.");
                // Optionally set default hero settings if 'main' doc doesn't exist
                setHeroSettings({ mediaType: 'image', mediaUrl: 'https://picsum.photos/seed/default-hero/1920/1080', fallbackImageUrl: '' });
            }
        } catch (error) {
            console.error("Error fetching home hero settings:", error);
            // Fallback to default in case of error
            setHeroSettings({ mediaType: 'image', mediaUrl: 'https://picsum.photos/seed/error-hero/1920/1080', fallbackImageUrl: '' });
        } finally {
            setIsLoadingHero(false);
        }
    };

    fetchFeaturedProperties();
    loadHeroSettings();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-royal-blue text-white py-20 md:py-32 h-[auto] min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center items-center">
        {isLoadingHero || !heroSettings ? (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
            <LoadingSpinner text={T.loading} color="text-white" />
          </div>
        ) : heroSettings.mediaType === 'image' ? (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40" 
            style={{ backgroundImage: `url('${heroSettings.mediaUrl}')` }}
            aria-label="Hero background image"
            role="img"
          ></div>
        ) : (
          <video
            className="absolute z-0 inset-0 w-full h-full object-cover opacity-40"
            src={heroSettings.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={heroSettings.fallbackImageUrl || heroSettings.mediaUrl} 
            onError={(e) => {
              console.error("Video Error:", e);
            }}
          >
            Your browser does not support the video tag.
          </video>
        )}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display mb-6">
            {T.findYourDreamProperty}
          </h1>
          <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto">
            {T.discoverExclusiveListings.replace(APP_NAME, appNameTranslated)}
          </p>
          
          <div className="hidden md:block max-w-3xl mx-auto">
             <SearchBar />
          </div>

          <div className="md:hidden max-w-md mx-auto">
            <button
              onClick={() => setIsSearchDrawerOpen(true)}
              className="w-full bg-gold-accent text-royal-blue px-6 py-3 rounded-lg shadow-md hover:bg-yellow-400 transition-colors font-semibold text-lg flex items-center justify-center"
              aria-label={T.searchProperties}
            >
              <SearchIcon className={`w-5 h-5 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} />
              {T.searchProperties}
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Search Drawer */}
      <div 
        className={`md:hidden fixed inset-0 z-30 ${isSearchDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isSearchDrawerOpen}
      >
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ease-in-out ${isSearchDrawerOpen ? 'bg-opacity-50' : 'bg-opacity-0'}`}
          onClick={() => setIsSearchDrawerOpen(false)}
          tabIndex={-1}
        ></div>
        
        <div 
          className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'} h-full w-full max-w-md bg-light-gray shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
            isSearchDrawerOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-drawer-title"
        >
          <div className="h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-medium-gray bg-white">
                  <h3 id="search-drawer-title" className="text-lg font-semibold text-royal-blue">{T.searchProperties}</h3>
                  <button 
                    onClick={() => setIsSearchDrawerOpen(false)} 
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={T.hideFilters}
                  >
                      <CloseIcon className="w-6 h-6" />
                  </button>
              </div>
              <div className="overflow-y-auto flex-grow p-1">
                <SearchBar onSearchExecuted={() => setIsSearchDrawerOpen(false)} />
              </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <section className="py-12 md:py-20 bg-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-royal-blue text-center mb-4 font-display">{T.featuredProperties}</h2>
          <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
            {T.exploreFeatured}
          </p>
          {isLoadingFeatured ? (
            <LoadingSpinner text={T.loading} />
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">{T.noFeaturedProperties}</p>
          )}
           <div className="text-center mt-12">
            <Link 
              to={ROUTES.PROPERTIES}
              className="bg-royal-blue text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors font-semibold text-lg"
            >
              {T.viewAllProperties}
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action or Info Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-royal-blue mb-4 font-display">{T.whyChoose.replace(APP_NAME, appNameTranslated)}</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {T.whyChooseDesc}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-light-gray rounded-lg shadow">
                <h3 className="text-xl font-semibold text-royal-blue mb-2">{T.expertKnowledge}</h3>
                <p className="text-gray-600 text-sm">{T.expertKnowledgeDesc}</p>
              </div>
              <div className="p-6 bg-light-gray rounded-lg shadow">
                <h3 className="text-xl font-semibold text-royal-blue mb-2">{T.premiumListings}</h3>
                <p className="text-gray-600 text-sm">{T.premiumListingsDesc}</p>
              </div>
              <div className="p-6 bg-light-gray rounded-lg shadow">
                <h3 className="text-xl font-semibold text-royal-blue mb-2">{T.personalizedService}</h3>
                <p className="text-gray-600 text-sm">{T.personalizedServiceDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
