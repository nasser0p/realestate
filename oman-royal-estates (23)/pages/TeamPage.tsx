
import React, { useState, useEffect } from 'react';
import { ContentPageData, TeamMember } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { ExternalLinkIcon } from '../components/IconComponents';
import { useLanguage } from '../contexts/LanguageContext';
import { COMMON_TRANSLATIONS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc, collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

const TeamPage: React.FC = () => {
  const [pageData, setPageData] = useState<ContentPageData | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const T = COMMON_TRANSLATIONS[language];

  useEffect(() => {
    const fetchPageAndTeam = async () => {
      setIsLoading(true);
      try {
        // Fetch intro content
        const pageDocRef = doc(db, 'content_pages', 'our-team');
        const pageDocSnap = await getDoc(pageDocRef);
        if (pageDocSnap.exists()) {
           const data = pageDocSnap.data() as Omit<ContentPageData, 'slug' | 'lastUpdated'> & {updatedAt?: Timestamp};
           setPageData({
            slug: 'our-team',
            title: data.title,
            title_ar: data.title_ar,
            content: data.content,
            content_ar: data.content_ar,
            lastUpdated: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          });
        } else {
          console.warn("Our Team page intro content not found.");
        }

        // Fetch team members
        const teamColRef = collection(db, 'team_members');
        const q = query(teamColRef, orderBy('order', 'asc')); // Assuming 'order' field for sorting
        const teamSnapshot = await getDocs(q);
        const teamList = teamSnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as TeamMember));
        setTeamMembers(teamList);

      } catch (error) {
        console.error("Error fetching team page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPageAndTeam();
  }, []);

  const displayPageTitle = language === 'ar' && pageData?.title_ar ? pageData.title_ar : pageData?.title;
  const displayPageContent = language === 'ar' && pageData?.content_ar ? pageData.content_ar : pageData?.content;


  if (isLoading) {
    return <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[50vh] flex items-center justify-center"><LoadingSpinner text={T.loading} /></div>;
  }

  return (
    <div className="bg-white py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold text-royal-blue mb-6 font-display text-center">
          {displayPageTitle || T.ourTeam}
        </h1>
        {displayPageContent && (
          <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
            {displayPageContent.split('\\n').map((paragraph, index) => (
              <span key={index} className="block">{paragraph}</span>
            ))}
          </p>
        )}
        
        {teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member) => {
              const displayMemberName = language === 'ar' && member.name_ar ? member.name_ar : member.name;
              const displayMemberTitle = language === 'ar' && member.title_ar ? member.title_ar : member.title;
              const displayMemberBio = language === 'ar' && member.bio_ar ? member.bio_ar : member.bio;
              return (
                <div key={member.id} className="bg-light-gray p-6 rounded-lg shadow-lg text-center flex flex-col items-center transition-all duration-300 hover:shadow-2xl hover:scale-105">
                  <img 
                    src={member.photoUrl || 'https://picsum.photos/seed/avatar/400/400'} 
                    alt={displayMemberName} 
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-md"
                  />
                  <h3 className="text-xl font-semibold text-royal-blue mb-1">{displayMemberName}</h3>
                  <p className="text-md text-gold-accent mb-3">{displayMemberTitle}</p>
                  {displayMemberBio && <p className="text-sm text-gray-600 mb-3 px-2 flex-grow">{displayMemberBio}</p>}
                  
                  <div className="mt-auto w-full">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="block text-sm text-royal-blue hover:text-gold-accent my-1 break-all">
                        {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="block text-sm text-royal-blue hover:text-gold-accent my-1">
                        {member.phone}
                      </a>
                    )}
                    <div className="flex justify-center space-x-3 mt-3">
                      {member.linkedinUrl && (
                        <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-royal-blue">
                          <ExternalLinkIcon className="w-5 h-5" />
                          <span className="sr-only">LinkedIn</span>
                        </a>
                      )}
                      {member.instagramUrl && (
                        <a href={member.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-royal-blue">
                          <ExternalLinkIcon className="w-5 h-5" />
                          <span className="sr-only">Instagram</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !isLoading && <p className="text-gray-600 text-center">{T.teamInfoNotAvailable}</p>
        )}
        
        {pageData?.lastUpdated && (
          <p className="text-xs text-gray-500 mt-12 text-center">
             {language === 'ar' ? 'آخر تحديث لبيانات الصفحة:' : 'Page information last updated:'} {new Date(pageData.lastUpdated).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
          </p>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
