import { City, Amenity } from './types';
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

// All MOCK_CONTENT_PAGES, MOCK_TEAM_MEMBERS, MOCK_SERVICES, MOCK_HOME_PAGE_SETTINGS
// and their helper functions have been removed as this data will now be sourced from Firebase.
