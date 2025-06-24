import React, { useState, useEffect, ChangeEvent } from 'react';
import { ServiceItem } from '../types';
import { CloseIcon, UploadCloudIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from '../constants';
import { db, storage } from '../firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface AdminServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
}

interface ServiceFormData extends Omit<ServiceItem, 'id' | 'iconUrl' | 'createdAt' | 'updatedAt'> {
  id?: string;
  iconUrl?: string;
  iconFile?: File | null;
  currentIconStoragePath?: string | null;
  order?: number; // Ensure order is part of the form data type
}

const AdminServiceModal: React.FC<AdminServiceModalProps> = ({ isOpen, onClose, service }) => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const getInitialFormData = (): ServiceFormData => ({
    id: service?.id || undefined,
    title: service?.title || '',
    title_ar: service?.title_ar || '',
    description: service?.description || '',
    description_ar: service?.description_ar || '',
    iconUrl: service?.iconUrl || '',
    currentIconStoragePath: service?.iconUrl ? getPathFromStorageUrl(service.iconUrl) : null,
    iconFile: null,
    order: service?.order || 0, // Initialize order
  });

  const [formData, setFormData] = useState<ServiceFormData>(getInitialFormData());
  const [iconPreview, setIconPreview] = useState<string | null>(service?.iconUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setIconPreview(initialData.iconUrl || null);
      setError(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, service]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value, 10) || 0 : value }));
  };

  const handleIconChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(T.invalidFileType);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { // Max 2MB for icons
        setError(T.fileTooLarge.replace('{max}', MAX_FILE_SIZE_MB.toString()));
        return;
      }
      setError(null);
      setFormData(prev => ({ ...prev, iconFile: file, iconUrl: '' }));
      setIconPreview(URL.createObjectURL(file));
    }
  };
  
  const removeIcon = () => {
    if (formData.iconFile && iconPreview) { // New unsaved file
        URL.revokeObjectURL(iconPreview);
    }
    setFormData(prev => ({ ...prev, iconFile: null, iconUrl: '', currentIconStoragePath: null }));
    setIconPreview(null);
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title?.trim()) {
      setError(T.nameRequiredError.replace('Name and Title', 'Title')); // Adjust error message
      return;
    }

    setIsLoading(true);
    try {
      let finalIconUrl = formData.iconUrl || '';
      // let finalStoragePath = formData.currentIconStoragePath || null; // This line was problematic

      if (formData.iconFile) {
        if (formData.currentIconStoragePath && formData.id) {
            try { await deleteObject(ref(storage, formData.currentIconStoragePath)); } 
            catch (delError) { console.warn("Old icon deletion failed:", delError); }
        }
        const serviceIdForPath = formData.id || doc(collection(db, 'services')).id;
        const filePath = `service_icons/${serviceIdForPath}/${Date.now()}_${formData.iconFile.name}`;
        const storageRefInstance = ref(storage, filePath);
        await uploadBytes(storageRefInstance, formData.iconFile);
        finalIconUrl = await getDownloadURL(storageRefInstance);
        // finalStoragePath = filePath; // Not directly stored on ServiceItem
      } else if (!finalIconUrl && formData.currentIconStoragePath && formData.id) {
         try { 
            await deleteObject(ref(storage, formData.currentIconStoragePath)); 
            // finalStoragePath = null;
        } catch (delError) { console.warn("Icon deletion failed during removal:", delError); }
      }

      const serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: any, updatedAt?: any } = {
        title: formData.title!,
        title_ar: formData.title_ar,
        description: formData.description || '',
        description_ar: formData.description_ar,
        iconUrl: finalIconUrl,
        order: formData.order || 0,
      };

      if (formData.id) {
        const serviceDocRef = doc(db, 'services', formData.id);
        await updateDoc(serviceDocRef, { ...serviceData, updatedAt: serverTimestamp() });
      } else {
        serviceData.createdAt = serverTimestamp();
        serviceData.updatedAt = serverTimestamp();
        await addDoc(collection(db, 'services'), serviceData);
      }
      
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error("Error saving service:", err);
      setError(err.message || T.unexpectedError);
      setIsLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70] transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-royal-blue font-display">
            {service ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit Service') : (language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled={isLoading}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className={labelClass}>{T.titleLabel} (EN)</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className={inputClass} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="title_ar" className={labelClass}>{T.titleLabel} (AR)</label>
            <input type="text" name="title_ar" id="title_ar" value={formData.title_ar || ''} onChange={handleChange} className={inputClass} disabled={isLoading} dir="rtl"/>
          </div>
           <div>
            <label htmlFor="description" className={labelClass}>{T.descriptionLabel} (EN)</label>
            <textarea name="description" id="description" rows={3} value={formData.description || ''} onChange={handleChange} className={inputClass} disabled={isLoading}></textarea>
          </div>
           <div>
            <label htmlFor="description_ar" className={labelClass}>{T.descriptionLabel} (AR)</label>
            <textarea name="description_ar" id="description_ar" rows={3} value={formData.description_ar || ''} onChange={handleChange} className={inputClass} disabled={isLoading} dir="rtl"></textarea>
          </div>
          <div>
            <label className={labelClass}>{language === 'ar' ? 'أيقونة الخدمة' : 'Service Icon'}</label>
            <div className="mt-1 flex items-center space-x-4">
                {iconPreview ? (
                    <div className="relative group">
                        <img src={iconPreview} alt="Icon Preview" className="w-20 h-20 rounded-md object-contain border bg-gray-50" />
                        <button type="button" onClick={removeIcon} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={T.removeImage} disabled={isLoading}><CloseIcon className="w-4 h-4"/></button>
                    </div>
                ) : (
                     <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                        <UploadCloudIcon className="w-10 h-10"/>
                    </div>
                )}
                <input type="file" id="iconFile" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handleIconChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-royal-blue file:text-white hover:file:bg-opacity-90 disabled:opacity-50" disabled={isLoading} />
            </div>
          </div>
           <div>
              <label htmlFor="order" className={labelClass}>{language === 'ar' ? 'الترتيب' : 'Order'}</label>
              <input type="number" name="order" id="order" value={formData.order || 0} onChange={handleChange} className={inputClass} disabled={isLoading} min="0" />
            </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue disabled:opacity-50"
            >
              {T.cancel}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-royal-blue text-white rounded-md text-sm font-medium hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal-blue disabled:opacity-50 flex items-center"
            >
              {isLoading && <LoadingSpinner size="sm" color="text-white" />}
              {isLoading ? T.savingButton : (service ? T.saveChanges : (language === 'ar' ? 'إضافة خدمة' : 'Add Service'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminServiceModal;

function getPathFromStorageUrl(url: string): string | null {
    try {
        const urlObject = new URL(url);
        if (urlObject.hostname === 'firebasestorage.googleapis.com') {
            const pathName = urlObject.pathname;
            const parts = pathName.split('/o/');
            if (parts.length > 1) {
                return decodeURIComponent(parts[1].split('?')[0]);
            }
        }
    } catch (error) {
        // console.warn("Error parsing storage URL for path:", error);
    }
    return null;
}