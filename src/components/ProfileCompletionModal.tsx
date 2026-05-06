import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function ProfileCompletionModal() {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        const requiredFields = [
          { key: "full_name", label: "Agent Name" },
          { key: "phone", label: "Mobile Number" },
          { key: "user_type", label: "Agent Type" },
          { key: "location", label: "Location" },
          { key: "bio", label: "About Agent" },
          { key: "avatar_url", label: "Profile Photo" },
        ];

        const missing = requiredFields.filter((field) => !data[field.key]);
        const completedCount = requiredFields.length - missing.length;
        const percentage = Math.round((completedCount / requiredFields.length) * 100);

        setMissingFields(missing.map((f) => f.label));
        setCompletionPercentage(percentage);

        // Don't show modal if on profile page, or if 100% complete
        if (percentage < 100 && location.pathname !== "/profile") {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
    };

    checkProfile();
  }, [user, location.pathname]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[400px] border border-gray-100 relative">
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          Complete your profile to unlock full access
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Property Listing is locked until your profile is complete.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 bg-green-100 rounded-full h-2">
            <div
              className="bg-[#5cb85c] h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-sm font-bold text-[#5cb85c] whitespace-nowrap">
            {completionPercentage}% complete
          </span>
        </div>

        {missingFields.length > 0 && (
          <div className="mb-4">
            <span className="text-sm text-red-500 font-medium">Missing: </span>
            <span className="text-sm text-red-500">
              {missingFields.join(", ")}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <Button asChild className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white rounded-lg px-6 font-medium">
            <Link to="/profile">Complete Profile →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
