import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { addMockTeamMember, updateMockTeamMember } from '../data';
import { CloseIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';

interface AdminTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamMember: TeamMember | null; 
}

const AdminTeamMemberModal: React.FC<AdminTeamMemberModalProps> = ({ isOpen, onClose, teamMember }) => {
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];
  
  const getInitialFormData = (): Partial<TeamMember> => ({
    id: teamMember?.id || '',
    name: teamMember?.name || '',
    name_ar: teamMember?.name_ar || '',
    title: teamMember?.title || '',
    title_ar: teamMember?.title_ar || '',
    photoUrl: teamMember?.photoUrl || '',
    phone: teamMember?.phone || '',
    email: teamMember?.email || '',
    bio: teamMember?.bio || '',
    bio_ar: teamMember?.bio_ar || '',
    linkedinUrl: teamMember?.linkedinUrl || '',
    instagramUrl: teamMember?.instagramUrl || '',
  });

  const [formData, setFormData] = useState<Partial<TeamMember>>(getInitialFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setError(null); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, teamMember]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim() || !formData.title?.trim()) {
      setError(T.nameRequiredError);
      return;
    }
    if (formData.photoUrl && !formData.photoUrl.startsWith('http')) {
        setError(T.photoUrlInvalidError);
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        const memberToSave: TeamMember = {
            id: formData.id || `tm-${Date.now().toString()}`,
            name: formData.name || 'Unnamed',
            name_ar: formData.name_ar,
            title: formData.title || 'Untitled',
            title_ar: formData.title_ar,
            photoUrl: formData.photoUrl || 'https://picsum.photos/seed/newmember/400/400',
            phone: formData.phone,
            email: formData.email,
            bio: formData.bio,
            bio_ar: formData.bio_ar,
            linkedinUrl: formData.linkedinUrl,
            instagramUrl: formData.instagramUrl,
        };

        if (teamMember && formData.id) { 
          updateMockTeamMember(memberToSave);
        } else { 
          addMockTeamMember(memberToSave);
        }
        setIsLoading(false);
        onClose(); 
      } catch (err: any) {
        setError(err.message || T.unexpectedError);
        setIsLoading(false);
      }
    }, 1000);
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
            <label htmlFor="photoUrl" className={labelClass}>{T.photoUrlLabel}</label>
            <input type="url" name="photoUrl" id="photoUrl" value={formData.photoUrl || ''} onChange={handleChange} className={inputClass} placeholder="https://example.com/photo.jpg" disabled={isLoading} />
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
