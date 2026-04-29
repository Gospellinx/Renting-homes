import type { SearchFilters } from "@/lib/types";

const bedroomWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
};

const popularLocations = [
  "Abuja",
  "Lagos",
  "Port Harcourt",
  "Ibadan",
  "Lekki",
  "Ikoyi",
  "Victoria Island",
  "Ajah",
  "Ikeja",
  "Maitama",
  "Wuse",
  "Asokoro",
  "Gwarinpa",
  "Kubwa",
  "Enugu",
  "Benin City",
  "Owerri",
  "Uyo",
  "Kaduna",
  "Kano",
  "Jos",
  "Abeokuta",
].sort((left, right) => right.length - left.length);

const normalizePrice = (rawAmount: string, rawUnit?: string) => {
  const amount = Number.parseFloat(rawAmount.replace(/,/g, ""));

  if (Number.isNaN(amount)) {
    return null;
  }

  const normalizedUnit = (rawUnit || "").toLowerCase();

  if (normalizedUnit === "billion" || normalizedUnit === "bn") {
    return amount * 1_000_000_000;
  }

  if (normalizedUnit === "million" || normalizedUnit === "m") {
    return amount * 1_000_000;
  }

  if (normalizedUnit === "thousand" || normalizedUnit === "k") {
    return amount * 1_000;
  }

  return amount;
};

const extractBedrooms = (query: string) => {
  const lowered = query.toLowerCase();
  const numericMatch = lowered.match(/(\d+)\s*[- ]?(?:bed|bedroom|bedrooms)\b/);

  if (numericMatch) {
    return Number.parseInt(numericMatch[1], 10);
  }

  for (const [word, value] of Object.entries(bedroomWords)) {
    if (new RegExp(`\\b${word}\\s*[- ]?(?:bed|bedroom|bedrooms)\\b`, "i").test(query)) {
      return value;
    }
  }

  return null;
};

const extractMaxPrice = (query: string) => {
  const match = query.match(
    /\b(?:under|below|less than|within|up to|not more than)\s*(?:₦|ngn)?\s*([\d,.]+)\s*(billion|million|thousand|bn|m|k)?\b/i
  );

  return match ? normalizePrice(match[1], match[2]) : null;
};

const extractLocation = (query: string) => {
  const knownLocation = popularLocations.find((location) =>
    query.toLowerCase().includes(location.toLowerCase())
  );

  if (knownLocation) {
    return knownLocation;
  }

  const byPhraseMatch = query.match(
    /\bin\s+([a-zA-Z][a-zA-Z\s-]+?)(?=\s+(?:under|below|within|with|having|for|around)\b|[?.!,]|$)/i
  );

  return byPhraseMatch ? byPhraseMatch[1].trim() : null;
};

export function extractSearchFilters(query: string): SearchFilters {
  return {
    location: extractLocation(query),
    maxPrice: extractMaxPrice(query),
    bedrooms: extractBedrooms(query),
  };
}
