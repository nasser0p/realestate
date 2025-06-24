import { City, Amenity, ContentPageData, TeamMember, ServiceItem, HomePageSettings, Property } from './types';
// Note: MOCK_PROPERTIES and its related functions (addMockProperty, updateMockProperty, deleteMockProperty)
// have been removed. Property data will now be handled by Firebase/Firestore.

export const CITIES: City[] = [
  { id: 'muscat', name: 'Muscat', name_ar: 'مسقط' },
  { id: 'salalah', name: 'Salalah', name_ar: 'صلالة' },
  { id: 'sohar', name: 'Sohar', name_ar: 'صحار' },
  { id: 'nizwa', name: 'Nizwa', name_ar: 'نزوى' },
  { id: 'sur', name: 'Sur', name_ar: 'صور' },
];

export const AMENITIES: Amenity[] = [
  { id: 'pool', name: 'Swimming Pool', name_ar: 'حمام سباحة' },
  { id: 'gym', name: 'Gymnasium', name_ar: 'صالة رياضية' },
  { id: 'garden', name: 'Private Garden', name_ar: 'حديقة خاصة' },
  { id: 'balcony', name: 'Balcony', name_ar: 'شرفة' },
  { id: 'security', name: '24/7 Security', name_ar: 'أمن 24/7' },
  { id: 'maid', name: 'Maid Room', name_ar: 'غرفة خادمة' },
  { id: 'sea_view', name: 'Sea View', name_ar: 'إطلالة على البحر' },
  { id: 'covered_parking', name: 'Covered Parking', name_ar: 'موقف سيارات مغطى' },
  { id: 'central_ac', name: 'Central A/C', name_ar: 'تكييف مركزي' },
  { id: 'study_room', name: 'Study Room', name_ar: 'غرفة دراسة' },
  { id: 'pets_allowed', name: 'Pets Allowed', name_ar: 'مسموح بالحيوانات الأليفة' },
  { id: 'bbq_area', name: 'BBQ Area', name_ar: 'منطقة شواء' },
];

// MOCK data for other entities - to be migrated to Firebase later
export const MOCK_CONTENT_PAGES: ContentPageData[] = [
  {
    slug: 'about-us',
    title: 'About Oman Royal Estates',
    title_ar: 'عن عقارات عمان الملكية',
    content: `Oman Royal Estates is a premier real estate agency dedicated to providing exceptional service and expertise in the Omani property market. Established in [Year], we have built a reputation for integrity, professionalism, and a deep understanding of our clients' needs.
    \nOur mission is to connect individuals and businesses with their ideal properties, whether it's a luxurious villa, a modern apartment, a strategic commercial space, or a promising off-plan investment. We pride ourselves on our curated portfolio of high-quality listings and our commitment to making the property journey seamless and rewarding for our clients.
    \nWith a team of experienced and passionate real estate professionals, we offer personalized guidance, market insights, and a comprehensive suite of services to ensure that every transaction is handled with the utmost care and efficiency. At Oman Royal Estates, we don't just sell properties; we build lasting relationships and help shape the future of real estate in Oman.`,
    content_ar: `عقارات عمان الملكية هي وكالة عقارية رائدة مكرسة لتقديم خدمة استثنائية وخبرة في سوق العقارات العماني. تأسست في [السنة]، وقد بنينا سمعة طيبة في النزاهة والمهنية والفهم العميق لاحتياجات عملائنا.
    \nمهمتنا هي ربط الأفراد والشركات بممتلكاتهم المثالية، سواء كانت فيلا فاخرة، أو شقة حديثة، أو مساحة تجارية استراتيجية، أو استثمار واعد على الخارطة. نحن نفخر بمحفظتنا المنسقة من القوائم عالية الجودة والتزامنا بجعل رحلة العقارات سلسة ومجزية لعملائنا.
    \nمع فريق من المتخصصين العقاريين ذوي الخبرة والشغف، نقدم إرشادات شخصية ورؤى سوقية ومجموعة شاملة من الخدمات لضمان التعامل مع كل معاملة بأقصى قدر من العناية والكفاءة. في عقارات عمان الملكية، نحن لا نبيع العقارات فحسب؛ بل نبني علاقات دائمة ونساعد في تشكيل مستقبل العقارات في عمان.`,
    lastUpdated: '2024-07-29T10:00:00Z',
  },
  {
    slug: 'services',
    title: 'Our Comprehensive Services',
    title_ar: 'خدماتنا الشاملة',
    content: `At Oman Royal Estates, we offer a wide array of real estate services designed to meet the diverse needs of our clients. Our expertise covers residential, commercial, and investment properties, ensuring a holistic approach to your property journey in Oman. Explore our key services below to see how we can assist you.`,
    content_ar: `في عقارات عمان الملكية، نقدم مجموعة واسعة من الخدمات العقارية المصممة لتلبية الاحتياجات المتنوعة لعملائنا. تغطي خبرتنا العقارات السكنية والتجارية والاستثمارية، مما يضمن نهجًا شاملاً لرحلتك العقارية في عمان. استكشف خدماتنا الرئيسية أدناه لترى كيف يمكننا مساعدتك.`,
    lastUpdated: '2024-07-29T10:05:00Z',
  },
  {
    slug: 'our-team',
    title: 'Meet Our Dedicated Team',
    title_ar: 'تعرف على فريقنا المتفاني',
    content: `Our team at Oman Royal Estates is comprised of dedicated and experienced professionals who are passionate about real estate and committed to serving our clients with excellence. Get to know the people who make our agency a trusted name in Oman's property market.`,
    content_ar: `يتألف فريقنا في عقارات عمان الملكية من محترفين متخصصين وذوي خبرة شغوفين بالعقارات وملتزمين بخدمة عملائنا بتميز. تعرف على الأشخاص الذين يجعلون وكالتنا اسمًا موثوقًا به في سوق العقارات في عمان.`,
    lastUpdated: '2024-07-29T10:10:00Z',
  },
  {
    slug: 'contact-us',
    title: 'Contact Us',
    title_ar: 'اتصل بنا',
    content: `We'd love to hear from you! Whether you're looking to buy, sell, rent, or simply have a question about the Omani property market, our team is here to assist you.
    \n**Oman Royal Estates Head Office:**
    [Street Address]
    [City, Postal Code]
    Muscat, Sultanate of Oman
    \n**Phone:** +968 1234 5678
    \n**Email:** info@omanroyalestates.com
    \n**Office Hours:**
    Sunday - Thursday: 9:00 AM - 6:00 PM
    Friday - Saturday: Closed
    \nAlternatively, you can fill out the contact form below, and one of our representatives will get back to you as soon as possible.`,
    content_ar: `نود أن نسمع منك! سواء كنت تبحث عن شراء أو بيع أو استئجار، أو لديك ببساطة سؤال حول سوق العقارات العماني، فإن فريقنا هنا لمساعدتك.
    \n**المكتب الرئيسي لعقارات عمان الملكية:**
    [عنوان الشارع]
    [المدينة، الرمز البريدي]
    مسقط، سلطنة عمان
    \n**الهاتف:** +968 1234 5678
    \n**البريد الإلكتروني:** info@omanroyalestates.com
    \n**ساعات العمل:**
    الأحد - الخميس: 9:00 صباحًا - 6:00 مساءً
    الجمعة - السبت: مغلق
    \nبدلاً من ذلك، يمكنك ملء نموذج الاتصال أدناه، وسيقوم أحد ممثلينا بالرد عليك في أقرب وقت ممكن.`,
    lastUpdated: '2024-07-29T10:15:00Z',
  },
];

export let MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Fatima Al Harthy',
    name_ar: 'فاطمة الحارثي',
    title: 'Managing Director',
    title_ar: 'المدير العام',
    photoUrl: 'https://picsum.photos/seed/fatima/400/400',
    phone: '+96899000001',
    email: 'fatima.harthy@omanroyalestates.com',
    bio: 'With over 15 years in the Oman property market, Fatima leads with a vision for growth and unparalleled client satisfaction. Specializes in luxury properties.',
    bio_ar: 'بخبرة تزيد عن 15 عامًا في سوق العقارات العماني، تقود فاطمة برؤية للنمو ورضا العملاء الذي لا مثيل له. متخصصة في العقارات الفاخرة.',
    linkedinUrl: '#',
  },
  {
    id: 'tm2',
    name: 'Ahmed Al Balushi',
    name_ar: 'أحمد البلوشي',
    title: 'Head of Sales',
    title_ar: 'رئيس قسم المبيعات',
    photoUrl: 'https://picsum.photos/seed/ahmedb/400/400',
    phone: '+96899000002',
    email: 'ahmed.balushi@omanroyalestates.com',
    bio: 'Ahmed is an expert in residential sales, known for his negotiation skills and extensive knowledge of Muscat\'s prime locations.',
    bio_ar: 'أحمد خبير في مبيعات العقارات السكنية، معروف بمهاراته في التفاوض ومعرفته الواسعة بالمواقع الرئيسية في مسقط.',
    instagramUrl: '#',
  },
  {
    id: 'tm3',
    name: 'Sarah Jones',
    name_ar: 'سارة جونز',
    title: 'Senior Letting Agent',
    title_ar: 'وكيل تأجير أول',
    photoUrl: 'https://picsum.photos/seed/sarahj/400/400',
    phone: '+96899000003',
    email: 'sarah.jones@omanroyalestates.com',
    bio: 'Sarah provides invaluable guidance to landlords and tenants, ensuring smooth rental transactions and property management liaison.',
    bio_ar: 'تقدم سارة إرشادات قيمة للملاك والمستأجرين، مما يضمن معاملات إيجار سلسة والتنسيق في إدارة الممتلكات.',
  },
  {
    id: 'tm4',
    name: 'Yusuf Al Said',
    name_ar: 'يوسف السعيد',
    title: 'Commercial Property Specialist',
    title_ar: 'متخصص في العقارات التجارية',
    photoUrl: 'https://picsum.photos/seed/yusufa/400/400',
    phone: '+96899000004',
    email: 'yusuf.said@omanroyalestates.com',
    bio: 'Yusuf focuses on commercial real estate, helping businesses find optimal spaces for their operations and investments.',
    bio_ar: 'يركز يوسف على العقارات التجارية، ويساعد الشركات في العثور على مساحات مثالية لعملياتهم واستثماراتهم.',
    linkedinUrl: '#',
  }
];

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 's1',
    title: 'Property Sales',
    title_ar: 'مبيعات العقارات',
    description: 'Expert guidance for buying or selling residential and commercial properties. We ensure maximum value and a seamless transaction process.',
    description_ar: 'إرشادات متخصصة لشراء أو بيع العقارات السكنية والتجارية. نضمن أقصى قيمة وعملية معاملات سلسة.',
    iconUrl: 'https://picsum.photos/seed/serviceSales/100/100',
  },
  {
    id: 's2',
    title: 'Property Rentals',
    title_ar: 'تأجير العقارات',
    description: 'Connecting landlords with qualified tenants and assisting tenants in finding their ideal rental home or commercial space.',
    description_ar: 'ربط الملاك بالمستأجرين المؤهلين ومساعدة المستأجرين في العثور على منزلهم أو مساحتهم التجارية المثالية للإيجار.',
    iconUrl: 'https://picsum.photos/seed/serviceRentals/100/100',
  },
  {
    id: 's3',
    title: 'Off-Plan Projects',
    title_ar: 'مشاريع على الخارطة',
    description: 'Access to exclusive off-plan investment opportunities from leading developers in Oman. Secure your future property today.',
    description_ar: 'الوصول إلى فرص استثمارية حصرية على الخارطة من كبار المطورين في عمان. أمن ممتلكاتك المستقبلية اليوم.',
    iconUrl: 'https://picsum.photos/seed/serviceOffPlan/100/100',
  },
  {
    id: 's4',
    title: 'Property Management',
    title_ar: 'إدارة الممتلكات',
    description: 'Comprehensive management services for property owners, ensuring your investment is well-maintained and profitable. (Service details coming soon)',
    description_ar: 'خدمات إدارة شاملة لأصحاب العقارات، مما يضمن الحفاظ على استثمارك بشكل جيد ومربح. (تفاصيل الخدمة قريبا)',
    iconUrl: 'https://picsum.photos/seed/serviceMgmt/100/100',
  },
  {
    id: 's5',
    title: 'Real Estate Consultancy',
    title_ar: 'استشارات عقارية',
    description: 'Providing expert advice on market trends, investment strategies, property valuation, and portfolio management.',
    description_ar: 'تقديم مشورة الخبراء حول اتجاهات السوق واستراتيجيات الاستثمار وتقييم العقارات وإدارة المحافظ.',
    iconUrl: 'https://picsum.photos/seed/serviceConsult/100/100',
  },
  {
    id: 's6',
    title: 'Legal Assistance Coordination',
    title_ar: 'تنسيق المساعدة القانونية',
    description: 'We connect our clients with trusted legal professionals for all conveyancing, contractual, and real estate legal matters.',
    description_ar: 'نقوم بربط عملائنا بمحترفين قانونيين موثوقين لجميع مسائل نقل الملكية والعقود والشؤون القانونية العقارية.',
    iconUrl: 'https://picsum.photos/seed/serviceLegal/100/100',
  }
];

// Functions to modify MOCK_TEAM_MEMBERS (will be replaced by Firebase service)
export const addMockTeamMember = (newMember: TeamMember) => {
  MOCK_TEAM_MEMBERS.push(newMember);
};

export const updateMockTeamMember = (updatedMember: TeamMember) => {
  const index = MOCK_TEAM_MEMBERS.findIndex(tm => tm.id === updatedMember.id);
  if (index !== -1) {
    MOCK_TEAM_MEMBERS[index] = updatedMember;
    return true;
  }
  return false;
};

export const deleteMockTeamMember = (memberId: string) => {
  const initialLength = MOCK_TEAM_MEMBERS.length;
  MOCK_TEAM_MEMBERS = MOCK_TEAM_MEMBERS.filter(tm => tm.id !== memberId);
  return MOCK_TEAM_MEMBERS.length < initialLength;
};

// Home Page Hero Settings (will be replaced by Firebase service)
let MOCK_HOME_PAGE_SETTINGS: HomePageSettings = {
  mediaType: 'image',
  mediaUrl: 'https://picsum.photos/seed/homehero/1920/1080',
  fallbackImageUrl: 'https://picsum.photos/seed/homehero-fallback/1920/1080',
};

export const getHomePageSettings = (): HomePageSettings => {
  // In a real app, this would fetch from a backend or persistent storage.
  // For now, retrieve from localStorage if available, otherwise use mock.
  const storedSettings = localStorage.getItem('homePageSettings');
  if (storedSettings) {
    try {
      const parsedSettings = JSON.parse(storedSettings);
      if (parsedSettings && typeof parsedSettings.mediaType === 'string' && typeof parsedSettings.mediaUrl === 'string') {
        return parsedSettings as HomePageSettings;
      }
    } catch (e) {
      console.error("Error parsing homePageSettings from localStorage", e);
    }
  }
  return { ...MOCK_HOME_PAGE_SETTINGS };
};

export const updateHomePageSettings = (newSettings: HomePageSettings): void => {
  MOCK_HOME_PAGE_SETTINGS = { ...newSettings };
  localStorage.setItem('homePageSettings', JSON.stringify(MOCK_HOME_PAGE_SETTINGS));
};
