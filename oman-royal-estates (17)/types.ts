
export enum PropertyStatus {
  SALE = 'For Sale',
  RENT = 'For Rent',
  OFF_PLAN = 'Off-Plan',
}

export enum PropertyType {
  APARTMENT = 'Apartment',
  VILLA = 'Villa',
  TOWNHOUSE = 'Townhouse',
  PENTHOUSE = 'Penthouse',
  LAND = 'Land',
  OFFICE = 'Office',
}

export interface Property {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  status: PropertyStatus;
  type: PropertyType;
  city: string;
  city_ar?: string;
  price: number;
  size: number; // in sqft or sqm
  bedrooms: number;
  bathrooms: number;
  parking: number;
  amenities: string[];
  amenities_ar?: string[];
  gallery: string[]; // URLs of images
  floorPlanUrl?: string; // URL of floor plan image
  location: {
    lat: number;
    lng: number;
    address: string;
    address_ar?: string;
  };
  dateAdded: string; // ISO date string
  isFeatured?: boolean;
  agent?: {
    name: string;
    name_ar?: string; // Agent names might not always be translated, but providing the option.
    phone: string;
    email: string;
  };
}

export interface FilterCriteria {
  status?: PropertyStatus;
  type?: PropertyType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minSize?: number;
  maxSize?: number;
  bedrooms?: number;
  amenities?: string[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
  // Add other user fields as needed
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>; // Mocked
  logout: () => void; // Mocked
  register: (email: string, pass: string) => Promise<void>; // Mocked
}

export interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => void;
  isLoading: boolean;
}

export interface City {
  id: string;
  name: string;
  name_ar: string;
}

export interface Amenity {
  id: string;
  name: string;
  name_ar: string;
}

export interface ContentPageData {
  slug: string;
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  lastUpdated?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  name_ar?: string;
  title: string;
  title_ar?: string;
  photoUrl: string;
  phone?: string;
  email?: string;
  bio?: string;
  bio_ar?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  iconUrl: string;
}

export interface HomePageSettings {
  mediaType: 'image' | 'video';
  mediaUrl: string;
  fallbackImageUrl: string; // Used as poster for video or if video fails
}
