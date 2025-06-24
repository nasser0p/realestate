import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_PROPERTIES, CITIES, AMENITIES, addMockProperty, updateMockProperty } from '../data';
import { Property, PropertyStatus, PropertyType, Amenity as AmenityType, City as CityType } from '../types';
import { ROUTES, COMMON_TRANSLATIONS, PROPERTY_STATUS_TRANSLATIONS, PROPERTY_TYPE_TRANSLATIONS, DEFAULT_CURRENCY } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFoundPage from './NotFoundPage';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";

const getDefaultProperty = (language: 'en' | 'ar'): Omit<Property, 'id' | 'dateAdded'> => ({
  title: '',
  title_ar: '',
  description: '',
  description_ar: '',
  status: PropertyStatus.SALE,
  type: PropertyType.APARTMENT,
  city: CITIES[0]?.name || '',
  city_ar: CITIES[0]?.name_ar || '',
  price: 0,
  size: 0,
  bedrooms: 1,
  bathrooms: 1,
  parking: 0,
  amenities: [],
  amenities_ar: [],
  gallery: [],
  floorPlanUrl: '',
  location: { lat: 0, lng: 0, address: '', address_ar: '' },
  isFeatured: false,
  agent: { name: '', name_ar: '', phone: '', email: '' },
});

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const AdminEditPropertyPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  const isNew = propertyId === 'new';

  const [initialPropertyData, setInitialPropertyData] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // AI Generation State
  const [isGeneratingEn, setIsGeneratingEn] = useState(false);
  const [isGeneratingAr, setIsGeneratingAr] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [status, setStatus] = useState<PropertyStatus>(PropertyStatus.SALE);
  const [type, setType] = useState<PropertyType>(PropertyType.APARTMENT);
  const [city, setCityState] = useState(CITIES[0]?.id || ''); // Store city ID
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(0);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [parking, setParking] = useState(0);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [galleryUrls, setGalleryUrls] = useState(''); 
  const [floorPlanUrl, setFloorPlanUrl] = useState('');
  const [address, setAddress] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentNameAr, setAgentNameAr] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');


  useEffect(() => {
    setIsLoading(true);
    const defaults = getDefaultProperty(language);
    if (isNew) {
      setTitle(defaults.title);
      setTitleAr(defaults.title_ar || '');
      setDescription(defaults.description);
      setDescriptionAr(defaults.description_ar || '');
      setStatus(defaults.status);
      setType(defaults.type);
      setCityState(CITIES.find(c => c.name === defaults.city)?.id || CITIES[0]?.id || '');
      setPrice(defaults.price);
      setSize(defaults.size);
      setBedrooms(defaults.bedrooms);
      setBathrooms(defaults.bathrooms);
      setParking(defaults.parking);
      setSelectedAmenityIds(AMENITIES.filter(am => defaults.amenities.includes(am.name)).map(am => am.id));
      setGalleryUrls(defaults.gallery.join(', '));
      setFloorPlanUrl(defaults.floorPlanUrl || '');
      setAddress(defaults.location.address);
      setAddressAr(defaults.location.address_ar || '');
      setLatitude(defaults.location.lat);
      setLongitude(defaults.location.lng);
      setIsFeatured(defaults.isFeatured || false);
      setAgentName(defaults.agent?.name || '');
      setAgentNameAr(defaults.agent?.name_ar || '');
      setAgentEmail(defaults.agent?.email || '');
      setAgentPhone(defaults.agent?.phone || '');
      setInitialPropertyData(null); 
      setIsLoading(false);
    } else {
      const foundProperty = MOCK_PROPERTIES.find(p => p.id === propertyId);
      if (foundProperty) {
        setInitialPropertyData(foundProperty);
        setTitle(foundProperty.title);
        setTitleAr(foundProperty.title_ar || '');
        setDescription(foundProperty.description);
        setDescriptionAr(foundProperty.description_ar || '');
        setStatus(foundProperty.status);
        setType(foundProperty.type);
        setCityState(CITIES.find(c => c.name === foundProperty.city)?.id || CITIES[0]?.id || '');
        setPrice(foundProperty.price);
        setSize(foundProperty.size);
        setBedrooms(foundProperty.bedrooms);
        setBathrooms(foundProperty.bathrooms);
        setParking(foundProperty.parking);
        setSelectedAmenityIds(AMENITIES.filter(am => foundProperty.amenities.includes(am.name)).map(am => am.id));
        setGalleryUrls(foundProperty.gallery.join(', '));
        setFloorPlanUrl(foundProperty.floorPlanUrl || '');
        setAddress(foundProperty.location.address);
        setAddressAr(foundProperty.location.address_ar || '');
        setLatitude(foundProperty.location.lat);
        setLongitude(foundProperty.location.lng);
        setIsFeatured(foundProperty.isFeatured || false);
        setAgentName(foundProperty.agent?.name || '');
        setAgentNameAr(foundProperty.agent?.name_ar || '');
        setAgentEmail(foundProperty.agent?.email || '');
        setAgentPhone(foundProperty.agent?.phone || '');
      } else {
        setInitialPropertyData(null); 
      }
      setIsLoading(false);
    }
  }, [propertyId, isNew, language]);

  const handleAmenityChange = (amenityId: string) => {
    setSelectedAmenityIds(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleGenerateDescription = async (targetLang: 'en' | 'ar') => {
    if (targetLang === 'en') setIsGeneratingEn(true);
    else setIsGeneratingAr(true);
    setGenerationError(null);

    const currentCityObj = CITIES.find(c => c.id === city);
    const currentAmenities = selectedAmenityIds
      .map(id => AMENITIES.find(a => a.id === id))
      .filter(Boolean)
      .slice(0, 4) // Limit amenities for prompt brevity
      .map(a => (targetLang === 'ar' ? a!.name_ar : a!.name))
      .join(', ');

    let prompt = `You are an expert real estate copywriter. Generate an engaging and persuasive property description of about 3-5 sentences for the following property. Highlight its most attractive features. Use vivid and appealing language. Ensure the tone is professional and inviting. The language of the description must be ${targetLang === 'en' ? 'English' : 'Arabic'}.\n\n`;
    prompt += `Property Details:\n`;
    prompt += `- Type: ${targetLang === 'ar' ? PROPERTY_TYPE_TRANSLATIONS[type as PropertyType] : type}\n`;
    prompt += `- Status: ${targetLang === 'ar' ? PROPERTY_STATUS_TRANSLATIONS[status as PropertyStatus] : status}\n`;
    if (currentCityObj) {
      prompt += `- City: ${targetLang === 'ar' ? currentCityObj.name_ar : currentCityObj.name}\n`;
    }
    if (bedrooms > 0) prompt += `- Bedrooms: ${bedrooms}\n`;
    if (bathrooms > 0) prompt += `- Bathrooms: ${bathrooms}\n`;
    if (size > 0) prompt += `- Size: ${size} sqft\n`;
    if (price > 0) prompt += `- Price: ${DEFAULT_CURRENCY} ${price.toLocaleString()}\n`;
    if (currentAmenities) prompt += `- Key Amenities: ${currentAmenities}\n`;
    if (title && targetLang === 'en') prompt += `- Property Title (for context): ${title}\n`;
    if (titleAr && targetLang === 'ar') prompt += `- Property Title (for context): ${titleAr}\n`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });
      const generatedText = response.text;
      if (targetLang === 'en') {
        setDescription(generatedText);
      } else {
        setDescriptionAr(generatedText);
      }
    } catch (error) {
      console.error("AI Description Generation Error:", error);
      setGenerationError(T.aiGenerationError);
    } finally {
      if (targetLang === 'en') setIsGeneratingEn(false);
      else setIsGeneratingAr(false);
    }
  };


  const handleSave = () => {
    setIsSaving(true);
    const selectedCityObj = CITIES.find(c => c.id === city);

    const propertyData: Omit<Property, 'id' | 'dateAdded'> & { id?: string; dateAdded?: string } = {
      title,
      title_ar: titleAr,
      description,
      description_ar: descriptionAr,
      status,
      type,
      city: selectedCityObj?.name || '',
      city_ar: selectedCityObj?.name_ar || '',
      price: Number(price),
      size: Number(size),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      parking: Number(parking),
      amenities: selectedAmenityIds.map(id => AMENITIES.find(a => a.id === id)?.name || '').filter(Boolean),
      amenities_ar: selectedAmenityIds.map(id => AMENITIES.find(a => a.id === id)?.name_ar || '').filter(Boolean),
      gallery: galleryUrls.split(',').map(url => url.trim()).filter(url => url),
      floorPlanUrl: floorPlanUrl || undefined,
      location: {
        address,
        address_ar: addressAr,
        lat: Number(latitude),
        lng: Number(longitude),
      },
      isFeatured,
      agent: {
        name: agentName,
        name_ar: agentNameAr,
        email: agentEmail,
        phone: agentPhone,
      },
    };

    setTimeout(() => {
      if (isNew) {
        const newProperty: Property = {
          ...propertyData,
          id: Date.now().toString(), 
          dateAdded: new Date().toISOString(), 
        };
        addMockProperty(newProperty);
        alert(T.propertyCreatedSuccess);
        navigate(ROUTES.ADMIN.LISTINGS);
      } else if (initialPropertyData) { 
        const updatedProperty: Property = {
          ...initialPropertyData, 
          ...propertyData,
          id: initialPropertyData.id,
          dateAdded: initialPropertyData.dateAdded,
        };
        const success = updateMockProperty(updatedProperty);
        if (success) {
          alert(T.propertyUpdatedSuccess);
          setInitialPropertyData(updatedProperty); 
          navigate(ROUTES.ADMIN.LISTINGS);
        } else {
          alert(T.propertyUpdateError);
        }
      }
      setIsSaving(false);
    }, 1000);
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex items-center justify-center"><LoadingSpinner text={T.loadingPropertyEditor} /></div>;
  }

  if (!isNew && !initialPropertyData) {
    return <NotFoundPage message={T.propertyNotFoundForEditing.replace('{propertyId}', propertyId || '')} />;
  }
  
  const inputClass = "w-full p-3 border border-medium-gray rounded-md focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-shadow bg-white text-gray-900 disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const fieldsetLabelClass = "text-lg font-semibold text-royal-blue px-2";
  const aiButtonClass = "text-xs px-2 py-1 rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-1";


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-royal-blue font-display">
          {isNew ? T.createNewPropertyTitle : T.editPropertyTitle.replace('{title}', initialPropertyData?.title || '...')}
        </h1>
        <Link 
            to={ROUTES.ADMIN.LISTINGS} 
            className="text-sm text-royal-blue hover:underline"
        >
            {T.backToListings}
        </Link>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-8">
        <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className={fieldsetLabelClass}>{T.basicInformationLegend}</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <label htmlFor="title" className={labelClass}>{T.titleLabel} (EN)</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
            </div>
             <div>
              <label htmlFor="titleAr" className={labelClass}>{T.titleLabel} (AR)</label>
              <input type="text" id="titleAr" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} dir="rtl" />
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>{T.statusLabel}</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr}>
                {Object.values(PropertyStatus).map(s => <option key={s} value={s}>{language === 'ar' ? PROPERTY_STATUS_TRANSLATIONS[s] : s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="type" className={labelClass}>{T.propertyTypeLabel}</label>
              <select id="type" value={type} onChange={(e) => setType(e.target.value as PropertyType)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr}>
                {Object.values(PropertyType).map(t => <option key={t} value={t}>{language === 'ar' ? PROPERTY_TYPE_TRANSLATIONS[t] : t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>{T.cityLabel}</label>
              <select id="city" value={city} onChange={(e) => setCityState(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr}>
                {CITIES.map((c: CityType) => <option key={c.id} value={c.id}>{language === 'ar' ? c.name_ar : c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className={labelClass}>{T.descriptionLabel} (EN)</label>
                <button 
                    type="button" 
                    onClick={() => handleGenerateDescription('en')}
                    disabled={isSaving || isGeneratingEn || isGeneratingAr}
                    className={`${aiButtonClass} ${isGeneratingEn ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-royal-blue text-white hover:bg-opacity-80'}`}
                    aria-label={T.generateWithAI_EN}
                >
                    {isGeneratingEn ? T.generatingDescription : T.generateWithAI_EN}
                </button>
            </div>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr}></textarea>
          </div>
           <div className="mt-6">
             <div className="flex justify-between items-center mb-1">
                <label htmlFor="descriptionAr" className={labelClass}>{T.descriptionLabel} (AR)</label>
                <button 
                    type="button" 
                    onClick={() => handleGenerateDescription('ar')}
                    disabled={isSaving || isGeneratingEn || isGeneratingAr}
                    className={`${aiButtonClass} ${isGeneratingAr ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-royal-blue text-white hover:bg-opacity-80'}`}
                    aria-label={T.generateWithAI_AR}
                >
                    {isGeneratingAr ? T.generatingDescription : T.generateWithAI_AR}
                </button>
            </div>
            <textarea id="descriptionAr" value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} rows={5} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} dir="rtl"></textarea>
          </div>
          {generationError && <p className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded-md">{generationError}</p>}
        </fieldset>

        <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className={fieldsetLabelClass}>{T.priceSizeLegend}</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div>
              <label htmlFor="price" className={labelClass}>{T.priceOMRLabel}</label>
              <input type="number" id="price" value={price} onChange={(e) => setPrice(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} min="0" />
            </div>
            <div>
              <label htmlFor="size" className={labelClass}>{T.sizeSqftLabel}</label>
              <input type="number" id="size" value={size} onChange={(e) => setSize(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} min="0" />
            </div>
          </div>
        </fieldset>

         <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className={fieldsetLabelClass}>{T.specificationsLegend}</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div>
              <label htmlFor="bedrooms" className={labelClass}>{T.bedroomsLabel}</label>
              <input type="number" id="bedrooms" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} min="0" />
            </div>
            <div>
              <label htmlFor="bathrooms" className={labelClass}>{T.bathroomsLabel}</label>
              <input type="number" id="bathrooms" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} min="0" />
            </div>
            <div>
              <label htmlFor="parking" className={labelClass}>{T.parkingSpacesLabel}</label>
              <input type="number" id="parking" value={parking} onChange={(e) => setParking(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} min="0" />
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-medium-gray p-4 rounded-md">
          <legend className={fieldsetLabelClass}>{T.amenitiesLegend}</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-3 mt-2 max-h-60 overflow-y-auto">
            {AMENITIES.map((amenity: AmenityType) => (
              <label key={amenity.id} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAmenityIds.includes(amenity.id)}
                  onChange={() => handleAmenityChange(amenity.id)}
                  className="rounded text-royal-blue focus:ring-gold-accent disabled:opacity-50"
                  disabled={isSaving || isGeneratingEn || isGeneratingAr}
                />
                <span>{language === 'ar' ? amenity.name_ar : amenity.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.mediaLegend}</legend>
            <div className="space-y-6 mt-2">
                <div>
                    <label htmlFor="galleryUrls" className={labelClass}>{T.galleryUrlsLabel}</label>
                    <textarea id="galleryUrls" value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} rows={3} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} placeholder={T.galleryUrlsPlaceholder}></textarea>
                </div>
                <div>
                    <label htmlFor="floorPlanUrl" className={labelClass}>{T.floorPlanUrlLabel}</label>
                    <input type="url" id="floorPlanUrl" value={floorPlanUrl} onChange={(e) => setFloorPlanUrl(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} placeholder={T.floorPlanUrlPlaceholder} />
                </div>
            </div>
        </fieldset>

        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.locationLegend}</legend>
            <div className="space-y-6 mt-2">
                <div>
                    <label htmlFor="address" className={labelClass}>{T.fullAddressLabel} (EN)</label>
                    <input type="text" id="address" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                </div>
                 <div>
                    <label htmlFor="addressAr" className={labelClass}>{T.fullAddressLabel} (AR)</label>
                    <input type="text" id="addressAr" value={addressAr} onChange={(e) => setAddressAr(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} dir="rtl"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="latitude" className={labelClass}>{T.latitudeLabel}</label>
                        <input type="number" step="any" id="latitude" value={latitude} onChange={(e) => setLatitude(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                    </div>
                    <div>
                        <label htmlFor="longitude" className={labelClass}>{T.longitudeLabel}</label>
                        <input type="number" step="any" id="longitude" value={longitude} onChange={(e) => setLongitude(Number(e.target.value))} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                    </div>
                </div>
            </div>
        </fieldset>
        
        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.agentDetailsLegend}</legend>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <div>
                    <label htmlFor="agentName" className={labelClass}>{T.agentNameLabel} (EN)</label>
                    <input type="text" id="agentName" value={agentName} onChange={(e) => setAgentName(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                </div>
                 <div>
                    <label htmlFor="agentNameAr" className={labelClass}>{T.agentNameLabel} (AR)</label>
                    <input type="text" id="agentNameAr" value={agentNameAr} onChange={(e) => setAgentNameAr(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} dir="rtl"/>
                </div>
                <div>
                    <label htmlFor="agentEmail" className={labelClass}>{T.agentEmailLabel}</label>
                    <input type="email" id="agentEmail" value={agentEmail} onChange={(e) => setAgentEmail(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                </div>
                <div>
                    <label htmlFor="agentPhone" className={labelClass}>{T.agentPhoneLabel}</label>
                    <input type="tel" id="agentPhone" value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} className={inputClass} disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                </div>
            </div>
        </fieldset>
        
        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.otherSettingsLegend}</legend>
            <div className="mt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-royal-blue focus:ring-gold-accent disabled:opacity-50" disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                    <span>{T.isFeaturedQuestion}</span>
                </label>
            </div>
        </fieldset>

        <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-medium-gray">
            {!isNew && initialPropertyData && (
                 <p className="text-xs text-gray-500 mr-auto">
                    {T.idLabel}: <span className="font-mono bg-light-gray p-1 rounded">{initialPropertyData.id}</span> | {T.addedDateLabel}: {new Date(initialPropertyData.dateAdded).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                 </p>
            )}
            <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN.LISTINGS)}
                className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors font-semibold"
                disabled={isSaving || isGeneratingEn || isGeneratingAr}
            >
                {T.cancel}
            </button>
            <button
                onClick={handleSave}
                disabled={isSaving || isGeneratingEn || isGeneratingAr}
                className="w-full sm:w-auto bg-gold-accent text-royal-blue px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors font-semibold disabled:opacity-70"
            >
                {isSaving ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-royal-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isNew ? T.creatingButton : T.savingButton}
                    </div>
                ) : (isNew ? T.createPropertyButton : T.saveChanges)}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditPropertyPage;