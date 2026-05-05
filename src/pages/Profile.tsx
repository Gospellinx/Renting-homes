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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Homes" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open("https://supabase.com/dashboard/projects", "_blank")}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Error message if table not found */}
        {tableNotFound && (
          <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Database Setup Required</h3>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    The profiles table hasn't been created yet. Please run the SQL migration in your Supabase dashboard.
                  </p>
                  <ol className="list-decimal list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>Go to <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Supabase Dashboard</a></li>
                    <li>Open your project (hggjukqgjxcypokjguwv)</li>
                    <li>Click SQL Editor → New Query</li>
                    <li>Paste and run the SQL from <code className="bg-red-200 dark:bg-red-900 px-2 py-1 rounded">supabase/migrations/profiles_table.sql</code></li>
                    <li>Refresh this page</li>
                  </ol>
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => window.open("https://supabase.com/dashboard/projects", "_blank")}
                    className="mt-2 gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Supabase Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">Your Profile</CardTitle>
            <CardDescription>
              {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      const isDirty = nextValue !== initialValues.fullName;
                      setFormError(null);
                      setFullName(nextValue);
                      setDirtyFields((currentFields) => ({
                        ...currentFields,
                        fullName: isDirty,
                      }));
                      maybeValidateField("fullName", nextValue, isDirty);
                    }}
                    onBlur={(e) => handleFieldBlur("fullName", e.target.value)}
                    className={getInputClassName("fullName", "pl-10")}
                    autoComplete="name"
                    maxLength={80}
                    disabled={saving || tableNotFound}
                    aria-invalid={!!errors.fullName}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    className="pl-10 bg-muted"
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      const isDirty = nextValue !== initialValues.phone;
                      setFormError(null);
                      setPhone(nextValue);
                      setDirtyFields((currentFields) => ({
                        ...currentFields,
                        phone: isDirty,
                      }));
                      maybeValidateField("phone", nextValue, isDirty);
                    }}
                    onBlur={(e) => handleFieldBlur("phone", e.target.value)}
                    className={getInputClassName("phone", "pl-10")}
                    autoComplete="tel"
                    maxLength={20}
                    disabled={saving || tableNotFound}
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone ? (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">Use a valid Nigerian or international phone number.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g., Lagos, Nigeria"
                    value={location}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      const isDirty = nextValue !== initialValues.location;
                      setFormError(null);
                      setLocation(nextValue);
                      setDirtyFields((currentFields) => ({
                        ...currentFields,
                        location: isDirty,
                      }));
                      maybeValidateField("location", nextValue, isDirty);
                    }}
                    onBlur={(e) => handleFieldBlur("location", e.target.value)}
                    className={getInputClassName("location", "pl-10")}
                    autoComplete="address-level2"
                    maxLength={100}
                    disabled={saving || tableNotFound}
                    aria-invalid={!!errors.location}
                  />
                </div>
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={bio}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      const isDirty = nextValue !== initialValues.bio;
                      setFormError(null);
                      setBio(nextValue);
                      setDirtyFields((currentFields) => ({
                        ...currentFields,
                        bio: isDirty,
                      }));
                      maybeValidateField("bio", nextValue, isDirty);
                    }}
                    onBlur={(e) => handleFieldBlur("bio", e.target.value)}
                    className={getInputClassName("bio", "pl-10 min-h-[100px] resize-none")}
                    maxLength={300}
                    disabled={saving || tableNotFound}
                    aria-invalid={!!errors.bio}
                  />
                </div>
                {errors.bio ? (
                  <p className="text-sm text-destructive">{errors.bio}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{bio.trim().length}/300 characters</p>
                )}
              </div>

              {formError && (
                <Alert variant="destructive">
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={saving || tableNotFound}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : tableNotFound ? (
                  "Complete Setup First"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* User Type Specific Section */}
        {profile?.user_type && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {profile.user_type === 'agent' && <Briefcase className="h-5 w-5 text-primary" />}
                  {profile.user_type === 'company' && <Building className="h-5 w-5 text-primary" />}
                  {profile.user_type === 'property_owner' && <Home className="h-5 w-5 text-primary" />}
                  {(profile.user_type === 'renter' || profile.user_type === 'buyer') && <Search className="h-5 w-5 text-primary" />}
                  {profile.user_type === 'agent' ? 'Agent Profile' : 
                   profile.user_type === 'company' ? 'Company Profile' :
                   profile.user_type === 'property_owner' ? 'Property Owner' :
                   profile.user_type === 'renter' ? 'Renter Profile' :
                   profile.user_type === 'buyer' ? 'Buyer Profile' : 'Profile'}
                </CardTitle>
                <Badge variant="secondary" className="capitalize">
                  {profile.user_type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agent-specific section */}
              {profile.user_type === 'agent' && (
                <div className="space-y-4">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Portfolio Section</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Showcase your successful property transactions and build trust with clients.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/upload-property">
                        <Building className="h-4 w-4 mr-2" />
                        Add Property Listing
                      </Link>
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Agent Stats</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-primary">0</p>
                        <p className="text-xs text-muted-foreground">Listings</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-primary">0</p>
                        <p className="text-xs text-muted-foreground">Sold</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-primary">0</p>
                        <p className="text-xs text-muted-foreground">Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Company-specific section */}
              {profile.user_type === 'company' && (
                <div className="space-y-4">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Company Portfolio</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Manage your company's property listings and team members.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/upload-property">
                          <Building className="h-4 w-4 mr-2" />
                          Add Listing
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/joint-ventures">
                          <Briefcase className="h-4 w-4 mr-2" />
                          Joint Ventures
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Owner section */}
              {profile.user_type === 'property_owner' && (
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Your Properties</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    List and manage your properties, or explore joint venture opportunities.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/upload-property">
                        <Home className="h-4 w-4 mr-2" />
                        List Property
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/joint-ventures">
                        <Briefcase className="h-4 w-4 mr-2" />
                        JV Opportunities
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Renter/Buyer section */}
              {(profile.user_type === 'renter' || profile.user_type === 'buyer') && (
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {profile.user_type === 'renter' ? 'Find Your Next Home' : 'Find Your Dream Property'}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {profile.user_type === 'renter' 
                      ? 'Browse rental properties and connect with verified landlords.'
                      : 'Explore properties for sale and connect with verified sellers.'}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={profile.user_type === 'renter' ? '/rentals' : '/buy'}>
                        <Search className="h-4 w-4 mr-2" />
                        Browse Properties
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Email Notification Settings */}
        <div className="mt-6">
          <EmailNotificationSettings />
        </div>

        {/* Admin Link (only visible if admin) */}
        {profile?.user_type === 'admin' && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <Link to="/admin" className="flex items-center gap-2 text-primary hover:underline">
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
