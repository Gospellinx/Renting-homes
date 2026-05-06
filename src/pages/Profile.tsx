import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, MapPin, FileText, Loader2, ArrowLeft, Shield, Briefcase, Building, Home, Search, ExternalLink, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/homes-logo.png";
import EmailNotificationSettings from "@/components/EmailNotificationSettings";
import DashboardLayout from "@/components/DashboardLayout";
import { z } from "zod";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  user_type: string | null;
}

type ProfileFormField = "fullName" | "phone" | "location" | "bio";
type ProfileFormErrors = Partial<Record<ProfileFormField, string>>;
type ProfileFormValues = Record<ProfileFormField, string>;

const phoneCharactersPattern = /^[+\d\s()-]+$/;
const locationCharactersPattern = /^[\p{L}\d\s,.'-]+$/u;

const profileFieldSchemas: Record<ProfileFormField, z.ZodType<string>> = {
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be 80 characters or less")
    .refine((value) => /\p{L}/u.test(value), "Full name must contain letters"),
  phone: z
    .string()
    .refine(
      (value) => phoneCharactersPattern.test(value),
      "Use only numbers, spaces, hyphens, parentheses, or a leading +"
    )
    .refine((value) => {
      const digitsOnly = value.replace(/\D/g, "");
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }, "Phone number must contain 10 to 15 digits"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be 100 characters or less")
    .refine(
      (value) => locationCharactersPattern.test(value),
      "Location can include letters, numbers, spaces, commas, periods, apostrophes, and hyphens"
    ),
  bio: z
    .string()
    .max(300, "Bio must be 300 characters or less")
    .refine(
      (value) => value.length === 0 || value.length >= 10,
      "Bio must be at least 10 characters or left blank"
    ),
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableNotFound, setTableNotFound] = useState(false);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Partial<Record<ProfileFormField, boolean>>>({});
  const [dirtyFields, setDirtyFields] = useState<Partial<Record<ProfileFormField, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<ProfileFormValues>({
    fullName: "",
    phone: "",
    location: "",
    bio: "",
  });
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  const applyProfileToForm = (profileData: Profile) => {
    const nextValues = {
      fullName: profileData.full_name || "",
      phone: profileData.phone || "",
      bio: profileData.bio || "",
      location: profileData.location || "",
    };

    setProfile(profileData);
    setFullName(nextValues.fullName);
    setPhone(nextValues.phone);
    setBio(nextValues.bio);
    setLocation(nextValues.location);
    setInitialValues(nextValues);
    setErrors({});
    setTouchedFields({});
    setDirtyFields({});
    setHasSubmitted(false);
    setFormError(null);
  };

  const validateField = (field: ProfileFormField, value: string) => {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return undefined;
    }

    const result = profileFieldSchemas[field].safeParse(normalizedValue);
    return result.success ? undefined : result.error.issues[0]?.message;
  };

  const getNormalizedValues = (): ProfileFormValues => ({
    fullName: fullName.trim(),
    phone: phone.trim(),
    location: location.trim(),
    bio: bio.trim(),
  });

  const hasProfileChanges = () => {
    const normalizedValues = getNormalizedValues();

    return (Object.keys(normalizedValues) as ProfileFormField[]).some(
      (field) => normalizedValues[field] !== initialValues[field].trim()
    );
  };

  const getFriendlyErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "message" in error) {
      const message = typeof error.message === "string" ? error.message : "";

      if (message.includes("duplicate key value")) {
        return "We could not save your profile because a duplicate record was detected. Please refresh and try again.";
      }

      if (message) {
        return message;
      }
    }

    return "Failed to update profile. Please try again.";
  };

  const setFieldError = (field: ProfileFormField, value: string) => {
    const message = validateField(field, value);

    setErrors((currentErrors) => {
      if (!message) {
        const { [field]: _removedError, ...remainingErrors } = currentErrors;
        return remainingErrors;
      }

      if (currentErrors[field] === message) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: message,
      };
    });
  };

  const handleFieldBlur = (field: ProfileFormField, value: string) => {
    setTouchedFields((currentFields) => ({
      ...currentFields,
      [field]: true,
    }));

    if (dirtyFields[field] || hasSubmitted) {
      setFieldError(field, value);
    }
  };

  const maybeValidateField = (field: ProfileFormField, value: string, isDirty = dirtyFields[field]) => {
    if ((touchedFields[field] && isDirty) || hasSubmitted) {
      setFieldError(field, value);
    }
  };

  const validateProfileForm = () => {
    const nextErrors: ProfileFormErrors = {};
    const values: ProfileFormValues = {
      fullName,
      phone,
      location,
      bio,
    };

    (Object.keys(values) as ProfileFormField[]).forEach((field) => {
      const message = validateField(field, values[field]);
      if (message) {
        nextErrors[field] = message;
      }
    });

    setErrors(nextErrors);
    setTouchedFields({
      fullName: true,
      phone: true,
      location: true,
      bio: true,
    });
    setDirtyFields({
      fullName: true,
      phone: true,
      location: true,
      bio: true,
    });

    return Object.keys(nextErrors).length === 0;
  };

  const getInputClassName = (field: ProfileFormField, baseClassName = "") =>
    cn(
      baseClassName,
      errors[field] && "border-destructive focus-visible:ring-destructive"
    );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setTableNotFound(false);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          // Check if error is about missing table
          if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
            setTableNotFound(true);
            console.error("Profiles table not found. Please run the SQL migration in Supabase Dashboard.");
            setLoading(false);
            return;
          }
          throw error;
        }

        if (data) {
          applyProfileToForm(data);
        } else {
          // Handle cases where the signup trigger hasn't created the row yet.
          const { data: ensuredProfile, error: ensureError } = await supabase
            .from("profiles")
            .upsert(
              {
                user_id: user.id,
                full_name: user.user_metadata?.full_name || null,
                user_type: user.user_metadata?.user_type || null,
              },
              { onConflict: "user_id" }
            )
            .select()
            .single();

          if (ensureError) throw ensureError;

          if (ensuredProfile) {
            applyProfileToForm(ensuredProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setHasSubmitted(true);

    if (!validateProfileForm()) {
      setFormError("Please correct the highlighted fields before saving.");
      return;
    }

    if (!hasProfileChanges()) {
      setFormError(null);
      toast({
        title: "No changes to save",
        description: "Your profile is already up to date.",
      });
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      const normalizedValues = getNormalizedValues();
      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            full_name: normalizedValues.fullName || null,
            phone: normalizedValues.phone || null,
            bio: normalizedValues.bio || null,
            location: normalizedValues.location || null,
            user_type: profile?.user_type ?? user.user_metadata?.user_type ?? null,
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      if (updatedProfile) {
        applyProfileToForm(updatedProfile);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error) {
      const message = getFriendlyErrorMessage(error);
      console.error("Error updating profile:", error);
      setFormError(message);
      toast({
        title: "Profile update failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        
        {/* Left Column - My Profile */}
        <div className="w-full md:w-1/3">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl font-bold">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Avatar className="h-48 w-48 rounded-none bg-gray-200">
                  <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                  <AvatarFallback className="text-4xl rounded-none bg-gray-200 text-gray-500">
                    <User className="h-24 w-24" />
                  </AvatarFallback>
                </Avatar>
                
                {tableNotFound && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Database table missing. Run migration.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Account Settings */}
        <div className="w-full md:w-2/3">
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl font-bold">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Agent Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="font-semibold">
                      <User className="inline-block h-4 w-4 mr-1 mb-1" />
                      Agent Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="thk"
                      value={fullName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFullName(val);
                        setDirtyFields(prev => ({ ...prev, fullName: true }));
                      }}
                      onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
                      className={getInputClassName("fullName", "bg-gray-50/50")}
                      disabled={saving || tableNotFound}
                    />
                    {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">
                      <Mail className="inline-block h-4 w-4 mr-1 mb-1" />
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      className="bg-gray-50/50"
                      disabled
                    />
                  </div>

                  {/* Agent Type */}
                  <div className="space-y-2">
                    <Label className="font-semibold">
                      <Briefcase className="inline-block h-4 w-4 mr-1 mb-1" />
                      Agent Type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-gray-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={profile?.user_type || ""}
                      disabled
                    >
                      <option value="">Select Type</option>
                      <option value="agent">Agent</option>
                      <option value="renter">Renter</option>
                      <option value="property_owner">Property Owner</option>
                    </select>
                  </div>

                  {/* Agent Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="font-semibold">
                      <MapPin className="inline-block h-4 w-4 mr-1 mb-1" />
                      Agent Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="Select Location"
                      value={location}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocation(val);
                        setDirtyFields(prev => ({ ...prev, location: true }));
                      }}
                      onBlur={(e) => handleFieldBlur("location", e.target.value)}
                      className={getInputClassName("location", "bg-gray-50/50")}
                      disabled={saving || tableNotFound}
                    />
                    {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold">
                      <Phone className="inline-block h-4 w-4 mr-1 mb-1" />
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhone(val);
                        setDirtyFields(prev => ({ ...prev, phone: true }));
                      }}
                      onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                      className={getInputClassName("phone", "bg-gray-50/50")}
                      disabled={saving || tableNotFound}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-2">
                    <Label className="font-semibold text-green-600">
                      <Phone className="inline-block h-4 w-4 mr-1 mb-1" />
                      WhatsApp Number
                    </Label>
                    <Input
                      placeholder="+234..."
                      className="bg-gray-50/50"
                      disabled={saving || tableNotFound}
                    />
                  </div>
                  
                  {/* Website Url */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="font-semibold">
                      <ExternalLink className="inline-block h-4 w-4 mr-1 mb-1" />
                      Website Url
                    </Label>
                    <Input
                      placeholder="http://"
                      className="bg-gray-50/50"
                      disabled={saving || tableNotFound}
                    />
                  </div>

                  {/* About Agent (Bio) */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="font-semibold">
                      <FileText className="inline-block h-4 w-4 mr-1 mb-1" />
                      About Agent
                    </Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBio(val);
                        setDirtyFields(prev => ({ ...prev, bio: true }));
                      }}
                      onBlur={(e) => handleFieldBlur("bio", e.target.value)}
                      className={getInputClassName("bio", "bg-gray-50/50 min-h-[100px]")}
                      disabled={saving || tableNotFound}
                    />
                    {errors.bio && <p className="text-xs text-red-500">{errors.bio}</p>}
                  </div>
                </div>

                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    className="bg-[#5cb85c] hover:bg-[#4cae4c] text-white px-8"
                    disabled={saving || tableNotFound}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
