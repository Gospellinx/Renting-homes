export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface SearchFilters {
  location: string | null;
  maxPrice: number | null;
  bedrooms: number | null;
}

export interface PropertyRecord {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  features: JsonValue;
  description: string;
}

export interface PropertyMatch extends PropertyRecord {
  similarityScore?: number;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatMessage extends ChatTurn {
  id: string;
  properties?: PropertyMatch[];
  isTransient?: boolean;
}

export interface ChatApiResponse {
  reply: string;
  properties: PropertyMatch[];
  filters: SearchFilters;
  rawMatchesCount: number;
}
