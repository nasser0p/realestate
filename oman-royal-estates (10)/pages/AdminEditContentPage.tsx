import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_CONTENT_PAGES, MOCK_TEAM_MEMBERS, deleteMockTeamMember, MOCK_SERVICES } from '../data';
import { ContentPageData, TeamMember, ServiceItem } from '../types';
import { ROUTES, COMMON_TRANSLATIONS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import NotFoundPage from './NotFoundPage';
import AdminTeamMemberModal from '../components/AdminTeamMemberModal'; 
import { useLanguage } from '../contexts/LanguageContext';


const AdminEditContentPage: React.FC = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  const [pageData, setPageData] = useState<ContentPageData | null | undefined>(undefined);
  const [editableTitle, setEditableTitle] = useState('');
  const [editableTitleAr, setEditableTitleAr] = useState('');
  const [editableContent, setEditableContent] = useState('');
  const [editableContentAr, setEditableContentAr] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  
  const [services, setServices] = useState<ServiceItem[]>(MOCK_SERVICES); // For services page

  const isTeamPage = pageSlug === 'our-team';
  const isServicesPage = pageSlug === 'services';


  useEffect(() => {
    setIsLoading(true);
    const data = MOCK_CONTENT_PAGES.find(p => p.slug === pageSlug);
    if (data) {
      setPageData(data);
      setEditableTitle(data.title);
      setEditableTitleAr(data.title_ar || '');
      setEditableContent(data.content);
      setEditableContentAr(data.content_ar || '');
    } else {
      setPageData(null); 
    }
    if (isTeamPage) {
        setTeamMembers([...MOCK_TEAM_MEMBERS]); 
    }
    if (isServicesPage) {
        setServices([...MOCK_SERVICES]);
    }
    setIsLoading(false);
  }, [pageSlug, isTeamPage, isServicesPage]);

  useEffect(() => {
    if (isTeamPage) {
        setTeamMembers([...MOCK_TEAM_MEMBERS]);
    }
     if (isServicesPage) { // Refresh services if MOCK_SERVICES changes
        setServices([...MOCK_SERVICES]);
    }
  }, [MOCK_TEAM_MEMBERS, MOCK_SERVICES, isTeamPage, isServicesPage]);


  const handleGenericSave = () => {
    setIsSaving(true);
    console.log("Attempting to save generic content:", { slug: pageSlug, title: editableTitle, title_ar: editableTitleAr, content: editableContent, content_ar: editableContentAr });
    const pageIndex = MOCK_CONTENT_PAGES.findIndex(p => p.slug === pageSlug);
    if (pageIndex > -1) {
      MOCK_CONTENT_PAGES[pageIndex] = { 
        ...MOCK_CONTENT_PAGES[pageIndex], 
        title: editableTitle, 
        title_ar: editableTitleAr,
        content: editableContent, 
        content_ar: editableContentAr,
        lastUpdated: new Date().toISOString() 
      };
      setPageData(MOCK_CONTENT_PAGES[pageIndex]);
    }
    setTimeout(() => {
      setIsSaving(false);
      alert(T.genericSaveSuccess);
    }, 1000);
  };

  const openTeamMemberModal = (member: TeamMember | null = null) => {
    setEditingTeamMember(member);
    setIsTeamModalOpen(true);
  };

  const closeTeamMemberModal = () => {
    setIsTeamModalOpen(false);
    setEditingTeamMember(null);
    setTeamMembers([...MOCK_TEAM_MEMBERS]); 
  };

  const handleDeleteTeamMember = (memberId: string) => {
    if (window.confirm(T.confirmDeleteTeamMember)) {
      deleteMockTeamMember(memberId);
      setTeamMembers([...MOCK_TEAM_MEMBERS]); 
      alert(T.teamMemberDeleted);
    }
  };


  if (isLoading || pageData === undefined) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh] flex items-center justify-center"><LoadingSpinner text={T.loadingPageEditor} /></div>;
  }

  if (!pageData) {
    return <NotFoundPage message={T.contentPageNotFound.replace('{pageSlug}', pageSlug || '')} />;
  }
  
  const inputClass = "w-full p-3 border border-medium-gray rounded-md focus:ring-2 focus:ring-royal-blue focus:border-transparent outline-none transition-shadow bg-white text-gray-900";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const buttonClass = "px-4 py-2 rounded-md text-sm font-medium transition-colors";

  const displayPageDataTitle = language === 'ar' && pageData?.title_ar ? pageData.title_ar : pageData.title;


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-royal-blue font-display">{T.editContentPageTitle.replace('{title}', displayPageDataTitle)}</h1>
        <Link 
            to={ROUTES.ADMIN.CONTENT_PAGES} 
            className="text-sm text-royal-blue hover:underline"
        >
            {T.backToContentPages}
        </Link>
      </div>

      {isTeamPage ? (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-royal-blue">{T.manageTeamMembers}</h2>
            <button
              onClick={() => openTeamMemberModal(null)}
              className={`${buttonClass} bg-gold-accent text-royal-blue hover:bg-yellow-500`}
            >
              {T.addNewMember}
            </button>
          </div>
          {teamMembers.length > 0 ? (
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
                    <button
                      onClick={() => openTeamMemberModal(member)}
                      className={`${buttonClass} bg-blue-500 text-white hover:bg-blue-600`}
                    >
                      {T.edit}
                    </button>
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className={`${buttonClass} bg-red-500 text-white hover:bg-red-600`}
                    >
                      {T.delete}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">{T.noTeamMembersFound}</p>
          )}
           <p className="text-xs text-gray-500 mt-4">
            {T.pageIntroContentHelpText.replace('{pageSlug}', `/${pageData.slug}`)}
          </p>
        </div>
      ) : null}
      
      {isServicesPage && (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6 mt-8">
            <h2 className="text-xl font-semibold text-royal-blue">{language === 'ar' ? 'إدارة الخدمات' : 'Manage Services'}</h2>
            {/* Placeholder for services management UI - Future enhancement */}
            <p className="text-gray-500">
                {language === 'ar' ? 'ستتوفر هنا واجهة لإضافة وتعديل وحذف الخدمات. في الوقت الحالي، يتم التحكم في الخدمات عبر ملف `data.ts`.' : 'Interface to add, edit, delete services will be here. For now, services are controlled via `data.ts`.'}
            </p>
            <ul className="space-y-2">
                {services.map(service => (
                    <li key={service.id} className="p-3 border rounded-md">
                        <h3 className="font-medium">{language === 'ar' ? service.title_ar : service.title}</h3>
                        <p className="text-sm text-gray-600">{language === 'ar' ? service.description_ar : service.description}</p>
                        <img src={service.iconUrl} alt="" className="w-10 h-10 mt-1"/>
                    </li>
                ))}
            </ul>
        </div>
      )}


        <div className={`bg-white p-6 md:p-8 rounded-lg shadow-xl space-y-6 ${isTeamPage || isServicesPage ? 'mt-8 border-t pt-8' : ''}`}>
             <h2 className="text-xl font-semibold text-royal-blue mb-4">
                {isTeamPage ? T.editPageIntroConclusion : T.pageContentLabel}
             </h2>
            <div>
            <label htmlFor="pageTitle" className={labelClass}>{T.pageTitleLabel} (EN)</label>
            <input
                type="text"
                id="pageTitle"
                value={editableTitle}
                onChange={(e) => setEditableTitle(e.target.value)}
                className={inputClass}
                disabled={isSaving}
            />
            </div>
             <div>
            <label htmlFor="pageTitleAr" className={labelClass}>{T.pageTitleLabel} (AR)</label>
            <input
                type="text"
                id="pageTitleAr"
                value={editableTitleAr}
                onChange={(e) => setEditableTitleAr(e.target.value)}
                className={inputClass}
                disabled={isSaving}
                dir="rtl"
            />
            </div>

            <div>
            <label htmlFor="pageContent" className={labelClass}>
                {isTeamPage ? T.pageIntroContentHelpText : T.pageContentLabel} (EN)
            </label>
            <textarea
                id="pageContent"
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                rows={isTeamPage ? 5 : 15}
                className={`${inputClass} min-h-[${isTeamPage ? '100px' : '300px'}]`}
                disabled={isSaving}
                placeholder={T.pageContentPlaceholder}
            />
            </div>
             <div>
            <label htmlFor="pageContentAr" className={labelClass}>
                {isTeamPage ? T.pageIntroContentHelpText : T.pageContentLabel} (AR)
            </label>
            <textarea
                id="pageContentAr"
                value={editableContentAr}
                onChange={(e) => setEditableContentAr(e.target.value)}
                rows={isTeamPage ? 5 : 15}
                className={`${inputClass} min-h-[${isTeamPage ? '100px' : '300px'}]`}
                disabled={isSaving}
                placeholder={T.pageContentPlaceholder}
                dir="rtl"
            />
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-medium-gray">
                {(isTeamPage || isServicesPage) && (
                     <p className="text-xs text-gray-500 mr-auto">
                        Slug: <span className="font-mono bg-light-gray p-1 rounded">/{pageData.slug}</span>
                    </p>
                )}
                <button
                    onClick={handleGenericSave}
                    disabled={isSaving}
                    className={`w-full sm:w-auto ${buttonClass} bg-gold-accent text-royal-blue hover:bg-yellow-500 disabled:opacity-70`}
                >
                    {isSaving ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-royal-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {T.savingButton}
                        </div>
                    ) : T.savePageTextChanges}
                </button>
            </div>
            {pageData.lastUpdated && (
                <p className="text-xs text-gray-400 text-right mt-2">
                {T.currentVersionLastUpdated.replace('{date}', new Date(pageData.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US'))}
                </p>
            )}
      </div>

      {isTeamModalOpen && (
        <AdminTeamMemberModal
          isOpen={isTeamModalOpen}
          onClose={closeTeamMemberModal}
          teamMember={editingTeamMember}
        />
      )}
    </div>
  );
};

export default AdminEditContentPage;
