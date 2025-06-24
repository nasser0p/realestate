import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ContentPageData, TeamMember, ServiceItem } from '../types';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFoundPage from './NotFoundPage';
import AdminTeamMemberModal from '../components/AdminTeamMemberModal'; 
import AdminServiceModal from '../components/AdminServiceModal'; // New modal for services
import { useLanguage } from '../contexts/LanguageContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

const AdminEditContentPage: React.FC = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const [pageData, setPageData] = useState<ContentPageData | null | undefined>(undefined);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableTitleAr, setEditableTitleAr] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [editableContentAr, setEditableContentAr] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  
  // Services State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const isTeamPage = pageSlug === 'our-team';
  const isServicesPage = pageSlug === 'services';

  const fetchPageContent = useCallback(async () => {
    if (!pageSlug) {
        setPageData(null);
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
        const docRef = doc(db, 'content_pages', pageSlug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data() as Omit<ContentPageData, 'slug' | 'lastUpdated'> & {updatedAt?: Timestamp};
            const fetchedPageData = {
                slug: pageSlug,
                title: data.title,
                title_ar: data.title_ar,
                content: data.content,
                content_ar: data.content_ar,
                lastUpdated: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            };
            setPageData(fetchedPageData);
            setEditableTitle(fetchedPageData.title);
            setEditableTitleAr(fetchedPageData.title_ar || '');
            setEditableContent(fetchedPageData.content);
            setEditableContentAr(fetchedPageData.content_ar || '');
        } else {
            setPageData(null); // Page not found in Firestore
            console.warn(`Content page with slug '${pageSlug}' not found.`);
        }
    } catch (error) {
        console.error("Error fetching page content:", error);
        setPageData(null);
    } finally {
        setIsLoading(false);
    }
  }, [pageSlug]);

  const fetchTeamMembers = useCallback(async () => {
    if (!isTeamPage) return;
    setIsLoading(true);
    try {
      const teamColRef = collection(db, 'team_members');
      const q = query(teamColRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setTeamMembers(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as TeamMember)));
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isTeamPage]);

  const fetchServices = useCallback(async () => {
    if (!isServicesPage) return;
    setIsLoading(true);
    try {
      const servicesColRef = collection(db, 'services');
      const q = query(servicesColRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      setServices(snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as ServiceItem)));
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isServicesPage]);

  useEffect(() => {
    fetchPageContent();
    if (isTeamPage) fetchTeamMembers();
    if (isServicesPage) fetchServices();
  }, [pageSlug, fetchPageContent, fetchTeamMembers, fetchServices, isTeamPage, isServicesPage]);


  const handleContentSave = async () => {
    if (!pageData || !pageSlug) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'content_pages', pageSlug);
      await updateDoc(docRef, {
        title: editableTitle,
        title_ar: editableTitleAr,
        content: editableContent,
        content_ar: editableContentAr,
        updatedAt: serverTimestamp(),
      });
      setPageData(prev => prev ? ({ ...prev, title: editableTitle, title_ar: editableTitleAr, content: editableContent, content_ar: editableContentAr, lastUpdated: new Date() }) : null);
      alert(T.genericSaveSuccess.replace('(Client-side mock)', '(Saved to database)'));
    } catch (error) {
      console.error("Error saving content page:", error);
      alert("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  // Team Member Modal Logic
  const openTeamMemberModal = (member: TeamMember | null = null) => {
    setEditingTeamMember(member);
    setIsTeamModalOpen(true);
  };
  const closeTeamMemberModal = () => {
    setIsTeamModalOpen(false);
    setEditingTeamMember(null);
    fetchTeamMembers(); // Refresh list
  };
  const handleDeleteTeamMember = async (memberId: string) => {
    if (window.confirm(T.confirmDeleteTeamMember)) {
      setIsLoading(true);
      try {
        const memberToDelete = teamMembers.find(m => m.id === memberId);
        if (memberToDelete?.photoUrl) {
          const path = getPathFromStorageUrl(memberToDelete.photoUrl);
          if (path) {
            await deleteObject(ref(storage, path)).catch(err => console.warn("Failed to delete member photo from storage:", err));
          }
        }
        await deleteDoc(doc(db, 'team_members', memberId));
        fetchTeamMembers(); // Refresh list
        alert(T.teamMemberDeleted);
      } catch (error) {
        console.error("Error deleting team member:", error);
        alert("Failed to delete team member.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Service Modal Logic
  const openServiceModal = (service: ServiceItem | null = null) => {
    setEditingService(service);
    setIsServiceModalOpen(true);
  };
  const closeServiceModal = () => {
    setIsServiceModalOpen(false);
    setEditingService(null);
    fetchServices(); // Refresh list
  };
  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه الخدمة؟' : 'Are you sure you want to delete this service?')) {
      setIsLoading(true);
      try {
        const serviceToDelete = services.find(s => s.id === serviceId);
        if (serviceToDelete?.iconUrl) {
          const path = getPathFromStorageUrl(serviceToDelete.iconUrl);
          if (path) {
             await deleteObject(ref(storage, path)).catch(err => console.warn("Failed to delete service icon from storage:", err));
          }
        }
        await deleteDoc(doc(db, 'services', serviceId));
        fetchServices(); // Refresh list
        alert(language === 'ar' ? 'تم حذف الخدمة بنجاح.' : 'Service deleted successfully.');
      } catch (error) {
        console.error("Error deleting service:", error);
        alert(language === 'ar' ? 'فشل حذف الخدمة.' : 'Failed to delete service.');
      } finally {
        setIsLoading(false);
      }
    }
  };


  if (isLoading && pageData === undefined) { // Initial loading state for pageData
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex items-center justify-center"><LoadingSpinner text={T.loadingPageEditor} /></div>;
  }

  if (!pageData && !isLoading) { // pageData is null and not loading, means not found
    return <NotFoundPage message={T.contentPageNotFound.replace('{pageSlug}', pageSlug || '')} />;
  }
  
  const inputClass = "w-full p-3 border border-medium-gray rounded-md focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-shadow bg-white text-gray-900";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const buttonClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors";

  const displayPageDataTitle = language === 'ar' && pageData?.title_ar ? pageData.title_ar : pageData?.title;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-royal-blue font-display">{T.editContentPageTitle.replace('{title}', displayPageDataTitle || '...')}</h1>
        <Link 
            to={ROUTES.ADMIN.CONTENT_PAGES} 
            className="text-sm text-royal-blue hover:underline"
        >
            {T.backToContentPages}
        </Link>
      </div>

      {/* Team Members Management Section */}
      {isTeamPage && pageData && (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-royal-blue">{T.manageTeamMembers}</h2>
            <button
              onClick={() => openTeamMemberModal(null)}
              className={`${buttonClass} bg-gold-accent text-royal-blue hover:bg-yellow-500`}
            >
              {T.addNewMember}
            </button>
          </div>
          {isLoading && teamMembers.length === 0 ? <LoadingSpinner/> : teamMembers.length > 0 ? (
            <ul className="space-y-4">
              {teamMembers.map(member => (
                <li key={member.id} className="p-4 border border-medium-gray rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center mb-3 sm:mb-0">
                    <img src={member.photoUrl || 'https://picsum.photos/seed/defaultavatar/60/60'} alt={language === 'ar' && member.name_ar ? member.name_ar : member.name} className="w-12 h-12 rounded-full mr-4 object-cover"/>
                    <div>
                      <h3 className="text-md font-semibold text-gray-800">{language === 'ar' && member.name_ar ? member.name_ar : member.name}</h3>
                      <p className="text-sm text-gray-600">{language === 'ar' && member.title_ar ? member.title_ar : member.title}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button onClick={() => openTeamMemberModal(member)} className={`${buttonClass} bg-blue-500 text-white hover:bg-blue-600`}>{T.edit}</button>
                    <button onClick={() => handleDeleteTeamMember(member.id)} className={`${buttonClass} bg-red-500 text-white hover:bg-red-600`}>{T.delete}</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <p className="text-gray-500 text-center py-4">{T.noTeamMembersFound}</p>
          )}
        </div>
      )}
      
      {/* Services Management Section */}
      {isServicesPage && pageData && (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6 mb-8">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-royal-blue">{language === 'ar' ? 'إدارة الخدمات' : 'Manage Services'}</h2>
                <button
                    onClick={() => openServiceModal(null)}
                    className={`${buttonClass} bg-gold-accent text-royal-blue hover:bg-yellow-500`}
                >
                    {language === 'ar' ? '+ إضافة خدمة جديدة' : '+ Add New Service'}
                </button>
            </div>
            {isLoading && services.length === 0 ? <LoadingSpinner /> : services.length > 0 ? (
                 <ul className="space-y-4">
                    {services.map(service => (
                        <li key={service.id} className="p-4 border border-medium-gray rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <div className="flex items-center mb-3 sm:mb-0">
                                <img src={service.iconUrl || 'https://picsum.photos/seed/defaulticon/60/60'} alt={language === 'ar' && service.title_ar ? service.title_ar : service.title} className="w-12 h-12 rounded-md mr-4 object-contain bg-gray-100 p-1"/>
                                <div>
                                    <h3 className="text-md font-semibold text-gray-800">{language === 'ar' && service.title_ar ? service.title_ar : service.title}</h3>
                                    <p className="text-sm text-gray-600 truncate max-w-xs">{language === 'ar' && service.description_ar ? service.description_ar : service.description}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                                <button onClick={() => openServiceModal(service)} className={`${buttonClass} bg-blue-500 text-white hover:bg-blue-600`}>{T.edit}</button>
                                <button onClick={() => handleDeleteService(service.id)} className={`${buttonClass} bg-red-500 text-white hover:bg-red-600`}>{T.delete}</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                !isLoading && <p className="text-gray-500 text-center py-4">{language === 'ar' ? 'لم يتم العثور على خدمات.' : 'No services found.'}</p>
            )}
        </div>
      )}

      {/* General Page Content Editor */}
      {pageData && (
        <div className={`bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6 ${isTeamPage || isServicesPage ? 'border-t pt-8' : ''}`}>
             <h2 className="text-xl font-semibold text-royal-blue mb-4">
                {isTeamPage || isServicesPage ? T.editPageIntroConclusion : T.pageContentLabel}
             </h2>
            <div>
            <label htmlFor="pageTitle" className={labelClass}>{T.pageTitleLabel} (EN)</label>
            <input type="text" id="pageTitle" value={editableTitle} onChange={(e) => setEditableTitle(e.target.value)} className={inputClass} disabled={isSaving}/>
            </div>
             <div>
            <label htmlFor="pageTitleAr" className={labelClass}>{T.pageTitleLabel} (AR)</label>
            <input type="text" id="pageTitleAr" value={editableTitleAr} onChange={(e) => setEditableTitleAr(e.target.value)} className={inputClass} disabled={isSaving} dir="rtl"/>
            </div>

            <div>
            <label htmlFor="pageContent" className={labelClass}>{T.pageContentLabel} (EN)</label>
            <textarea id="pageContent" value={editableContent} onChange={(e) => setEditableContent(e.target.value)} rows={isTeamPage || isServicesPage ? 5 : 15} className={`${inputClass} min-h-[${isTeamPage || isServicesPage ? '100px' : '300px'}]`} disabled={isSaving} placeholder={T.pageContentPlaceholder}/>
            </div>
             <div>
            <label htmlFor="pageContentAr" className={labelClass}>{T.pageContentLabel} (AR)</label>
            <textarea id="pageContentAr" value={editableContentAr} onChange={(e) => setEditableContentAr(e.target.value)} rows={isTeamPage || isServicesPage ? 5 : 15} className={`${inputClass} min-h-[${isTeamPage || isServicesPage ? '100px' : '300px'}]`} disabled={isSaving} placeholder={T.pageContentPlaceholder} dir="rtl"/>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-medium-gray">
                {(isTeamPage || isServicesPage) && pageData && (
                     <p className="text-xs text-gray-500 mr-auto">
                        Slug: <span className="font-mono bg-light-gray p-1 rounded">/{pageData.slug}</span>
                    </p>
                )}
                <button
                    onClick={handleContentSave}
                    disabled={isSaving}
                    className={`w-full sm:w-auto ${buttonClass} bg-gold-accent text-royal-blue hover:bg-yellow-500 disabled:opacity-70`}
                >
                    {isSaving ? <LoadingSpinner size="sm" /> : T.savePageTextChanges}
                </button>
            </div>
            {pageData?.lastUpdated && (
                <p className="text-xs text-gray-400 text-right mt-2">
                {T.pageInfoLastUpdated.replace('{date}', new Date(pageData.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'))}
                </p>
            )}
      </div>
      )}

      {isTeamModalOpen && (
        <AdminTeamMemberModal
          isOpen={isTeamModalOpen}
          onClose={closeTeamMemberModal}
          teamMember={editingTeamMember}
        />
      )}
      {isServiceModalOpen && (
        <AdminServiceModal
            isOpen={isServiceModalOpen}
            onClose={closeServiceModal}
            service={editingService}
        />
      )}
    </div>
  );
};

export default AdminEditContentPage;

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
