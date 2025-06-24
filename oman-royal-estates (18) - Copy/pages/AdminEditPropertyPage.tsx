import React, { useState, useEffect, useCallback, ChangeEvent, DragEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CITIES, AMENITIES, MOCK_TEAM_MEMBERS } from '../data'; // MOCK_PROPERTIES removed, TEAM_MEMBERS still mock
import { Property, PropertyStatus, PropertyType, Amenity as AmenityType, City as CityType, TeamMember, User } from '../types';
import { ROUTES, COMMON_TRANSLATIONS, PROPERTY_STATUS_TRANSLATIONS, PROPERTY_TYPE_TRANSLATIONS, DEFAULT_CURRENCY, MAX_GALLERY_IMAGES, MAX_FILE_SIZE_MB, ALLOWED_IMAGE_TYPES } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFoundPage from './NotFoundPage';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI } from "@google/genai";
import { UploadCloudIcon, CloseIcon } from '../components/IconComponents';
import { db, storage, auth } from '../firebase'; // Firebase services
import { doc, getDoc, setDoc, addDoc, collection, Timestamp, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { AuthContext } from '../contexts/AuthContext'; // To get current user for audit fields if needed

interface GalleryUploadItem {
  id: string; 
  previewUrl: string; 
  file?: File; 
  name?: string; 
  isNewlyAdded?: boolean;
  storagePath?: string; // To store Firebase Storage path for deletion
}

interface FloorPlanUploadItem {
  previewUrl: string;
  file?: File;
  name?: string;
  isNewlyAdded?: boolean;
  storagePath?: string; // To store Firebase Storage path for deletion
}

const getDefaultProperty = (language: 'en' | 'ar'): Omit<Property, 'id' | 'dateAdded' | 'createdAt' | 'updatedAt'> => ({
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

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to extract storage path from URL (simplified, assumes consistent URL structure)
const getPathFromStorageUrl = (url: string): string | null => {
    try {
        const urlObject = new URL(url);
        if (urlObject.hostname === 'firebasestorage.googleapis.com') {
            // Path is usually after /o/ and before ?alt=media
            const pathName = urlObject.pathname;
            const parts = pathName.split('/o/');
            if (parts.length > 1) {
                return decodeURIComponent(parts[1].split('?')[0]);
            }
        }
    } catch (error) {
        console.error("Error parsing storage URL:", error);
    }
    return null;
};


const AdminEditPropertyPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  const isNew = propertyId === 'new';
  const { user } = React.useContext(AuthContext);

  const [initialPropertyData, setInitialPropertyData] = useState<Property | null>(null); // Stores fetched property for editing
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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
  const [city, setCityState] = useState(CITIES[0]?.id || ''); 
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(0);
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [parking, setParking] = useState(0);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  
  const [galleryItems, setGalleryItems] = useState<GalleryUploadItem[]>([]);
  const [floorPlanItem, setFloorPlanItem] = useState<FloorPlanUploadItem | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [floorPlanError, setFloorPlanError] = useState<string | null>(null);
  const [isDraggingGallery, setIsDraggingGallery] = useState(false);
  const [isDraggingFloorPlan, setIsDraggingFloorPlan] = useState(false);

  const [address, setAddress] = useState('');
  const [addressAr, setAddressAr] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentNameAr, setAgentNameAr] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [propertyDateAdded, setPropertyDateAdded] = useState<Timestamp | Date | string | null>(null);


  useEffect(() => {
    const loadProperty = async () => {
      setIsLoading(true);
      const defaults = getDefaultProperty(language);
      if (isNew) {
        setTitle(defaults.title);
        setTitleAr(defaults.title_ar || '');
        // ... (set other defaults)
        setGalleryItems([]);
        setFloorPlanItem(null);
        setInitialPropertyData(null);
        setSelectedAgentId('');
        setPropertyDateAdded(null);
        setIsLoading(false);
      } else if (propertyId) {
        try {
          const docRef = doc(db, 'properties', propertyId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const foundProperty = { id: docSnap.id, ...docSnap.data() } as Property;
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
            
            setGalleryItems(foundProperty.gallery.map(url => ({ 
                id: url, 
                previewUrl: url, 
                name: url.substring(url.lastIndexOf('/') + 1),
                isNewlyAdded: false,
                storagePath: getPathFromStorageUrl(url) || undefined
            })));
            if (foundProperty.floorPlanUrl) {
                setFloorPlanItem({ 
                    previewUrl: foundProperty.floorPlanUrl, 
                    name: foundProperty.floorPlanUrl.substring(foundProperty.floorPlanUrl.lastIndexOf('/') + 1),
                    isNewlyAdded: false,
                    storagePath: getPathFromStorageUrl(foundProperty.floorPlanUrl) || undefined
                });
            } else {
                setFloorPlanItem(null);
            }

            setAddress(foundProperty.location.address);
            setAddressAr(foundProperty.location.address_ar || '');
            setLatitude(foundProperty.location.lat);
            setLongitude(foundProperty.location.lng);
            setIsFeatured(foundProperty.isFeatured || false);
            setAgentName(foundProperty.agent?.name || '');
            setAgentNameAr(foundProperty.agent?.name_ar || '');
            setAgentEmail(foundProperty.agent?.email || '');
            setAgentPhone(foundProperty.agent?.phone || '');
            setSelectedAgentId(''); // Or load if agent is from team and ID is stored
            setPropertyDateAdded(foundProperty.dateAdded);

          } else {
            setInitialPropertyData(null); // Property not found
          }
        } catch (error) {
          console.error("Error fetching property:", error);
          setInitialPropertyData(null);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadProperty();
  }, [propertyId, isNew, language]);

  const handleAmenityChange = (amenityId: string) => {
    setSelectedAmenityIds(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleAgentSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const agentId = event.target.value;
    setSelectedAgentId(agentId);

    if (agentId) {
      const selectedMember = MOCK_TEAM_MEMBERS.find(member => member.id === agentId);
      if (selectedMember) {
        setAgentName(selectedMember.name);
        setAgentNameAr(selectedMember.name_ar || '');
        setAgentEmail(selectedMember.email || '');
        setAgentPhone(selectedMember.phone || '');
      }
    } else { // Clear agent fields if "Select Agent" is chosen
        setAgentName('');
        setAgentNameAr('');
        setAgentEmail('');
        setAgentPhone('');
    }
  };

  const handleGenerateDescription = async (targetLang: 'en' | 'ar') => {
    // ... (same as before)
    if (targetLang === 'en') setIsGeneratingEn(true);
    else setIsGeneratingAr(true);
    setGenerationError(null);

    const currentCityObj = CITIES.find(c => c.id === city);
    const currentAmenities = selectedAmenityIds
      .map(id => AMENITIES.find(a => a.id === id))
      .filter(Boolean)
      .slice(0, 4) 
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
  
  const processFiles = (files: FileList, target: 'gallery' | 'floorPlan'): GalleryUploadItem[] | FloorPlanUploadItem | null => {
    // ... (same as before)
    const newUploads: GalleryUploadItem[] = [];
    let localError = null;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            localError = T.invalidFileType;
            continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            localError = T.fileTooLarge.replace('{max}', MAX_FILE_SIZE_MB.toString());
            continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const newItem: GalleryUploadItem = {
            id: `file-${Date.now()}-${i}`, 
            previewUrl,
            file,
            name: file.name,
            isNewlyAdded: true,
        };
        newUploads.push(newItem);
    }
    
    if (localError) {
        if (target === 'gallery') setGalleryError(localError);
        else setFloorPlanError(localError);
    } else {
        if (target === 'gallery') setGalleryError(null);
        else setFloorPlanError(null);
    }

    if (target === 'gallery') return newUploads;
    if (target === 'floorPlan' && newUploads.length > 0) return newUploads[0] as FloorPlanUploadItem;
    return null;
  };

  const handleGalleryFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // ... (same as before)
     if (event.target.files) {
        const processed = processFiles(event.target.files, 'gallery') as GalleryUploadItem[];
        if (processed && processed.length > 0) {
            setGalleryItems(prev => {
                const combined = [...prev, ...processed];
                if (combined.length > MAX_GALLERY_IMAGES) {
                    setGalleryError(T.maxGalleryImagesReached.replace('{max}', MAX_GALLERY_IMAGES.toString()));
                    return combined.slice(0, MAX_GALLERY_IMAGES);
                }
                return combined;
            });
        }
    }
  };

  const handleFloorPlanFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    // ... (same as before)
    if (event.target.files && event.target.files.length > 0) {
          const processed = processFiles(event.target.files, 'floorPlan') as FloorPlanUploadItem | null;
          if (processed) {
              setFloorPlanItem(processed);
          }
      }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, target: 'gallery' | 'floorPlan') => {
    // ... (same as before)
    event.preventDefault();
    event.stopPropagation();
    if (target === 'gallery') setIsDraggingGallery(false);
    else setIsDraggingFloorPlan(false);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        if (target === 'gallery') {
            const processed = processFiles(event.dataTransfer.files, 'gallery') as GalleryUploadItem[];
             if (processed && processed.length > 0) {
                setGalleryItems(prev => {
                    const combined = [...prev, ...processed];
                    if (combined.length > MAX_GALLERY_IMAGES) {
                        setGalleryError(T.maxGalleryImagesReached.replace('{max}', MAX_GALLERY_IMAGES.toString()));
                        return combined.slice(0, MAX_GALLERY_IMAGES);
                    }
                    return combined;
                });
            }
        } else if (target === 'floorPlan') {
            const processed = processFiles(event.dataTransfer.files, 'floorPlan') as FloorPlanUploadItem | null;
            if (processed) {
                setFloorPlanItem(processed);
            }
        }
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>, target: 'gallery' | 'floorPlan') => {
    // ... (same as before)
    event.preventDefault();
    event.stopPropagation();
    if (target === 'gallery') setIsDraggingGallery(true);
    else setIsDraggingFloorPlan(true);
  };
  
  const handleDragLeave = (event: DragEvent<HTMLDivElement>, target: 'gallery' | 'floorPlan') => {
    // ... (same as before)
    event.preventDefault();
    event.stopPropagation();
     if (target === 'gallery') setIsDraggingGallery(false);
    else setIsDraggingFloorPlan(false);
  };

  const removeGalleryImage = async (idToRemove: string) => {
    const itemToRemove = galleryItems.find(item => item.id === idToRemove);
    if (itemToRemove && itemToRemove.storagePath && !itemToRemove.isNewlyAdded) {
        // This is an existing image from Firebase Storage, delete it
        try {
            const storageRef = ref(storage, itemToRemove.storagePath);
            await deleteObject(storageRef);
        } catch (error) {
            console.error("Error deleting image from Firebase Storage:", error);
            setGalleryError(T.imageUploadError); // Or a more specific error
            // Don't proceed with UI removal if backend deletion fails, or handle differently
            // return; 
        }
    }

    setGalleryItems(prev => prev.filter(item => {
        if (item.id === idToRemove && item.file) { // For newly added files not yet uploaded
            URL.revokeObjectURL(item.previewUrl); 
        }
        return item.id !== idToRemove;
    }));
    if(galleryItems.length - 1 <= MAX_GALLERY_IMAGES) setGalleryError(null);
  };

  const removeFloorPlanImage = async () => {
    if (floorPlanItem) {
        if (floorPlanItem.storagePath && !floorPlanItem.isNewlyAdded) {
            // This is an existing image from Firebase Storage, delete it
            try {
                const storageRef = ref(storage, floorPlanItem.storagePath);
                await deleteObject(storageRef);
            } catch (error) {
                console.error("Error deleting floor plan from Firebase Storage:", error);
                setFloorPlanError(T.imageUploadError); // Or a more specific error
                // return;
            }
        }
        if (floorPlanItem.file) { // For newly added files not yet uploaded
            URL.revokeObjectURL(floorPlanItem.previewUrl); 
        }
    }
    setFloorPlanItem(null);
    setFloorPlanError(null);
  };

  useEffect(() => {
    return () => {
      galleryItems.forEach(item => {
        if (item.file) URL.revokeObjectURL(item.previewUrl);
      });
      if (floorPlanItem && floorPlanItem.file) {
        URL.revokeObjectURL(floorPlanItem.previewUrl);
      }
    };
  }, [galleryItems, floorPlanItem]);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const selectedCityObj = CITIES.find(c => c.id === city);
    let currentPropertyId = isNew ? doc(collection(db, 'properties')).id : propertyId!;

    try {
        // Upload new gallery images
        const uploadedGalleryUrls: string[] = [];
        const finalGalleryItems: GalleryUploadItem[] = [];

        for (const item of galleryItems) {
            if (item.isNewlyAdded && item.file) {
                const filePath = `properties/${currentPropertyId}/gallery/${Date.now()}_${item.file.name}`;
                const downloadURL = await uploadFile(item.file, filePath);
                uploadedGalleryUrls.push(downloadURL);
                finalGalleryItems.push({ ...item, previewUrl: downloadURL, storagePath: filePath, isNewlyAdded: false });
            } else {
                uploadedGalleryUrls.push(item.previewUrl); // Existing URL
                finalGalleryItems.push(item);
            }
        }
        setGalleryItems(finalGalleryItems); // Update state with new storage paths and final URLs


        // Upload new floor plan image
        let finalFloorPlanUrl: string | undefined = floorPlanItem?.previewUrl;
        let finalFloorPlanStoragePath: string | undefined = floorPlanItem?.storagePath;

        if (floorPlanItem && floorPlanItem.isNewlyAdded && floorPlanItem.file) {
            const filePath = `properties/${currentPropertyId}/floorplan/${Date.now()}_${floorPlanItem.file.name}`;
            finalFloorPlanUrl = await uploadFile(floorPlanItem.file, filePath);
            finalFloorPlanStoragePath = filePath;
            setFloorPlanItem({ ...floorPlanItem, previewUrl: finalFloorPlanUrl, storagePath: finalFloorPlanStoragePath, isNewlyAdded: false });
        }


        const propertyDataToSave: Omit<Property, 'id'> = {
            title, title_ar: titleAr, description, description_ar: descriptionAr,
            status, type,
            city: selectedCityObj?.name || '', city_ar: selectedCityObj?.name_ar || '',
            price: Number(price), size: Number(size),
            bedrooms: Number(bedrooms), bathrooms: Number(bathrooms), parking: Number(parking),
            amenities: selectedAmenityIds.map(id => AMENITIES.find(a => a.id === id)?.name || '').filter(Boolean),
            amenities_ar: selectedAmenityIds.map(id => AMENITIES.find(a => a.id === id)?.name_ar || '').filter(Boolean),
            gallery: uploadedGalleryUrls,
            floorPlanUrl: finalFloorPlanUrl,
            location: { address, address_ar: addressAr, lat: Number(latitude), lng: Number(longitude) },
            isFeatured,
            agent: { name: agentName, name_ar: agentNameAr, email: agentEmail, phone: agentPhone },
            dateAdded: initialPropertyData?.dateAdded || serverTimestamp(), // Keep original if editing, else new timestamp
            createdAt: initialPropertyData?.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        if (isNew) {
            await setDoc(doc(db, 'properties', currentPropertyId), propertyDataToSave);
            alert(T.propertyCreatedSuccess);
        } else if (initialPropertyData) {
            await updateDoc(doc(db, 'properties', currentPropertyId), {
                ...propertyDataToSave,
                dateAdded: initialPropertyData.dateAdded, // Ensure dateAdded is not overwritten on update
                createdAt: initialPropertyData.createdAt // Ensure createdAt is not overwritten
            });
            alert(T.propertyUpdatedSuccess);
        }
        navigate(ROUTES.ADMIN.LISTINGS);

    } catch (error) {
        console.error("Error saving property:", error);
        alert(T.propertyUpdateError + `: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsSaving(false);
    }
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
  const dropZoneBaseClass = "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors min-h-[150px]";
  const galleryDropZoneClass = `${dropZoneBaseClass} ${isDraggingGallery ? 'border-royal-blue bg-blue-50' : 'border-gray-300 hover:border-royal-blue'}`;
  const floorPlanDropZoneClass = `${dropZoneBaseClass} ${isDraggingFloorPlan ? 'border-royal-blue bg-blue-50' : 'border-gray-300 hover:border-royal-blue'}`;


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
        {/* Basic Information */}
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

        {/* Price & Size */}
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

        {/* Specifications */}
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

        {/* Amenities */}
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

        {/* Media: Gallery and Floor Plan Uploaders */}
        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.mediaLegend}</legend>
            <div className="space-y-6 mt-2">
                {/* Gallery Uploader */}
                <div>
                    <label className={labelClass}>{T.galleryPreview}</label>
                    <div
                        className={galleryDropZoneClass}
                        onDrop={(e) => handleDrop(e, 'gallery')}
                        onDragOver={(e) => handleDragOver(e, 'gallery')}
                        onDragLeave={(e) => handleDragLeave(e, 'gallery')}
                        onClick={() => document.getElementById('galleryFileInput')?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label={T.dragDropGallery}
                    >
                        <input
                            type="file"
                            id="galleryFileInput"
                            multiple
                            accept={ALLOWED_IMAGE_TYPES.join(',')}
                            onChange={handleGalleryFileChange}
                            className="hidden"
                            disabled={isSaving || galleryItems.length >= MAX_GALLERY_IMAGES}
                        />
                        <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                           {isDraggingGallery ? T.dropFilesHere : T.dragDropGallery}
                        </p>
                        <p className="text-xs text-gray-400">Max {MAX_GALLERY_IMAGES} images, {MAX_FILE_SIZE_MB}MB each</p>
                    </div>
                    {galleryError && <p className="mt-2 text-sm text-red-600">{galleryError}</p>}
                    {galleryItems.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {galleryItems.map((item) => (
                                <div key={item.id} className="relative group aspect-square border rounded-md overflow-hidden shadow-sm">
                                    <img src={item.previewUrl} alt={item.name || 'Gallery image'} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeGalleryImage(item.id)}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label={T.removeImage}
                                        disabled={isSaving}
                                    >
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Floor Plan Uploader */}
                <div>
                    <label className={labelClass}>{T.floorPlanPreview}</label>
                    {floorPlanItem ? (
                         <div className="relative group w-full sm:w-1/2 md:w-1/3 border rounded-md overflow-hidden shadow-sm aspect-video">
                            <img src={floorPlanItem.previewUrl} alt={floorPlanItem.name || 'Floor plan'} className="w-full h-full object-contain bg-gray-50" />
                            <button
                                type="button"
                                onClick={removeFloorPlanImage}
                                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label={T.removeImage}
                                disabled={isSaving}
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className={floorPlanDropZoneClass}
                            onDrop={(e) => handleDrop(e, 'floorPlan')}
                            onDragOver={(e) => handleDragOver(e, 'floorPlan')}
                            onDragLeave={(e) => handleDragLeave(e, 'floorPlan')}
                            onClick={() => document.getElementById('floorPlanFileInput')?.click()}
                            role="button"
                            tabIndex={0}
                            aria-label={T.dragDropFloorPlan}
                        >
                            <input
                                type="file"
                                id="floorPlanFileInput"
                                accept={ALLOWED_IMAGE_TYPES.join(',')}
                                onChange={handleFloorPlanFileChange}
                                className="hidden"
                                disabled={isSaving}
                            />
                             <UploadCloudIcon className="w-10 h-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                                {isDraggingFloorPlan ? T.dropFilesHere : T.dragDropFloorPlan}
                            </p>
                            <p className="text-xs text-gray-400">{MAX_FILE_SIZE_MB}MB max</p>
                        </div>
                    )}
                    {floorPlanError && <p className="mt-2 text-sm text-red-600">{floorPlanError}</p>}
                </div>
            </div>
        </fieldset>
        
        {/* Location */}
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
        
        {/* Agent Details */}
        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.agentDetailsLegend}</legend>
            <div className="mb-4">
              <label htmlFor="selectAgent" className={labelClass}>{T.assignFromTeamLabel}</label>
              <select
                id="selectAgent"
                value={selectedAgentId}
                onChange={handleAgentSelectionChange}
                className={inputClass}
                disabled={isSaving || isGeneratingEn || isGeneratingAr}
              >
                <option value="">{T.selectAgentPrompt}</option>
                {MOCK_TEAM_MEMBERS.map((member: TeamMember) => (
                  <option key={member.id} value={member.id}>
                    {language === 'ar' && member.name_ar ? member.name_ar : member.name}
                    {member.title ? ` (${language === 'ar' && member.title_ar ? member.title_ar : member.title})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        
        {/* Other Settings */}
        <fieldset className="border border-medium-gray p-4 rounded-md">
            <legend className={fieldsetLabelClass}>{T.otherSettingsLegend}</legend>
            <div className="mt-2">
                <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded text-royal-blue focus:ring-gold-accent disabled:opacity-50" disabled={isSaving || isGeneratingEn || isGeneratingAr} />
                    <span>{T.isFeaturedQuestion}</span>
                </label>
            </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-medium-gray">
            {!isNew && initialPropertyData && (
                 <p className="text-xs text-gray-500 mr-auto">
                    {T.idLabel}: <span className="font-mono bg-light-gray p-1 rounded">{initialPropertyData.id}</span> | 
                    {T.addedDateLabel}: {propertyDateAdded instanceof Timestamp ? propertyDateAdded.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : (propertyDateAdded ? new Date(propertyDateAdded.toString()).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : T.loading)}
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