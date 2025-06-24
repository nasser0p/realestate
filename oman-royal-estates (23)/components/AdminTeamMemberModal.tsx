import React, { useState, useEffect, ChangeEvent } from 'react';
import { TeamMember } from '../types';
import { CloseIcon, UploadCloudIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_MB } from '../constants';
import { db, storage } from '../firebase';
import { doc, setDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface AdminTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMember: TeamMember | null; 
}

interface TeamMemberFormData extends Omit<TeamMember, 'id' | 'photoUrl' | 'createdAt' | 'updatedAt'> {
  id?: string;
  photoUrl?: string;
  photoFile?: File | null;
  currentPhotoStoragePath?: string | null;
  order?: number; // Ensure order is part of the form data type
}

const AdminTeamMemberModal: React.FC<AdminTeamMemberModalProps> = ({ isOpen, onClose, teamMember }) => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  
  const getInitialFormData = (): TeamMemberFormData => ({
    id: teamMember?.id || undefined,
    name: teamMember?.name || '',
    name_ar: teamMember?.name_ar || '',
    title: teamMember?.title || '',
    title_ar: teamMember?.title_ar || '',
    photoUrl: teamMember?.photoUrl || '',
    currentPhotoStoragePath: teamMember?.photoUrl ? getPathFromStorageUrl(teamMember.photoUrl) : null,
    photoFile: null,
    phone: teamMember?.phone || '',
    email: teamMember?.email || '',
    bio: teamMember?.bio || '',
    bio_ar: teamMember?.bio_ar || '',
    linkedinUrl: teamMember?.linkedinUrl || '',
    instagramUrl: teamMember?.instagramUrl || '',
    order: teamMember?.order || 0, // Initialize order
  });

  const [formData, setFormData] = useState<TeamMemberFormData>(getInitialFormData());
  const [photoPreview, setPhotoPreview] = useState<string | null>(teamMember?.photoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      setPhotoPreview(initialData.photoUrl || null);
      setError(null); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teamMember]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'order' ? parseInt(value, 10) || 0 : value }));
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setError(T.invalidFileType);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(T.fileTooLarge.replace('{max}', MAX_FILE_SIZE_MB.toString()));
        return;
      }
      setError(null);
      setFormData(prev => ({ ...prev, photoFile: file, photoUrl: '' })); // Clear existing photoUrl if new file
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const removePhoto = () => {
    if (formData.photoFile && photoPreview) { // New unsaved file
        URL.revokeObjectURL(photoPreview);
    }
    setFormData(prev => ({ ...prev, photoFile: null, photoUrl: '', currentPhotoStoragePath: null }));
    setPhotoPreview(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim() || !formData.title?.trim()) {
      setError(T.nameRequiredError);
      return;
    }
    
    setIsLoading(true);
    try {
      let finalPhotoUrl = formData.photoUrl || '';
      // let finalStoragePath = formData.currentPhotoStoragePath || null; // This line was problematic if photo was removed.

      // Handle photo upload if a new file is selected
      if (formData.photoFile) {
        // If there was an old photo, delete it from storage first
        if (formData.currentPhotoStoragePath && formData.id) { // Only delete if editing and old path exists
            try {
                await deleteObject(ref(storage, formData.currentPhotoStoragePath));
            } catch (delError) {
                console.warn("Old photo deletion failed (might not exist or permissions):", delError);
            }
        }
        const memberIdForPath = formData.id || doc(collection(db, 'team_members')).id; // Use existing ID or generate one for path
        const filePath = `team_photos/${memberIdForPath}/${Date.now()}_${formData.photoFile.name}`;
        const storageRefInstance = ref(storage, filePath);
        await uploadBytes(storageRefInstance, formData.photoFile);
        finalPhotoUrl = await getDownloadURL(storageRefInstance);
        // finalStoragePath = filePath; // Update storage path, not directly stored on TeamMember
      } else if (!finalPhotoUrl && formData.currentPhotoStoragePath && formData.id) { 
        // Photo was removed and was an existing stored image, delete it from storage
         try {
            await deleteObject(ref(storage, formData.currentPhotoStoragePath));
            // finalStoragePath = null; // Clear storage path
          } catch (delError) {
            console.warn("Photo deletion failed during removal:", delError);
          }
      }


      const memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: any, updatedAt?: any } = {
        name: formData.name!,
        name_ar: formData.name_ar,
        title: formData.title!,
        title_ar: formData.title_ar,
        photoUrl: finalPhotoUrl,
        phone: formData.phone,
        email: formData.email,
        bio: formData.bio,
        bio_ar: formData.bio_ar,
        linkedinUrl: formData.linkedinUrl,
        instagramUrl: formData.instagramUrl,
        order: formData.order || 0,
      };

      if (formData.id) { // Editing existing member
        const memberDocRef = doc(db, 'team_members', formData.id);
        await updateDoc(memberDocRef, { ...memberData, updatedAt: serverTimestamp() });
      } else { // Adding new member
        memberData.createdAt = serverTimestamp();
        memberData.updatedAt = serverTimestamp();
        await addDoc(collection(db, 'team_members'), memberData);
      }
      
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      console.error("Error saving team member:", err);
      setError(err.message || T.unexpectedError);
      setIsLoading(false);
    }
  };
  
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-royal-blue focus:border-transparent transition-shadow";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60] transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-royal-blue font-display">
            {teamMember ? T.editTeamMemberModalTitle : T.addTeamMemberModalTitle}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled={isLoading}>
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>{T.nameLabel.replace('*','')} (EN)</label>
            <input type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange} className={inputClass} required disabled={isLoading} />
          </div>
          <div>
            <label htmlFor="name_ar" className={labelClass}>{T.nameLabel.replace('*','')} (AR)</label>
            <input type="text" name="name_ar" id="name_ar" value={formData.name_ar || ''} onChange={handleChange} className={inputClass} disabled={isLoading} dir="rtl"/>
          </div>
          <div>
            <label htmlFor="title" className={labelClass}>{T.roleLabel.replace('*','')} (EN)</label>
            <input type="text" name="title" id="title" value={formData.title || ''} onChange={handleChange} className={inputClass} required disabled={isLoading} />
          </div>
           <div>
            <label htmlFor="title_ar" className={labelClass}>{T.roleLabel.replace('*','')} (AR)</label>
            <input type="text" name="title_ar" id="title_ar" value={formData.title_ar || ''} onChange={handleChange} className={inputClass} disabled={isLoading} dir="rtl"/>
          </div>
          
          <div>
            <label className={labelClass}>{T.photoUrlLabel}</label>
            <div className="mt-1 flex items-center space-x-4">
                {photoPreview ? (
                    <div className="relative group">
                        <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border" />
                        <button type="button" onClick={removePhoto} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={T.removeImage} disabled={isLoading}><CloseIcon className="w-4 h-4"/></button>
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <UploadCloudIcon className="w-10 h-10"/>
                    </div>
                )}
                <input type="file" id="photoFile" accept={ALLOWED_IMAGE_TYPES.join(',')} onChange={handlePhotoChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-royal-blue file:text-white hover:file:bg-opacity-90 disabled:opacity-50" disabled={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className={labelClass}>{T.phone}</label>
              <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>{T.email}</label>
              <input type="email" name="email" id="email" value={formData.email || ''} onChange={handleChange} className={inputClass} disabled={isLoading} />
            </div>
          </div>
           <div>
              <label htmlFor="order" className={labelClass}>{language === 'ar' ? 'الترتيب' : 'Order'}</label>
              <input type="number" name="order" id="order" value={formData.order || 0} onChange={handleChange} className={inputClass} disabled={isLoading} min="0" />
            </div>
          <div>
            <label htmlFor="bio" className={labelClass}>{T.bioLabel} (EN)</label>
            <textarea name="bio" id="bio" rows={3} value={formData.bio || ''} onChange={handleChange} className={inputClass} disabled={isLoading}></textarea>
          </div>
           <div>
            <label htmlFor="bio_ar" className={labelClass}>{T.bioLabel} (AR)</label>
            <textarea name="bio_ar" id="bio_ar" rows={3} value={formData.bio_ar || ''} onChange={handleChange} className={inputClass} disabled={isLoading} dir="rtl"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="linkedinUrl" className={labelClass}>{T.linkedinUrlLabel}</label>
              <input type="url" name="linkedinUrl" id="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} className={inputClass} placeholder={T.linkedinUrlPlaceholder} disabled={isLoading} />
            </div>
            <div>
              <label htmlFor="instagramUrl" className={labelClass}>{T.instagramUrlLabel}</label>
              <input type="url" name="instagramUrl" id="instagramUrl" value={formData.instagramUrl || ''} onChange={handleChange} className={inputClass} placeholder={T.instagramUrlPlaceholder} disabled={isLoading} />
            </div>
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
              {isLoading ? T.savingButton : (teamMember ? T.saveChanges : T.addNewMember.replace('+ ',''))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTeamMemberModal;

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