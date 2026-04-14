import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface VerificationRequest {
  id: string;
  user_id: string;
  status: string;
  property_address: string;
  property_type: string;
  ownership_type: string;
  ownership_document_url: string | null;
  occupancy_document_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const useVerification = () => {
  const { user } = useAuth();
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setVerificationRequest(null);
      setLoading(false);
      return;
    }

    const fetchVerification = async () => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setVerificationRequest(data);
      }
      setLoading(false);
    };

    fetchVerification();
  }, [user]);

  const uploadDocument = async (file: File, type: "ownership" | "occupancy") => {
    if (!user) return { error: new Error("Not authenticated"), url: null };

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

    const { error, data } = await supabase.storage
      .from("verification-documents")
      .upload(fileName, file);

    if (error) return { error, url: null };

    const { data: urlData } = supabase.storage
      .from("verification-documents")
      .getPublicUrl(fileName);

    return { error: null, url: urlData.publicUrl };
  };

  const submitVerification = async (data: {
    propertyAddress: string;
    propertyType: string;
    ownershipType: "owner" | "tenant";
    ownershipFile: File;
    occupancyFile: File;
  }) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Upload documents
    const { url: ownershipUrl, error: ownershipError } = await uploadDocument(
      data.ownershipFile,
      "ownership"
    );
    if (ownershipError) return { error: ownershipError };

    const { url: occupancyUrl, error: occupancyError } = await uploadDocument(
      data.occupancyFile,
      "occupancy"
    );
    if (occupancyError) return { error: occupancyError };

    // Create verification request
    const { error, data: request } = await supabase
      .from("verification_requests")
      .insert({
        user_id: user.id,
        property_address: data.propertyAddress,
        property_type: data.propertyType,
        ownership_type: data.ownershipType,
        ownership_document_url: ownershipUrl,
        occupancy_document_url: occupancyUrl,
      })
      .select()
      .single();

    if (!error && request) {
      setVerificationRequest(request);
    }

    return { error };
  };

  const isVerified = verificationRequest?.status === "approved";

  return { verificationRequest, loading, submitVerification, isVerified };
};
