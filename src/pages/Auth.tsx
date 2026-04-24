import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, Briefcase } from "lucide-react";
import logo from "@/assets/homes-logo.png";
import { getAuthCallbackUrl } from "@/lib/authRedirect";
import { z } from "zod";

const userTypes = [
  { value: "property_owner", label: "Property Owner" },
  { value: "agent", label: "Real Estate Agent" },
  { value: "company", label: "Real Estate Company" },
  { value: "renter", label: "Renter" },
  { value: "buyer", label: "Buyer" },
];

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const authInputClassName =
  "h-12 rounded-2xl border-[#d9ddf4] bg-[linear-gradient(180deg,#ffffff_0%,#f8f9ff_100%)] pl-11 text-[#1f1a54] placeholder:text-[#98a0c4] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_10px_24px_rgba(31,26,84,0.05)] transition-all duration-300 focus-visible:border-[#b8c1fb] focus-visible:ring-2 focus-visible:ring-[#d7ddff] focus-visible:ring-offset-0";
const authIconClassName = "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6f7599]";
const authPasswordToggleClassName =
  "absolute right-3 top-1/2 -translate-y-1/2 text-[#7c82ab] transition-colors hover:text-[#1f1a54]";
const authLabelClassName = "text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5d648d]";

type AuthTab = "signin" | "signup";
type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  userType?: string;
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const modeParam = searchParams.get("mode");
  const authError = searchParams.get("error");
  const [activeTab, setActiveTab] = useState<AuthTab>(modeParam === "signup" ? "signup" : "signin");
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const authCallbackUrl = getAuthCallbackUrl();

  useEffect(() => {
    if (modeParam === "signin" || modeParam === "signup") {
      setActiveTab(modeParam);
    }
  }, [modeParam]);

  useEffect(() => {
    if (!authError) return;

    toast({
      title: "Authentication failed",
      description: authError,
      variant: "destructive",
    });
  }, [authError, toast]);

  useEffect(() => {
    const getRedirectPath = () => {
      // First check for scroll-gate return URL
      const returnUrl = sessionStorage.getItem('auth_return_url');
      if (returnUrl) {
        sessionStorage.removeItem('auth_return_url');
        return returnUrl;
      }
      // Then check for intended action
      const intended = sessionStorage.getItem('intended_action');
      if (intended) {
        try {
          const action = JSON.parse(intended);
          return action.page || '/';
        } catch {
          return '/';
        }
      }
      return '/';
    };

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(getRedirectPath());
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(getRedirectPath());
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const normalizedEmail = normalizeEmail(email);
    
    try {
      emailSchema.parse(normalizedEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.issues[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.issues[0].message;
      }
    }

    if (activeTab === "signup") {
      if (!fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
      if (!userType) {
        newErrors.userType = "Please select your account type";
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as AuthTab);
    resetForm();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("invalid login credentials")) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("email not confirmed")) {
          toast({
            title: "Email confirmation required",
            description: "Please confirm your email address from your inbox before signing in.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        // Navigation will happen automatically via the useEffect that listens to auth state changes
      }
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const normalizedEmail = normalizeEmail(email);
      const redirectUrl = authCallbackUrl;
      
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
            user_type: userType,
          },
        },
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("user already registered")) {
          toast({
            title: "Account exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive",
          });
          setActiveTab("signin");
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        const existingUserDetected =
          !data.session &&
          data.user &&
          Array.isArray(data.user.identities) &&
          data.user.identities.length === 0;

        if (existingUserDetected) {
          toast({
            title: "Account already exists",
            description: "This email is already registered. Please sign in with your existing password.",
            variant: "destructive",
          });
          setActiveTab("signin");
          setPassword("");
          setConfirmPassword("");
          return;
        }

        if (data.session) {
          toast({
            title: "Account created!",
            description: "Welcome to Homes. You are now signed in.",
          });
          return;
        }

        toast({
          title: "Check your email",
          description: "Your account was created. Please confirm your email before signing in.",
        });
        setActiveTab("signin");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setUserType("");
    setErrors({});
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: authCallbackUrl,
        },
      });

      if (error) {
        console.error("Google OAuth error:", error);
        toast({
          title: "Google sign in failed",
          description: error.message || "An error occurred",
          variant: "destructive",
        });
      }
      // Supabase automatically handles the redirect to Google
    } catch (error) {
      console.error("Google sign in error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)] px-4 py-4 sm:px-6 sm:py-6 flex flex-col">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-16 top-28 h-48 w-48 rounded-full bg-[#eef1ff] blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute -right-14 bottom-16 h-44 w-44 rounded-full bg-[#e9ecff] blur-3xl sm:h-64 sm:w-64" />

      {/* Header */}
      <header className="relative z-10 border-0 bg-transparent">
        <div className="flex h-16 items-center justify-between px-1">
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="Homes" className="h-10 w-auto" />
          </Link>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[#d7daf0] bg-white/85 px-4 text-[#241f66] shadow-[0_10px_25px_rgba(31,26,84,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bfc6f5] hover:bg-white"
          >
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md overflow-hidden border-[#d7daf0] bg-white/90 shadow-[0_20px_50px_rgba(31,26,84,0.12)] backdrop-blur">
          <div className="h-1.5 w-full bg-[linear-gradient(90deg,#1f1a54_0%,#5564d8_55%,#d8a95b_100%)]" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 inline-flex items-center rounded-full border border-[#e4e7f7] bg-[#f8f9ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#5d648d] shadow-sm">
              Homes Nigeria Secure Access
            </div>
            <CardTitle className="text-2xl font-bold text-[#1f1a54]">Welcome to Homes</CardTitle>
            <CardDescription className="text-[#6f7599]">
              {activeTab === "signin" 
                ? "Sign in to access your account" 
                : "Create an account to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-6 grid w-full grid-cols-2 rounded-2xl border border-[#e0e4f6] bg-[#f6f7ff] p-1">
                <TabsTrigger
                  value="signin"
                  className="rounded-[14px] text-[#5d648d] data-[state=active]:bg-white data-[state=active]:text-[#1f1a54] data-[state=active]:shadow-[0_10px_24px_rgba(31,26,84,0.08)]"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-[14px] text-[#5d648d] data-[state=active]:bg-white data-[state=active]:text-[#1f1a54] data-[state=active]:shadow-[0_10px_24px_rgba(31,26,84,0.08)]"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className={authLabelClassName}>Email</Label>
                    <div className="relative">
                      <Mail className={authIconClassName} />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className={authInputClassName}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className={authLabelClassName}>Password</Label>
                    <div className="relative">
                      <Lock className={authIconClassName} />
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className={`${authInputClassName} pr-10`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={authPasswordToggleClassName}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl bg-[#26225f] text-white shadow-[0_16px_32px_rgba(38,34,95,0.18)] hover:bg-[#1f1b50]"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-[#d9ddf4] bg-[#fbfbff] text-[#1f1a54] shadow-[0_10px_24px_rgba(31,26,84,0.05)] hover:bg-white"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      "Connecting..."
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs leading-6 text-[#7a81a8]">
                    Secure Google sign-in returns you to Homes Nigeria after account verification or 2-step confirmation.
                  </p>

                  <div className="text-center text-sm text-[#6f7599]">
                    Prefer to keep browsing?{" "}
                    <Link to="/" className="font-medium text-[#26225f] hover:text-[#1f1a54]">
                      Go back home
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className={authLabelClassName}>Full Name</Label>
                    <div className="relative">
                      <User className={authIconClassName} />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                        className={authInputClassName}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-type" className={authLabelClassName}>Account Type</Label>
                    <div className="relative">
                      <Briefcase className={`${authIconClassName} z-10`} />
                      <Select value={userType} onValueChange={setUserType} disabled={isLoading}>
                        <SelectTrigger className={`${authInputClassName} pl-11`}>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.userType && <p className="text-sm text-destructive">{errors.userType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className={authLabelClassName}>Email</Label>
                    <div className="relative">
                      <Mail className={authIconClassName} />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className={authInputClassName}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className={authLabelClassName}>Password</Label>
                    <div className="relative">
                      <Lock className={authIconClassName} />
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className={`${authInputClassName} pr-10`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={authPasswordToggleClassName}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className={authLabelClassName}>Confirm Password</Label>
                    <div className="relative">
                      <Lock className={authIconClassName} />
                      <Input
                        id="signup-confirm-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className={authInputClassName}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-2xl bg-[#26225f] text-white shadow-[0_16px_32px_rgba(38,34,95,0.18)] hover:bg-[#1f1b50]"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-[#d9ddf4] bg-[#fbfbff] text-[#1f1a54] shadow-[0_10px_24px_rgba(31,26,84,0.05)] hover:bg-white"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      "Connecting..."
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs leading-6 text-[#7a81a8]">
                    If Google asks you to confirm your account or finish 2-step verification, Homes Nigeria will bring you back here automatically.
                  </p>

                  <div className="text-center text-sm text-[#6f7599]">
                    Want to explore first?{" "}
                    <Link to="/" className="font-medium text-[#26225f] hover:text-[#1f1a54]">
                      Go back home
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
