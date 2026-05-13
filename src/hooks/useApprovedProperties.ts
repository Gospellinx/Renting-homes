import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PROPERTY_IMAGE_BUCKET } from "@/lib/propertySubmission";

type PropertyRow = Tables<"properties">;
export type PublicPropertyKind = "rent" | "sale" | "land" | "shop";

export interface PublicApprovedProperty {
  id: string;
  dbId: string;
  source: "database";
  kind: PublicPropertyKind;
  title: string;
  location: string;
  price: string;
  period?: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  rating: number;
  verified: boolean;
  features: string[];
  agentName: string;
  agentCompany: string;
  agentPhone: string;
  agentEmail: string;
  agentWhatsapp: string;
  similar: [];
  propertyType: string;
  width?: string;
  length?: string;
  type?: string;
}

const fallbackImage = "/placeholder.svg";

const getImageUrl = (image?: string | null) => {
  if (!image) return fallbackImage;
  if (/^https?:\/\//i.test(image)) return image;
  return supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(image).data.publicUrl;
};

const getKind = (propertyType: string): PublicPropertyKind | null => {
  switch (propertyType) {
    case "rental":
      return "rent";
    case "building":
      return "sale";
    case "land":
      return "land";
    case "shop_rental":
      return "shop";
    default:
      return null;
  }
};

const formatPrice = (price: string) => (price.trim().startsWith("₦") ? price : `₦${price}`);
const formatType = (value: string) => value.replace(/_/g, " ");

const toPublicProperty = (property: PropertyRow): PublicApprovedProperty | null => {
  const kind = getKind(property.property_type);
  if (!kind) return null;

  const location = `${property.location}, ${property.state}`;
  const features = property.amenities?.length ? property.amenities : [formatType(property.property_type)];

  return {
    id: property.id,
    dbId: property.id,
    source: "database",
    kind,
    title: property.title,
    location,
    price: formatPrice(property.price),
    period: kind === "rent" || kind === "shop" ? "per month" : undefined,
    bedrooms: 0,
    bathrooms: 0,
    area: property.size,
    image: getImageUrl(property.images?.[0]),
    rating: 5,
    verified: true,
    features,
    agentName: property.owner_name,
    agentCompany: "Homes Nigeria",
    agentPhone: property.owner_phone,
    agentEmail: property.owner_email,
    agentWhatsapp: property.owner_phone,
    similar: [],
    propertyType: formatType(property.property_type),
    width: kind === "shop" ? property.size : undefined,
    length: kind === "shop" ? "See listing" : undefined,
    type: kind === "land" ? "Verified Land" : undefined,
  };
};

export const useApprovedProperties = (kind?: PublicPropertyKind) => {
  const query = useQuery({
    queryKey: ["approved-properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return ((data ?? []) as PropertyRow[]).map(toPublicProperty).filter(Boolean) as PublicApprovedProperty[];
    },
  });

  const properties = useMemo(() => {
    const approved = query.data ?? [];
    return kind ? approved.filter((property) => property.kind === kind) : approved;
  }, [kind, query.data]);

  return { ...query, properties };
};
