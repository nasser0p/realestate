import { Timestamp } from 'firebase/firestore';

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
  id: string; // Firestore document ID
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
  gallery: string[]; // URLs of images from Firebase Storage
  floorPlanUrl?: string; // URL of floor plan image from Firebase Storage
  location: {
    lat: number;
    lng: number;
    address: string;
    address_ar?: string;
  };
  dateAdded: Timestamp | Date | string; // Store as Firestore Timestamp, handle as Date or string in app
  isFeatured?: boolean;
  agent?: {
    name: string;
    name_ar?: string;
    phone: string;
    email: string;
  };
  // Internal fields for Firebase, not directly edited by user in property form
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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
  uid: string; // Firebase User ID
  email: string | null; // Firebase email can be null
  name?: string; // Display name, could be stored in Firestore user profile
  // Add other user fields as needed, e.g., role, agencyId
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
}

export interface FavoritesContextType {
  favoriteIds: string[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => Promise<void>;
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
  slug: string; // Document ID in Firestore
  title: string;
  title_ar?: string;
  content: string;
  content_ar?: string;
  lastUpdated?: Timestamp | Date | string; // Store as Firestore Timestamp
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TeamMember {
  id: string; // Document ID in Firestore
  name: string;
  name_ar?: string;
  title: string;
  title_ar?: string;
  photoUrl: string; // URL from Firebase Storage
  phone?: string;
  email?: string;
  bio?: string;
  bio_ar?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  order?: number; // Added for custom sorting
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ServiceItem {
  id: string; // Document ID in Firestore
  title: string;
  title_ar?: string;
  description: string;
  description_ar?: string;
  iconUrl: string; // URL from Firebase Storage or static
  order?: number; // Added for custom sorting
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface HomePageSettings {
  // Assuming a single document in Firestore for these settings, e.g., ID 'main'
  mediaType: 'image' | 'video';
  mediaUrl: string;
  fallbackImageUrl: string;
  updatedAt?: Timestamp;
}