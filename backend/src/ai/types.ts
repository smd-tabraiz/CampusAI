export type IntentType =
  | 'GENERAL_CAMPUS_QUERY'
  | 'CAMPUS_NAVIGATION'
  | 'LOST_ITEM'
  | 'FOUND_ITEM'
  | 'EVENT_DISCOVERY'
  | 'FOOD_RECOMMENDATION'
  | 'ROOMMATE_MATCHING'
  | 'FACILITY_SEARCH'
  | 'EMERGENCY'
  | 'CONTACT_ADMIN'
  | 'GENERAL_CHAT';

export interface ExtractedEntities {
  destination?: string;
  source?: string;
  category?: string;
  item?: string;
  color?: string;
  location?: string;
  foodType?: string;
  budget?: number;
  diet?: 'veg' | 'vegan' | 'healthy' | 'any';
  date?: string;
  hostel?: string;
  time?: string;
  keywords?: string[];
}

export interface IntentClassificationResult {
  intent: IntentType;
  confidence: number;
  entities: ExtractedEntities;
}

export type StructuredCardType =
  | 'location'
  | 'navigation_route'
  | 'event'
  | 'food'
  | 'lost_found_match'
  | 'roommate'
  | 'facility'
  | 'emergency'
  | 'action_button';

export interface StructuredCard {
  type: StructuredCardType;
  data: any;
}

export interface AiChatResponse {
  message: string;
  intent: IntentType;
  confidence: number;
  entities: ExtractedEntities;
  cards?: StructuredCard[];
  quickReplies?: string[];
  suggestedActions?: { label: string; action: string; payload?: any }[];
}

export interface UserContext {
  userId?: string;
  userName?: string;
  role?: string;
  department?: string | null;
  year?: number | null;
  preferredHostel?: string;
  currentLocation?: { lat: number; lng: number };
}

export interface IAiProvider {
  name: string;
  generateResponse(prompt: string, context?: UserContext, history?: { sender: string; content: string }[]): Promise<string>;
}
