import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareProperty {
  id: number;
  type: 'rent' | 'sale';
  title: string;
  location: string;
  price: string;
  period?: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  features: string[];
  neighborhood?: {
    schools: { name: string; distance: string; rating?: number }[];
    hospitals: { name: string; distance: string; rating?: number }[];
    restaurants: { name: string; distance: string; rating?: number }[];
    transportation: { name: string; type?: string; distance: string }[];
    shopping: { name: string; distance: string }[];
  };
}

interface CompareStore {
  properties: CompareProperty[];
  addProperty: (property: CompareProperty) => void;
  removeProperty: (id: number, type: 'rent' | 'sale') => void;
  clearAll: () => void;
  isSelected: (id: number, type: 'rent' | 'sale') => boolean;
}

export const useCompareProperties = create<CompareStore>()(
  persist(
    (set, get) => ({
      properties: [],
      addProperty: (property) => {
        const current = get().properties;
        if (current.length >= 4) return; // Max 4 properties
        if (!get().isSelected(property.id, property.type)) {
          set({ properties: [...current, property] });
        }
      },
      removeProperty: (id, type) => {
        set({ 
          properties: get().properties.filter(
            p => !(p.id === id && p.type === type)
          ) 
        });
      },
      clearAll: () => set({ properties: [] }),
      isSelected: (id, type) => {
        return get().properties.some(p => p.id === id && p.type === type);
      },
    }),
    {
      name: 'compare-properties',
    }
  )
);
