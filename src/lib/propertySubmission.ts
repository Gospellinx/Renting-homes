import { z } from "zod";

export const PROPERTY_IMAGE_BUCKET = "property-images";
export const PROPERTY_DOCUMENT_BUCKET = "property-documents";

export const PROPERTY_TYPES = [
  { id: "land", label: "Land", description: "Vacant land, plots, or development sites" },
  { id: "rental", label: "Rental Property", description: "Apartments, houses for rent" },
  { id: "building", label: "Building/Sale", description: "Properties for sale or investment" },
  { id: "shop_rental", label: "Shop Rental", description: "Shops and commercial retail spaces" },
  { id: "joint_venture", label: "Joint Venture", description: "Partnership opportunities for developers" },
] as const;

export const VERIFICATION_TYPES = [
  { id: "certificate", label: "Certificate of Occupancy (C of O)" },
  { id: "deed", label: "Deed of Assignment" },
  { id: "survey", label: "Survey Plan" },
  { id: "receipt", label: "Purchase Receipt" },
  { id: "other", label: "Other Legal Documents" },
] as const;

export const PROPERTY_IMAGE_LIMITS = {
  maxFiles: 12,
  maxFileSize: 10 * 1024 * 1024,
  acceptedMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  acceptedExtensions: ["jpg", "jpeg", "png", "webp"] as const,
};

export const PROPERTY_DOCUMENT_LIMITS = {
  maxFiles: 6,
  maxFileSize: 20 * 1024 * 1024,
  acceptedMimeTypes: ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const,
  acceptedExtensions: ["pdf", "jpg", "jpeg", "png", "webp"] as const,
};

export type MediaKind = "image" | "document";

export interface SelectedMediaFile {
  id: string;
  file: File;
  fileName: string;
  previewUrl: string | null;
}

export interface MediaValidationErrors {
  images?: string;
  documents?: string;
}

export interface DuplicateMatch {
  title: string;
  location: string;
}

export interface DuplicateWarning {
  isDuplicate: boolean;
  reason: string;
  matches: DuplicateMatch[];
}

export interface PropertySubmissionResponse {
  ok: boolean;
  propertyId?: string;
  status?: string;
  errorType?: "auth" | "validation" | "duplicate" | "schema_not_ready" | "database";
  message?: string;
  hint?: string;
  fieldErrors?: Partial<Record<keyof PropertyFormData | "images" | "documents", string>>;
  duplicateWarning?: DuplicateWarning;
}

const phoneCharactersPattern = /^[+\d\s()-]+$/;
const allowedImageMimeTypes = new Set<string>(PROPERTY_IMAGE_LIMITS.acceptedMimeTypes);
const allowedImageExtensions = new Set<string>(PROPERTY_IMAGE_LIMITS.acceptedExtensions);
const allowedDocumentMimeTypes = new Set<string>(PROPERTY_DOCUMENT_LIMITS.acceptedMimeTypes);
const allowedDocumentExtensions = new Set<string>(PROPERTY_DOCUMENT_LIMITS.acceptedExtensions);
const digitsOnlyPattern = /^\d[\d,\s.]*$/;
const bedroomPattern = /\bbed(room)?s?\b/i;
const squareFeetPattern = /^\d[\d,\s.]*(?:\s*(?:sq\.?\s*ft|sqft|square\s*feet|ft|ft2|ft²))?$/i;

const normalizeLine = (value: string) => value.replace(/\s+/g, " ").trim();
const normalizeParagraph = (value: string) => value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
const toOptionalString = (value: string) => {
  const normalized = normalizeParagraph(value);
  return normalized.length > 0 ? normalized : "";
};

const normalizeSquareFeet = (value: string) => {
  const normalized = normalizeLine(value);

  if (!normalized) {
    return "";
  }

  const compactUnits = normalized
    .replace(/square\s*feet/gi, "sq ft")
    .replace(/sq\.?\s*ft/gi, "sq ft")
    .replace(/sqft/gi, "sq ft")
    .replace(/ft2/gi, "sq ft")
    .replace(/ft²/gi, "sq ft")
    .replace(/\s*ft$/i, " sq ft");

  return digitsOnlyPattern.test(compactUnits) ? `${compactUnits} sq ft` : compactUnits;
};

const isValidSquareFeet = (value: string) => {
  const normalized = normalizeLine(value);

  if (!normalized || bedroomPattern.test(normalized)) {
    return false;
  }

  return squareFeetPattern.test(normalized);
};

export const uploadPropertySchema = z
  .object({
    propertyType: z.string().min(1, "Select a property type"),
    title: z.string().trim().min(5, "Enter a clearer property title").max(120, "Title is too long"),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(2000, "Description is too long"),
    location: z.string().trim().min(5, "Enter the detailed property address").max(200, "Address is too long"),
    state: z.string().min(1, "Select a state"),
    lga: z.string().min(1, "Select an LGA"),
    price: z
      .string()
      .trim()
      .min(2, "Enter the property price")
      .max(60, "Price is too long")
      .refine((value) => /\d/.test(value), "Price must include a number"),
    size: z.string().trim().min(2, "Enter the property size").max(80, "Size is too long"),
    amenities: z.array(z.string()),
    ownerName: z.string().trim().min(2, "Enter the contact full name").max(100, "Name is too long"),
    ownerPhone: z
      .string()
      .trim()
      .min(1, "Enter a phone number")
      .refine(
        (value) => phoneCharactersPattern.test(value),
        "Use only numbers, spaces, hyphens, parentheses, or a leading +"
      )
      .refine((value) => {
        const digitsOnly = value.replace(/\D/g, "");
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      }, "Phone number must contain 10 to 15 digits"),
    ownerEmail: z.string().trim().email("Enter a valid email address"),
    verificationType: z.string().min(1, "Select a document type"),
    expectedInvestment: z.string(),
    partnershipTerms: z.string(),
    developerRequirements: z.string(),
    landSize: z.string(),
    proposedDevelopment: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.propertyType !== "joint_venture") {
      return;
    }

    if (!normalizeLine(data.landSize)) {
      ctx.addIssue({ code: "custom", path: ["landSize"], message: "Enter the land size" });
    }

    if (!normalizeLine(data.expectedInvestment)) {
      ctx.addIssue({
        code: "custom",
        path: ["expectedInvestment"],
        message: "Enter the expected investment amount",
      });
    }

    if (!normalizeLine(data.proposedDevelopment)) {
      ctx.addIssue({
        code: "custom",
        path: ["proposedDevelopment"],
        message: "Enter the proposed development type",
      });
    }

    if (normalizeParagraph(data.partnershipTerms).length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["partnershipTerms"],
        message: "Partnership terms must be at least 10 characters",
      });
    }

    if (normalizeParagraph(data.developerRequirements).length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["developerRequirements"],
        message: "Developer requirements must be at least 10 characters",
      });
    }
  });

export type PropertyFormData = z.infer<typeof uploadPropertySchema>;

export const propertyFormDefaults: PropertyFormData = {
  propertyType: "",
  title: "",
  description: "",
  location: "",
  state: "",
  lga: "",
  price: "",
  size: "",
  amenities: [],
  ownerName: "",
  ownerPhone: "",
  ownerEmail: "",
  verificationType: "",
  expectedInvestment: "",
  partnershipTerms: "",
  developerRequirements: "",
  landSize: "",
  proposedDevelopment: "",
};

export const stepTwoBaseFields = ["title", "price", "description", "state", "lga", "size", "location"] as const;
export const jointVentureFields = [
  "landSize",
  "expectedInvestment",
  "proposedDevelopment",
  "partnershipTerms",
  "developerRequirements",
] as const;
export const contactFields = ["ownerName", "ownerPhone", "ownerEmail"] as const;

const getFileExtension = (fileName: string) => fileName.split(".").pop()?.toLowerCase() ?? "";

const buildFileSignature = (file: Pick<File, "name" | "size" | "lastModified">) =>
  `${file.name.trim().toLowerCase()}-${file.size}-${file.lastModified}`;

const isAcceptedFile = (kind: MediaKind, file: File) => {
  const extension = getFileExtension(file.name);
  const hasFileType = typeof file.type === "string" && file.type.length > 0;

  if (kind === "image") {
    const hasAcceptedMimeType = allowedImageMimeTypes.has(file.type);
    const hasAcceptedExtension = allowedImageExtensions.has(extension);
    return hasFileType ? hasAcceptedMimeType && hasAcceptedExtension : hasAcceptedExtension;
  }

  const hasAcceptedMimeType = allowedDocumentMimeTypes.has(file.type);
  const hasAcceptedExtension = allowedDocumentExtensions.has(extension);
  return hasFileType ? hasAcceptedMimeType && hasAcceptedExtension : hasAcceptedExtension;
};

export const formatFileSize = (sizeInBytes: number) => {
  if (sizeInBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeInBytes / 1024))}KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB`;
};

export const revokeMediaPreviews = (files: SelectedMediaFile[]) => {
  files.forEach((file) => {
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
  });
};

export const validateAndPrepareFiles = (
  kind: MediaKind,
  files: File[],
  existingFiles: SelectedMediaFile[]
) => {
  const limits = kind === "image" ? PROPERTY_IMAGE_LIMITS : PROPERTY_DOCUMENT_LIMITS;
  const acceptedFiles: SelectedMediaFile[] = [];
  const rejectedErrors: string[] = [];
  const existingSignatures = new Set(existingFiles.map((file) => buildFileSignature(file.file)));
  const acceptedSignatures = new Set<string>();
  let remainingSlots = Math.max(0, limits.maxFiles - existingFiles.length);

  if (remainingSlots === 0) {
    return {
      acceptedFiles,
      rejectedErrors: [
        kind === "image"
          ? `You can upload up to ${limits.maxFiles} property photos.`
          : `You can upload up to ${limits.maxFiles} legal documents.`,
      ],
    };
  }

  for (const file of files) {
    if (remainingSlots === 0) {
      rejectedErrors.push(
        kind === "image"
          ? `Only the first ${limits.maxFiles} property photos were kept.`
          : `Only the first ${limits.maxFiles} legal documents were kept.`
      );
      break;
    }

    if (file.size === 0) {
      rejectedErrors.push(`${file.name} is empty. Choose a file that contains real data.`);
      continue;
    }

    if (!isAcceptedFile(kind, file)) {
      rejectedErrors.push(
        kind === "image"
          ? `${file.name} is not supported. Use JPG, PNG, or WEBP images.`
          : `${file.name} is not supported. Use PDF, JPG, PNG, or WEBP files.`
      );
      continue;
    }

    const fileSignature = buildFileSignature(file);

    if (existingSignatures.has(fileSignature) || acceptedSignatures.has(fileSignature)) {
      rejectedErrors.push(`${file.name} has already been added.`);
      continue;
    }

    if (file.size > limits.maxFileSize) {
      rejectedErrors.push(
        `${file.name} is too large. Keep each file under ${formatFileSize(limits.maxFileSize)}.`
      );
      continue;
    }

    acceptedFiles.push({
      id: `${kind}-${crypto.randomUUID()}`,
      file,
      fileName: file.name,
      previewUrl: kind === "image" ? URL.createObjectURL(file) : null,
    });
    acceptedSignatures.add(fileSignature);
    remainingSlots -= 1;
  }

  return { acceptedFiles, rejectedErrors };
};

export const validateSelectedMedia = (files: {
  images: SelectedMediaFile[];
  documents: SelectedMediaFile[];
}) => {
  const errors: MediaValidationErrors = {
    images: files.images.length > 0 ? undefined : "Upload at least one property photo.",
    documents: files.documents.length > 0 ? undefined : "Upload at least one legal document.",
  };

  return {
    errors,
    isValid: !errors.images && !errors.documents,
  };
};

export const sanitizePropertyFormData = (data: PropertyFormData): PropertyFormData => ({
  propertyType: normalizeLine(data.propertyType),
  title: normalizeLine(data.title),
  description: normalizeParagraph(data.description),
  location: normalizeLine(data.location),
  state: normalizeLine(data.state),
  lga: normalizeLine(data.lga),
  price: normalizeLine(data.price),
  size: normalizeLine(data.size),
  amenities: Array.isArray(data.amenities)
    ? data.amenities.map((value) => normalizeLine(value)).filter(Boolean)
    : [],
  ownerName: normalizeLine(data.ownerName),
  ownerPhone: normalizeLine(data.ownerPhone),
  ownerEmail: normalizeLine(data.ownerEmail).toLowerCase(),
  verificationType: normalizeLine(data.verificationType),
  expectedInvestment: normalizeLine(data.expectedInvestment),
  partnershipTerms: normalizeParagraph(data.partnershipTerms),
  developerRequirements: normalizeParagraph(data.developerRequirements),
  landSize: normalizeLine(data.landSize),
  proposedDevelopment: normalizeLine(data.proposedDevelopment),
});

export const getStepForField = (fieldName: keyof PropertyFormData) => {
  if (fieldName === "propertyType") {
    return 1;
  }

  if (
    [...stepTwoBaseFields, ...jointVentureFields].includes(
      fieldName as (typeof stepTwoBaseFields)[number] | (typeof jointVentureFields)[number]
    )
  ) {
    return 2;
  }

  if (fieldName === "verificationType") {
    return 3;
  }

  return 4;
};

export const buildStoragePath = (
  userId: string,
  propertyType: string,
  kind: MediaKind,
  fileName: string
) => {
  const extension = getFileExtension(fileName) || "bin";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const safeBaseName = baseName || "file";
  const folderName = kind === "image" ? "images" : "documents";

  return `${userId}/${propertyType}/${folderName}/${Date.now()}-${crypto.randomUUID()}-${safeBaseName}.${extension}`;
};

export const buildPropertySubmissionPayload = (
  data: PropertyFormData,
  uploads: {
    imageUrls: string[];
    documentPaths: string[];
  }
) => {
  const sanitized = sanitizePropertyFormData(data);

  return {
    ...sanitized,
    imageUrls: uploads.imageUrls,
    documentPaths: uploads.documentPaths,
    expectedInvestment: toOptionalString(sanitized.expectedInvestment),
    partnershipTerms: toOptionalString(sanitized.partnershipTerms),
    developerRequirements: toOptionalString(sanitized.developerRequirements),
    landSize: toOptionalString(sanitized.landSize),
    proposedDevelopment: toOptionalString(sanitized.proposedDevelopment),
  };
};
