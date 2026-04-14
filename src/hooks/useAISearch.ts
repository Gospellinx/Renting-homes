import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ParsedSearchParams {
  location?: string;
  propertyType?: string;
  intent: 'buy' | 'rent' | 'verify' | 'search';
  bedrooms?: number;
  priceMin?: number;
  priceMax?: number;
  features?: string[];
  originalQuery: string;
}

export const useAISearch = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseSearchQuery = async (query: string): Promise<ParsedSearchParams | null> => {
    if (!query.trim()) return null;

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-search', {
        body: { query },
      });

      if (functionError) {
        console.error('AI search error:', functionError);
        setError('Failed to process search query');
        return null;
      }

      if (data.error) {
        setError(data.error);
        return null;
      }

      return {
        ...data,
        originalQuery: query,
      } as ParsedSearchParams;
    } catch (err) {
      console.error('AI search error:', err);
      setError('Failed to process search query');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    parseSearchQuery,
    isProcessing,
    error,
  };
};
