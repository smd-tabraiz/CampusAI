export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  studentId?: string | null;
  role: UserRole;
  department?: string | null;
  year?: number | null;
  avatarUrl?: string | null;
  bio?: string | null;
  createdAt: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  code: string;
  category: string;
  lat: number;
  lng: number;
  floor?: string | null;
  description: string;
  openingHours: string;
  isAccessible: boolean;
  amenities?: string | null;
  imageUrl?: string | null;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  lat: number;
  lng: number;
  floors: number;
  description: string;
  imageUrl?: string | null;
}

export interface Facility {
  id: string;
  name: string;
  category: string;
  buildingName: string;
  roomNumber: string;
  floor: string;
  description: string;
  openingHours: string;
  isAccessible: boolean;
  lat: number;
  lng: number;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  organizerName: string;
  organizerId?: string | null;
  imageUrl?: string | null;
  maxParticipants: number;
  isFree: boolean;
  registrationLink?: string | null;
  rsvpsCount?: number;
  isUserRegistered?: boolean;
}

export interface LostItem {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  color: string;
  lostDate: string;
  locationName: string;
  imageUrl?: string | null;
  contactPreference: string;
  status: 'ACTIVE' | 'RESOLVED';
  createdAt: string;
  user?: { name: string; department?: string | null; avatarUrl?: string | null };
}

export interface FoundItem {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  color: string;
  foundDate: string;
  locationName: string;
  imageUrl?: string | null;
  contactMethod: string;
  status: 'ACTIVE' | 'CLAIMED';
  createdAt: string;
  user?: { name: string; department?: string | null; avatarUrl?: string | null };
}

export interface ItemMatch {
  id: string;
  lostItemId: string;
  foundItemId: string;
  confidenceScore: number;
  matchReason: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISMISSED';
  lostItem: LostItem;
  foundItem: FoundItem;
}

export interface Cafeteria {
  id: string;
  name: string;
  locationName: string;
  lat: number;
  lng: number;
  openingHours: string;
  priceRange: string;
  rating: number;
  imageUrl?: string | null;
  phone?: string | null;
  isVegetarianOnly: boolean;
  description?: string | null;
  foodItems?: FoodItem[];
}

export interface FoodItem {
  id: string;
  cafeteriaId: string;
  name: string;
  category: string;
  price: number;
  isVeg: boolean;
  isVegan: boolean;
  isHealthy: boolean;
  calories?: number | null;
  popularScore: number;
  description?: string | null;
  imageUrl?: string | null;
  cafeteria?: { id: string; name: string; locationName: string; rating: number; openingHours: string };
  whyRecommended?: string;
}

export interface RoommateProfile {
  id: string;
  userId: string;
  preferredHostel: string;
  roomType: string;
  sleepSchedule: string;
  studyHabits: string;
  cleanliness: string;
  foodPreference: string;
  noiseTolerance: string;
  smokingPreference: string;
  pets: string;
  socialPreference: string;
  budget: number;
  department: string;
  year: number;
  bio: string;
  user?: { id?: string; name: string; email?: string; department?: string | null; year?: number | null; avatarUrl?: string | null };
  compatibilityScore?: number;
  breakdown?: {
    sleepSchedule: number;
    studyHabits: number;
    cleanliness: number;
    budget: number;
    lifestyle: number;
  };
  whyMatch?: string;
}

export interface RoommateConnection {
  id: string;
  requesterId: string;
  targetId: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  compatibilityScore: number;
  message?: string | null;
  createdAt: string;
  requester?: { id: string; name: string; department?: string | null; year?: number | null; avatarUrl?: string | null };
  target?: { id: string; name: string; department?: string | null; year?: number | null; avatarUrl?: string | null };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'MATCH' | 'EVENT' | 'ROOMMATE' | 'ALERT' | 'ANNOUNCEMENT';
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  intent?: string;
  cards?: { type: string; data: any }[];
  quickReplies?: string[];
  createdAt?: string;
}

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string;
  updatedAt: string;
}
