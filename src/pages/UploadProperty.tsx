import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building,
  Camera,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  Handshake,
  Home,
  Loader2,
  Shield,
  TreePine,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useForm, type FieldErrors, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FunctionsHttpError } from "@supabase/supabase-js";

import AdBanner from "@/components/AdBanner";
import AuthPrompt from "@/components/AuthPrompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { getLgasForState, nigerianStates } from "@/data/nigerianStateLgas";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  buildPropertySubmissionPayload,
  buildStoragePath,
  getStepForField,
  jointVentureFields,
  PROPERTY_DOCUMENT_BUCKET,
  PROPERTY_DOCUMENT_LIMITS,
  PROPERTY_IMAGE_BUCKET,
  PROPERTY_IMAGE_LIMITS,
  PROPERTY_TYPES,
  propertyFormDefaults,
  type PropertyFormData,
  type PropertySubmissionResponse,
  revokeMediaPreviews,
  type SelectedMediaFile,
  stepTwoBaseFields,
  uploadPropertySchema,
  validateAndPrepareFiles,
  VERIFICATION_TYPES,
  type DuplicateWarning,
} from "@/lib/propertySubmission";

const getStateLabel = (state: string) =>
  state === "Federal Capital Territory" ? "Abuja (FCT)" : state;

const propertyTypeIcons = {
  land: TreePine,
  rental: Home,
  building: Building,
  shop_rental: Briefcase,
  joint_venture: Handshake,
} as const;

const stepTwoFields = [...stepTwoBaseFields] as FieldPath<PropertyFormData>[];
const jointVentureStepFields = [...jointVentureFields] as FieldPath<PropertyFormData>[];

type SubmissionPhase = "uploading" | "submitting" | null;

const UploadProperty = () => {
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageFiles, setImageFiles] = useState<SelectedMediaFile[]>([]);
  const [documentFiles, setDocumentFiles] = useState<SelectedMediaFile[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);
  const [mediaErrors, setMediaErrors] = useState<{ images?: string; documents?: string }>({});
  const [submissionIssue, setSubmissionIssue] = useState<{
    title: string;
    description: string;
    hint?: string;
  } | null>(null);
  const [submissionPhase, setSubmissionPhase] = useState<SubmissionPhase>(null);

  const imageFilesRef = useRef<SelectedMediaFile[]>([]);
  const documentFilesRef = useRef<SelectedMediaFile[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(uploadPropertySchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: propertyFormDefaults,
  });

  const selectedPropertyType = form.watch("propertyType");
  const selectedState = form.watch("state");
  const availableLgas = getLgasForState(selectedState);

  imageFilesRef.current = imageFiles;
  documentFilesRef.current = documentFiles;

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!form.getValues("ownerEmail") && user.email) {
      form.setValue("ownerEmail", user.email, { shouldDirty: false });
    }

    const fullName =
      typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";

    if (!form.getValues("ownerName") && fullName) {
      form.setValue("ownerName", fullName, { shouldDirty: false });
    }
  }, [form, user]);

  useEffect(() => {
    return () => {
      revokeMediaPreviews(imageFilesRef.current);
      revokeMediaPreviews(documentFilesRef.current);
    };
  }, []);

  if (!loading && !user) {
    return (
      <AuthPrompt
        icon={Upload}
        title="Upload Property"
        description="Create an account to list your property on our platform"
      />
    );
  }

  const clearSubmissionState = () => {
    setDuplicateWarning(null);
    setSubmissionIssue(null);
  };

  const resetMedia = () => {
    revokeMediaPreviews(imageFiles);
    revokeMediaPreviews(documentFiles);
    setImageFiles([]);
    setDocumentFiles([]);
    setMediaErrors({});
  };

  const resetFormFlow = () => {
    resetMedia();
    setIsSubmitted(false);
    setCurrentStep(1);
    clearSubmissionState();
    setSubmissionPhase(null);
    form.reset({
      ...propertyFormDefaults,
      ownerEmail: user?.email ?? "",
      ownerName:
        typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "",
    });
  };

  const handleStepOneContinue = () => {
    if (!selectedPropertyType) {
      form.setError("propertyType", {
        type: "manual",
        message: "Select a property type to continue",
      });
      return;
    }

    nextStep();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleStepTwoContinue = async () => {
    const fieldsToValidate =
      selectedPropertyType === "joint_venture"
        ? [...stepTwoFields, ...jointVentureStepFields]
        : stepTwoFields;

    const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });

    if (isValid) {
      nextStep();
    }
  };

  const validateMediaStep = () => {
    const nextMediaErrors = {
      images: imageFiles.length > 0 ? undefined : "Upload at least one property photo.",
      documents: documentFiles.length > 0 ? undefined : "Upload at least one legal document.",
    };

    setMediaErrors(nextMediaErrors);
    return !nextMediaErrors.images && !nextMediaErrors.documents;
  };

  const handleStepThreeContinue = async () => {
    const isVerificationValid = await form.trigger("verificationType", { shouldFocus: true });
    const isMediaValid = validateMediaStep();

    if (isVerificationValid && isMediaValid) {
      nextStep();
    }
  };

  const handleFileUpload = (kind: "image" | "document", files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    clearSubmissionState();

    const fileArray = Array.from(files);
    const existingCount = kind === "image" ? imageFiles.length : documentFiles.length;
    const { acceptedFiles, rejectedErrors } = validateAndPrepareFiles(kind, fileArray, existingCount);

    if (kind === "image") {
      setImageFiles((current) => [...current, ...acceptedFiles]);
      setMediaErrors((current) => ({ ...current, images: acceptedFiles.length > 0 ? undefined : current.images }));
    } else {
      setDocumentFiles((current) => [...current, ...acceptedFiles]);
      setMediaErrors((current) => ({
        ...current,
        documents: acceptedFiles.length > 0 ? undefined : current.documents,
      }));
    }

    if (rejectedErrors.length > 0) {
      const firstError = rejectedErrors[0];
      setMediaErrors((current) => ({
        ...current,
        [kind === "image" ? "images" : "documents"]: firstError,
      }));
      toast({
        title: kind === "image" ? "Some photos were not added" : "Some documents were not added",
        description: firstError,
        variant: "destructive",
      });
    }
  };

  const removeMediaFile = (kind: "image" | "document", fileId: string) => {
    if (kind === "image") {
      setImageFiles((current) => {
        const target = current.find((file) => file.id === fileId);
        if (target) {
          revokeMediaPreviews([target]);
        }
        return current.filter((file) => file.id !== fileId);
      });
      setMediaErrors((current) => ({ ...current, images: undefined }));
      return;
    }

    setDocumentFiles((current) => current.filter((file) => file.id !== fileId));
    setMediaErrors((current) => ({ ...current, documents: undefined }));
  };

  const cleanupUploadedMedia = async (paths: { imagePaths: string[]; documentPaths: string[] }) => {
    const cleanupTasks: Promise<unknown>[] = [];

    if (paths.imagePaths.length > 0) {
      cleanupTasks.push(supabase.storage.from(PROPERTY_IMAGE_BUCKET).remove(paths.imagePaths));
    }

    if (paths.documentPaths.length > 0) {
      cleanupTasks.push(supabase.storage.from(PROPERTY_DOCUMENT_BUCKET).remove(paths.documentPaths));
    }

    if (cleanupTasks.length > 0) {
      await Promise.allSettled(cleanupTasks);
    }
  };

  const uploadSelectedMedia = async (propertyType: string) => {
    if (!user) {
      throw new Error("You must be signed in to upload property files.");
    }

    const imagePaths: string[] = [];
    const imageUrls: string[] = [];
    const documentPaths: string[] = [];

    try {
      for (const image of imageFiles) {
        const storagePath = buildStoragePath(user.id, propertyType, "image", image.fileName);
        const { error } = await supabase.storage.from(PROPERTY_IMAGE_BUCKET).upload(storagePath, image.file, {
          cacheControl: "3600",
          contentType: image.file.type || undefined,
          upsert: false,
        });

        if (error) {
          throw new Error(`Could not upload ${image.fileName}. ${error.message}`);
        }

        imagePaths.push(storagePath);
        imageUrls.push(supabase.storage.from(PROPERTY_IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl);
      }

      for (const document of documentFiles) {
        const storagePath = buildStoragePath(user.id, propertyType, "document", document.fileName);
        const { error } = await supabase.storage
          .from(PROPERTY_DOCUMENT_BUCKET)
          .upload(storagePath, document.file, {
            cacheControl: "3600",
            contentType: document.file.type || undefined,
            upsert: false,
          });

        if (error) {
          throw new Error(`Could not upload ${document.fileName}. ${error.message}`);
        }

        documentPaths.push(storagePath);
      }

      return { imagePaths, imageUrls, documentPaths };
    } catch (error) {
      await cleanupUploadedMedia({ imagePaths, documentPaths });
      throw error;
    }
  };

  const applyBackendErrors = (fieldErrors?: PropertySubmissionResponse["fieldErrors"]) => {
    if (!fieldErrors) {
      return;
    }

    const nextMediaErrors: { images?: string; documents?: string } = {};
    let earliestStep = 4;

    Object.entries(fieldErrors).forEach(([fieldName, message]) => {
      if (!message) {
        return;
      }

      if (fieldName === "images" || fieldName === "documents") {
        nextMediaErrors[fieldName] = message;
        earliestStep = Math.min(earliestStep, 3);
        return;
      }

      const typedFieldName = fieldName as keyof PropertyFormData;
      form.setError(typedFieldName, {
        type: "server",
        message,
      });
      earliestStep = Math.min(earliestStep, getStepForField(typedFieldName));
    });

    if (nextMediaErrors.images || nextMediaErrors.documents) {
      setMediaErrors((current) => ({ ...current, ...nextMediaErrors }));
    }

    setCurrentStep(earliestStep);
  };

  const handleInvalidSubmit = (errors: FieldErrors<PropertyFormData>) => {
    const firstField = Object.keys(errors)[0] as keyof PropertyFormData | undefined;
    if (!firstField) {
      return;
    }

    setCurrentStep(getStepForField(firstField));
  };

  const onSubmit = async (data: PropertyFormData) => {
    clearSubmissionState();
    setMediaErrors({});

    const isMediaValid = validateMediaStep();
    if (!isMediaValid) {
      setCurrentStep(3);
      return;
    }

    setSubmissionPhase("uploading");

    let uploads: { imagePaths: string[]; imageUrls: string[]; documentPaths: string[] } | null = null;

    try {
      uploads = await uploadSelectedMedia(data.propertyType);
      setSubmissionPhase("submitting");

      const payload = buildPropertySubmissionPayload(data, {
        imageUrls: uploads.imageUrls,
        documentPaths: uploads.documentPaths,
      });

      const { data: response, error } = await supabase.functions.invoke<PropertySubmissionResponse>(
        "submit-property-listing",
        {
          body: payload,
        }
      );

      const responsePayload =
        error instanceof FunctionsHttpError
          ? ((await error.context.json()) as PropertySubmissionResponse)
          : response;

      if (error && !(error instanceof FunctionsHttpError)) {
        throw new Error(error.message || "We could not submit this property right now.");
      }

      if (!responsePayload?.ok) {
        await cleanupUploadedMedia({
          imagePaths: uploads.imagePaths,
          documentPaths: uploads.documentPaths,
        });

        if (responsePayload?.errorType === "validation") {
          applyBackendErrors(responsePayload.fieldErrors);
          setSubmissionIssue({
            title: "Some details still need attention",
            description: responsePayload.message || "Fix the highlighted fields and try again.",
          });
          return;
        }

        if (responsePayload?.errorType === "duplicate" && responsePayload.duplicateWarning) {
          setDuplicateWarning(responsePayload.duplicateWarning);
          setSubmissionIssue({
            title: "Possible duplicate property",
            description: responsePayload.message || responsePayload.duplicateWarning.reason,
          });
          return;
        }

        if (responsePayload?.errorType === "schema_not_ready") {
          setSubmissionIssue({
            title: "Property submission is not ready yet",
            description:
              responsePayload.message ||
              "Property review could not start because the listing database is not ready on this environment.",
            hint: responsePayload.hint,
          });
          toast({
            title: "Submission unavailable",
            description: "Property listing setup is incomplete on this environment.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(responsePayload?.message || "We could not submit this property right now.");
      }

      setIsSubmitted(true);
      toast({
        title: "Property submitted successfully",
        description: "Your property is now under review. You will hear from us within 2 to 3 business days.",
      });
    } catch (error) {
      if (uploads) {
        await cleanupUploadedMedia({
          imagePaths: uploads.imagePaths,
          documentPaths: uploads.documentPaths,
        });
      }

      const message = error instanceof Error ? error.message : "Could not submit property. Please try again.";
      setSubmissionIssue({
        title: "We could not submit this property",
        description: message,
      });
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSubmissionPhase(null);
    }
  };

  const getStepProgress = () => (currentStep / 4) * 100;
  const isSubmitting = submissionPhase !== null;
  const submitButtonLabel =
    submissionPhase === "uploading"
      ? "Uploading files..."
      : submissionPhase === "submitting"
        ? "Submitting property..."
        : "Submit Property for Review";

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
                    <span>You will be contacted via phone and email</span>
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
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        1
                      </div>
                      <h4 className="font-medium">Document Review</h4>
                      <p className="text-muted-foreground">Legal documents verified</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        2
                      </div>
                      <h4 className="font-medium">Location Verification</h4>
                      <p className="text-muted-foreground">Property location confirmed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                        3
                      </div>
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
              <Button variant="outline" onClick={resetFormFlow}>
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
          <Badge variant="outline" className="border-[#d7daf0] text-[#26225f]">
            Step {currentStep} of 4
          </Badge>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
            <form onSubmit={form.handleSubmit(onSubmit, handleInvalidSubmit)} className="space-y-8">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Choose Property Type</CardTitle>
                    <CardDescription>Select the type of property you want to list</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {PROPERTY_TYPES.map((type) => {
                        const Icon = propertyTypeIcons[type.id];

                        return (
                          <Card
                            key={type.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                              selectedPropertyType === type.id ? "ring-2 ring-primary border-primary" : ""
                            }`}
                            onClick={() => {
                              clearSubmissionState();
                              form.setValue("propertyType", type.id, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                              if (type.id !== "joint_venture") {
                                form.clearErrors(jointVentureStepFields);
                              }
                              form.clearErrors("propertyType");
                            }}
                          >
                            <CardContent className="pt-6 text-center">
                              <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                              <h3 className="font-semibold mb-2">{type.label}</h3>
                              <p className="text-sm text-muted-foreground">{type.description}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <div className="mt-8 bg-muted/30 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">Platform Guidelines</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            All properties undergo verification. Fake listings will be removed. Only
                            legitimate property owners or authorized agents can list properties.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="button"
                        onClick={handleStepOneContinue}
                        disabled={!selectedPropertyType}
                        className="w-full md:w-auto"
                      >
                        Continue to Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                              <Input
                                placeholder="e.g., 2-Bedroom Apartment in Lekki"
                                {...field}
                                onChange={(event) => {
                                  clearSubmissionState();
                                  field.onChange(event);
                                }}
                              />
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
                                placeholder={
                                  selectedPropertyType === "rental"
                                    ? "e.g., NGN 500,000/month"
                                    : "e.g., NGN 25,000,000"
                                }
                                {...field}
                                onChange={(event) => {
                                  clearSubmissionState();
                                  field.onChange(event);
                                }}
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
                              onChange={(event) => {
                                clearSubmissionState();
                                field.onChange(event);
                              }}
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
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value) => {
                                clearSubmissionState();
                                field.onChange(value);
                                form.setValue("lga", "", { shouldDirty: true, shouldValidate: true });
                                form.clearErrors("lga");
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {nigerianStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {getStateLabel(state)}
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
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value) => {
                                clearSubmissionState();
                                field.onChange(value);
                              }}
                              disabled={!selectedState}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={selectedState ? "Select LGA" : "Select state first"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableLgas.map((lga) => (
                                  <SelectItem key={lga} value={lga}>
                                    {lga}
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
                        name="size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Size *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  selectedPropertyType === "land" ? "e.g., 500 sqm" : "e.g., 3 bedrooms"
                                }
                                {...field}
                                onChange={(event) => {
                                  clearSubmissionState();
                                  field.onChange(event);
                                }}
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
                            <Input
                              placeholder="Street address, landmarks, area description"
                              {...field}
                              onChange={(event) => {
                                clearSubmissionState();
                                field.onChange(event);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                    <Input
                                      placeholder="e.g., 2,000 sqm or 1 hectare"
                                      {...field}
                                      onChange={(event) => {
                                        clearSubmissionState();
                                        field.onChange(event);
                                      }}
                                    />
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
                                      <Input
                                        className="pl-10"
                                        placeholder="e.g., NGN 500,000,000"
                                        {...field}
                                        onChange={(event) => {
                                          clearSubmissionState();
                                          field.onChange(event);
                                        }}
                                      />
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
                                  <Input
                                    placeholder="e.g., Residential Estate, Shopping Mall, Mixed-Use Development"
                                    {...field}
                                    onChange={(event) => {
                                      clearSubmissionState();
                                      field.onChange(event);
                                    }}
                                  />
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
                                      placeholder="Describe your preferred partnership structure, timeline expectations, and profit sharing."
                                      {...field}
                                      onChange={(event) => {
                                        clearSubmissionState();
                                        field.onChange(event);
                                      }}
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
                                      placeholder="Describe the qualifications or track record you expect from developers."
                                      {...field}
                                      onChange={(event) => {
                                        clearSubmissionState();
                                        field.onChange(event);
                                      }}
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
                                Interested developers will submit their portfolio, company letterhead, and CAC
                                documentation. You will be able to review applicants before sharing detailed
                                property information.
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button type="button" onClick={handleStepTwoContinue}>
                        Continue to Media
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                            Add up to {PROPERTY_IMAGE_LIMITS.maxFiles} photos. Only JPG, PNG, and WEBP images up to
                            5MB each are accepted.
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            onChange={(event) => {
                              handleFileUpload("image", event.target.files);
                              event.currentTarget.value = "";
                            }}
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
                        {mediaErrors.images && (
                          <p className="text-sm font-medium text-destructive">{mediaErrors.images}</p>
                        )}

                        {imageFiles.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {imageFiles.map((image, index) => (
                              <div key={image.id} className="relative rounded-lg border bg-background overflow-hidden">
                                {image.previewUrl && (
                                  <img
                                    src={image.previewUrl}
                                    alt={`Property ${index + 1}`}
                                    className="w-full h-28 object-cover"
                                  />
                                )}
                                <button
                                  type="button"
                                  className="absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white"
                                  onClick={() => removeMediaFile("image", image.id)}
                                  aria-label={`Remove ${image.fileName}`}
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                <div className="p-3 text-sm text-muted-foreground truncate">{image.fileName}</div>
                              </div>
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
                              <Select
                                value={field.value || undefined}
                                onValueChange={(value) => {
                                  clearSubmissionState();
                                  field.onChange(value);
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select document type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {VERIFICATION_TYPES.map((type) => (
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
                            Add up to {PROPERTY_DOCUMENT_LIMITS.maxFiles} documents. Only PDF, JPG, PNG, and WEBP
                            files up to 10MB each are accepted.
                          </p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                            onChange={(event) => {
                              handleFileUpload("document", event.target.files);
                              event.currentTarget.value = "";
                            }}
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
                        {mediaErrors.documents && (
                          <p className="text-sm font-medium text-destructive">{mediaErrors.documents}</p>
                        )}

                        {documentFiles.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Uploaded Documents</h4>
                            {documentFiles.map((document) => (
                              <div
                                key={document.id}
                                className="flex items-center justify-between gap-3 p-3 border rounded-lg"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 shrink-0" />
                                  <span className="text-sm truncate">{document.fileName}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMediaFile("document", document.id)}
                                  aria-label={`Remove ${document.fileName}`}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Previous
                      </Button>
                      <Button type="button" onClick={handleStepThreeContinue}>
                        Continue to Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                              <Input
                                placeholder="Your full name"
                                {...field}
                                onChange={(event) => {
                                  clearSubmissionState();
                                  field.onChange(event);
                                }}
                              />
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
                              <Input
                                placeholder="+234 XXX XXX XXXX"
                                {...field}
                                onChange={(event) => {
                                  clearSubmissionState();
                                  field.onChange(event);
                                }}
                              />
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
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                              onChange={(event) => {
                                clearSubmissionState();
                                field.onChange(event);
                              }}
                            />
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
                            Our team will contact you within 2 to 3 business days to verify your property and
                            documents. Your contact information will only be shared with serious, verified
                            inquirers.
                          </p>
                        </div>
                      </div>
                    </div>

                    {duplicateWarning?.isDuplicate && (
                      <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <h4 className="font-medium text-destructive">Duplicate Property Detected</h4>
                            <p className="text-sm text-muted-foreground mt-1">{duplicateWarning.reason}</p>
                            {duplicateWarning.matches.length > 0 && (
                              <ul className="mt-2 text-sm space-y-1">
                                {duplicateWarning.matches.map((match, index) => (
                                  <li
                                    key={`${match.title}-${index}`}
                                    className="text-muted-foreground"
                                  >
                                    • {match.title} - {match.location}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {submissionIssue && (
                      <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                          <div>
                            <h4 className="font-medium text-destructive">{submissionIssue.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{submissionIssue.description}</p>
                            {submissionIssue.hint && (
                              <p className="text-sm text-muted-foreground mt-2">{submissionIssue.hint}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between mt-6">
                      <Button type="button" variant="outline" onClick={prevStep} disabled={isSubmitting}>
                        Previous
                      </Button>
                      <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {submitButtonLabel}
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
