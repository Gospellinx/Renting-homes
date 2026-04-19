import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import AdBanner from '@/components/AdBanner';
import AuthPrompt from '@/components/AuthPrompt';
import { 
  Upload, 
  MapPin, 
  FileText, 
  Camera, 
  CheckCircle, 
  AlertTriangle,
  Home,
  Building,
  TreePine,
  ArrowLeft,
  Clock,
  Shield,
  Users,
  Handshake,
  DollarSign,
  FileCheck,
  Briefcase
} from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyFormData {
  propertyType: string;
  title: string;
  description: string;
  location: string;
  state: string;
  lga: string;
  price: string;
  size: string;
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  verificationType: string;
  // Joint Venture specific fields
  expectedInvestment: string;
  partnershipTerms: string;
  developerRequirements: string;
  landSize: string;
  proposedDevelopment: string;
}

const UploadProperty = () => {
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; reason: string; matches: any[] } | null>(null);
  const { toast } = useToast();

  const form = useForm<PropertyFormData>();

  // Show auth prompt for unauthenticated users
  if (!loading && !user) {
    return (
      <AuthPrompt 
        icon={Upload}
        title="Upload Property"
        description="Create an account to list your property on our platform"
      />
    );
  }

  const propertyTypes = [
    { id: "land", label: "Land", icon: TreePine, desc: "Vacant land, plots, or development sites" },
    { id: "rental", label: "Rental Property", icon: Home, desc: "Apartments, houses for rent" },
    { id: "building", label: "Building/Sale", icon: Building, desc: "Properties for sale or investment" },
    { id: "shop_rental", label: "Shop Rental", icon: Briefcase, desc: "Shops and commercial retail spaces" },
    { id: "joint_venture", label: "Joint Venture", icon: Handshake, desc: "Partnership opportunities for developers" }
  ];

  const nigerianStates = [
    "Abuja", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", 
    "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", 
    "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", 
    "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", 
    "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
  ];

  const verificationTypes = [
    { id: "certificate", label: "Certificate of Occupancy (C of O)" },
    { id: "deed", label: "Deed of Assignment" },
    { id: "survey", label: "Survey Plan" },
    { id: "receipt", label: "Purchase Receipt" },
    { id: "other", label: "Other Legal Documents" }
  ];

  const handleFileUpload = (type: 'image' | 'document', files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).map(file => URL.createObjectURL(file));
    
    if (type === 'image') {
      setUploadedImages(prev => [...prev, ...fileArray]);
    } else {
      setUploadedDocuments(prev => [...prev, ...fileArray]);
    }
  };

  const checkForDuplicate = async (data: PropertyFormData) => {
    setIsCheckingDuplicate(true);
    setDuplicateWarning(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-duplicate-property`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            location: data.location,
            state: data.state,
            lga: data.lga,
            property_type: selectedPropertyType,
          }),
        }
      );
      const result = await response.json();
      if (result.isDuplicate) {
        setDuplicateWarning(result);
        toast({
          title: "⚠️ Possible Duplicate Detected",
          description: result.reason || "A similar property already exists on the platform.",
          variant: "destructive",
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error("Duplicate check error:", err);
      return false; // Allow submission if check fails
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    const isDuplicate = await checkForDuplicate(data);
    if (isDuplicate) return;

    // Save to database
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.from("properties").insert({
        user_id: user!.id,
        title: data.title,
        description: data.description,
        property_type: selectedPropertyType,
        location: data.location,
        state: data.state,
        lga: data.lga,
        price: data.price,
        size: data.size,
        owner_name: data.ownerName,
        owner_phone: data.ownerPhone,
        owner_email: data.ownerEmail,
        verification_type: data.verificationType,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Property Submitted Successfully!",
        description: "Your property is now under review. You'll be notified within 2-3 business days.",
      });
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Could not submit property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const getStepProgress = () => (currentStep / 4) * 100;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-lg font-semibold">Back to Home</span>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Property Submitted Successfully!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for submitting your property. Our verification team will review your submission.
            </p>

            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Review Process: 2-3 business days</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Verification includes document and location checks</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>You'll be contacted via phone and email</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What happens next?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">1</div>
                      <h4 className="font-medium">Document Review</h4>
                      <p className="text-muted-foreground">Legal documents verified</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">2</div>
                      <h4 className="font-medium">Location Verification</h4>
                      <p className="text-muted-foreground">Property location confirmed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">3</div>
                      <h4 className="font-medium">Live on Platform</h4>
                      <p className="text-muted-foreground">Property goes live</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-8 space-x-4">
              <Button asChild>
                <Link to="/">Return Home</Link>
              </Button>
              <Button variant="outline" onClick={() => {setIsSubmitted(false); setCurrentStep(1);}}>
                Submit Another Property
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-[#1f1a54] hover:text-[#26225f]">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-semibold">Back to Home</span>
          </Link>
          <Badge variant="outline" className="border-[#d7daf0] text-[#26225f]">Step {currentStep} of 4</Badge>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Upload Property Ad Banner */}
          <div className="mb-8">
            <AdBanner type="banner" />
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Upload Your Property</h1>
            <p className="text-xl text-muted-foreground mb-6">
              List your land, rental, or building property on our platform
            </p>
            <Progress value={getStepProgress()} className="w-full max-w-md mx-auto" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Step 1: Property Type Selection */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Choose Property Type</CardTitle>
                    <CardDescription>Select the type of property you want to list</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {propertyTypes.map((type) => (
                        <Card 
                          key={type.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedPropertyType === type.id ? 'ring-2 ring-primary border-primary' : ''
                          }`}
                          onClick={() => setSelectedPropertyType(type.id)}
                        >
                          <CardContent className="pt-6 text-center">
                            <type.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                            <h3 className="font-semibold mb-2">{type.label}</h3>
                            <p className="text-sm text-muted-foreground">{type.desc}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <div className="mt-8 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Platform Guidelines</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            All properties undergo verification. Fake listings will be removed. 
                            Only legitimate property owners or authorized agents can list properties.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button 
                        onClick={nextStep} 
                        disabled={!selectedPropertyType}
                        className="w-full md:w-auto"
                      >
                        Continue to Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Property Details */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 2: Property Details</CardTitle>
                    <CardDescription>Provide detailed information about your property</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., 2-Bedroom Apartment in Lekki" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={selectedPropertyType === 'rental' ? 'e.g., ₦500,000/month' : 'e.g., ₦25,000,000'} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your property, its features, and what makes it special..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nigerianStates.map((state) => (
                                  <SelectItem key={state} value={state.toLowerCase()}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lga"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LGA *</FormLabel>
                            <FormControl>
                              <Input placeholder="Local Government Area" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={selectedPropertyType === 'land' ? 'e.g., 500 sqm' : 'e.g., 3 bedrooms'} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address, landmarks, area description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Joint Venture Specific Fields */}
                    {selectedPropertyType === "joint_venture" && (
                      <>
                        <div className="border-t pt-6 mt-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Handshake className="h-5 w-5 text-primary" />
                            Joint Venture Details
                          </h3>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <FormField
                              control={form.control}
                              name="landSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Land Size *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., 2,000 sqm or 1 hectare" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="expectedInvestment"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expected Investment Amount *</FormLabel>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <FormControl>
                                      <Input className="pl-10" placeholder="e.g., ₦500,000,000" {...field} />
                                    </FormControl>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="proposedDevelopment"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Proposed Development Type *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Residential Estate, Shopping Mall, Mixed-Use Development" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="partnershipTerms"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Partnership Terms *</FormLabel>
                                <div className="relative">
                                  <FileCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Textarea 
                                      className="pl-10 min-h-[100px]"
                                      placeholder="Describe your preferred partnership structure (e.g., profit sharing ratio, equity split, timeline expectations...)"
                                      {...field} 
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="developerRequirements"
                            render={({ field }) => (
                              <FormItem className="mt-4">
                                <FormLabel>Developer Requirements *</FormLabel>
                                <div className="relative">
                                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Textarea 
                                      className="pl-10 min-h-[100px]"
                                      placeholder="What qualifications do you expect from developers? (e.g., minimum portfolio size, years of experience, financial capacity, CAC registration...)"
                                      {...field} 
                                    />
                                  </FormControl>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="bg-accent/10 p-4 rounded-lg mt-4">
                          <div className="flex items-start space-x-3">
                            <AlertTriangle className="h-5 w-5 text-accent mt-0.5" />
                            <div>
                              <h4 className="font-medium">JV Application Process</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Interested developers will submit their portfolio, company letterhead, and CAC documentation. 
                                You'll be able to review and approve applicants before sharing detailed property information.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button onClick={nextStep}>
                        Continue to Media
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Media Upload */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 3: Property Media</CardTitle>
                    <CardDescription>Upload photos and verification documents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="photos" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="photos">Property Photos</TabsTrigger>
                        <TabsTrigger value="documents">Legal Documents</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="photos" className="space-y-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-medium mb-2">Upload Property Photos</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Add photos to showcase your property (JPG, PNG up to 5MB each)
                          </p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleFileUpload('image', e.target.files)}
                            className="hidden"
                            id="photo-upload"
                          />
                          <Button asChild variant="outline">
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Choose Photos
                            </label>
                          </Button>
                        </div>
                        
                        {uploadedImages.length > 0 && (
                          <div className="grid grid-cols-3 gap-4">
                            {uploadedImages.map((img, index) => (
                              <img 
                                key={index} 
                                src={img} 
                                alt={`Property ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                              />
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="documents" className="space-y-4">
                        <FormField
                          control={form.control}
                          name="verificationType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {verificationTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="font-medium mb-2">Upload Legal Documents</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Upload legal documents to verify ownership (PDF, JPG, PNG up to 10MB)
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('document', e.target.files)}
                            className="hidden"
                            id="document-upload"
                          />
                          <Button asChild variant="outline">
                            <label htmlFor="document-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Documents
                            </label>
                          </Button>
                        </div>

                        {uploadedDocuments.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Uploaded Documents:</h4>
                            {uploadedDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">Document {index + 1}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button onClick={nextStep}>
                        Continue to Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Contact Information */}
              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 4: Contact Information</CardTitle>
                    <CardDescription>Provide your contact details for verification and inquiries</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ownerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+234 XXX XXX XXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="ownerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Verification Process</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Our team will contact you within 2-3 business days to verify your property and documents. 
                            Your contact information will only be shared with serious, verified inquirers.
                          </p>
                        </div>
                      </div>
                    </div>

                    {duplicateWarning && duplicateWarning.isDuplicate && (
                      <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <h4 className="font-medium text-destructive">Duplicate Property Detected</h4>
                            <p className="text-sm text-muted-foreground mt-1">{duplicateWarning.reason}</p>
                            {duplicateWarning.matches.length > 0 && (
                              <ul className="mt-2 text-sm space-y-1">
                                {duplicateWarning.matches.map((m: any, i: number) => (
                                  <li key={i} className="text-muted-foreground">• {m.title} — {m.location}</li>
                                ))}
                              </ul>
                            )}
                            <p className="text-sm mt-2 text-muted-foreground">
                              If you believe this is an error, please modify your property details and try again.
                              You can also report the existing listing if it doesn't belong to the current uploader.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isCheckingDuplicate}>
                        {isCheckingDuplicate && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {isCheckingDuplicate ? "Checking for duplicates..." : "Submit Property for Review"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default UploadProperty;