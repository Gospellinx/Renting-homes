/**
 * cloudinaryUpload.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Handles direct-to-Cloudinary video uploads from the browser.
 * Videos bypass our server entirely:  Browser → Cloudinary CDN → Supabase DB
 *
 * Architecture:
 *  1. Client picks a video file.
 *  2. We POST directly to Cloudinary's upload API via XMLHttpRequest so we
 *     get real per-byte progress events (fetch() doesn't support that).
 *  3. Cloudinary transcodes the video asynchronously (q_auto, adaptive HLS).
 *  4. We save the returned public_id + URLs into Supabase property_videos.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const VIDEO_LIMITS = {
  /** 100 MB hard limit before the file even reaches Cloudinary */
  maxFileSizeBytes: 100 * 1024 * 1024,
  /** Accepted MIME types shown to browsers */
  acceptedMimeTypes: ["video/mp4", "video/quicktime", "video/webm"] as const,
  /** Accepted file extensions */
  acceptedExtensions: ["mp4", "mov", "webm"] as const,
  /** Human-readable format labels */
  formatLabels: "MP4, MOV, WebM",
  /** Recommended duration range (seconds) */
  minDurationSec: 5,
  maxDurationSec: 120,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
  /** Cloudinary public_id — store this to derive optimised URLs later */
  publicId: string;
  /** Original direct URL (mp4 progressive download) */
  secureUrl: string;
  /** HLS adaptive streaming URL generated from publicId */
  streamingUrl: string;
  /** Auto-generated poster thumbnail URL */
  thumbnailUrl: string;
  /** Duration in seconds (populated by Cloudinary) */
  durationSeconds: number | null;
  /** Original file size in bytes */
  fileSizeBytes: number;
  /** Video format */
  format: string;
  /** Video width (px) */
  width: number | null;
  /** Video height (px) */
  height: number | null;
}

export interface UploadProgressEvent {
  /** 0–100 */
  percent: number;
  /** Bytes uploaded so far */
  loaded: number;
  /** Total bytes */
  total: number;
}

export type UploadState =
  | { phase: "idle" }
  | { phase: "validating" }
  | { phase: "uploading"; progress: number }
  | { phase: "processing" }
  | { phase: "success"; result: CloudinaryUploadResult }
  | { phase: "error"; message: string };

export interface VideoValidationResult {
  valid: boolean;
  error?: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Validate a File before it reaches Cloudinary */
export function validateVideoFile(file: File): VideoValidationResult {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeOk = (VIDEO_LIMITS.acceptedMimeTypes as readonly string[]).includes(file.type);
  const extOk = (VIDEO_LIMITS.acceptedExtensions as readonly string[]).includes(ext);

  if (!mimeOk && !extOk) {
    return {
      valid: false,
      error: `Unsupported format. Please use ${VIDEO_LIMITS.formatLabels}.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file appears to be empty." };
  }

  if (file.size > VIDEO_LIMITS.maxFileSizeBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File is ${sizeMB} MB. Maximum allowed size is 100 MB.`,
    };
  }

  return { valid: true };
}

// ─── URL Helpers (Cloudinary transformations) ─────────────────────────────────

/** Derive an HLS adaptive streaming URL from a Cloudinary public_id */
export function buildStreamingUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/fl_streaming_attachment/${publicId}.m3u8`;
}

/** Derive an optimised MP4 playback URL (f_auto, q_auto) */
export function buildOptimisedVideoUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,vc_auto/${publicId}`;
}

/** Derive a thumbnail URL (auto-generated poster frame at 1 second) */
export function buildThumbnailUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_1,f_jpg,q_auto,w_800/${publicId}.jpg`;
}

// ─── Core Upload Function ──────────────────────────────────────────────────────

export interface CloudinaryUploadOptions {
  /** Cloudinary cloud name — from VITE_CLOUDINARY_CLOUD_NAME */
  cloudName: string;
  /** Upload preset configured in Cloudinary dashboard (unsigned) */
  uploadPreset: string;
  /** Cloudinary folder to organise uploads, e.g. "homes-nigeria/videos" */
  folder?: string;
  /** Called with live progress (0-100) during XHR upload */
  onProgress?: (event: UploadProgressEvent) => void;
  /** AbortController signal for cancel support */
  signal?: AbortSignal;
}

/**
 * Upload a video file directly to Cloudinary using XMLHttpRequest.
 * Returns a resolved CloudinaryUploadResult on success, throws on error.
 */
export async function uploadVideoToCloudinary(
  file: File,
  options: CloudinaryUploadOptions
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset, folder = "homes-nigeria/videos", onProgress, signal } = options;

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  // Cloudinary eager transformations — generate HLS + compressed mp4 eagerly
  formData.append(
    "eager",
    "sp_auto/fl_streaming_attachment|f_auto,q_auto,vc_auto"
  );
  formData.append("eager_async", "true");
  // Resource type is video
  formData.append("resource_type", "video");

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Wire up abort signal
    if (signal) {
      if (signal.aborted) {
        reject(new DOMException("Upload was cancelled.", "AbortError"));
        return;
      }
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Upload was cancelled.", "AbortError"));
      });
    }

    // Progress
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          percent: Math.round((event.loaded / event.total) * 100),
          loaded: event.loaded,
          total: event.total,
        });
      }
    });

    // Completion
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const raw = JSON.parse(xhr.responseText);
          const result: CloudinaryUploadResult = {
            publicId: raw.public_id,
            secureUrl: raw.secure_url,
            streamingUrl: buildStreamingUrl(cloudName, raw.public_id),
            thumbnailUrl: buildThumbnailUrl(cloudName, raw.public_id),
            durationSeconds: raw.duration ?? null,
            fileSizeBytes: raw.bytes ?? file.size,
            format: raw.format ?? file.name.split(".").pop() ?? "mp4",
            width: raw.width ?? null,
            height: raw.height ?? null,
          };
          resolve(result);
        } catch {
          reject(new Error("Received an invalid response from the upload service."));
        }
      } else {
        let message = `Upload failed (HTTP ${xhr.status}).`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error?.message) {
            message = parsed.error.message;
          }
        } catch { /* ignore */ }
        reject(new Error(message));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("A network error occurred during the upload. Check your internet connection and try again."));
    });

    xhr.addEventListener("abort", () => {
      reject(new DOMException("Upload was cancelled.", "AbortError"));
    });

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
}

// ─── Supabase Persistence ─────────────────────────────────────────────────────

import { supabase } from "@/integrations/supabase/client";

export interface SaveVideoMetadataParams {
  propertyId: string;
  userId: string;
  result: CloudinaryUploadResult;
}

/**
 * Persist Cloudinary upload result into the property_videos table.
 * Call this immediately after a successful uploadVideoToCloudinary().
 */
export async function saveVideoMetadata(params: SaveVideoMetadataParams): Promise<string> {
  const { propertyId, userId, result } = params;

  const { data, error } = await supabase
    .from("property_videos" as never)
    .insert({
      property_id: propertyId,
      user_id: userId,
      cloudinary_public_id: result.publicId,
      video_url: result.secureUrl,
      streaming_url: result.streamingUrl,
      thumbnail_url: result.thumbnailUrl,
      duration_seconds: result.durationSeconds,
      file_size_bytes: result.fileSizeBytes,
      format: result.format,
      width: result.width,
      height: result.height,
      status: "processing",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save video record: ${error.message}`);
  }

  return (data as { id: string }).id;
}

/**
 * Fetch all videos for a given property.
 */
export async function fetchPropertyVideos(propertyId: string) {
  const { data, error } = await supabase
    .from("property_videos" as never)
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch videos: ${error.message}`);
  }

  return data as PropertyVideoRecord[];
}

/**
 * Delete a video record from Supabase (Cloudinary deletion requires server-side).
 */
export async function deleteVideoRecord(videoId: string): Promise<void> {
  const { error } = await supabase
    .from("property_videos" as never)
    .delete()
    .eq("id", videoId);

  if (error) {
    throw new Error(`Failed to delete video record: ${error.message}`);
  }
}

// ─── Types for DB rows ────────────────────────────────────────────────────────

export interface PropertyVideoRecord {
  id: string;
  property_id: string;
  user_id: string;
  cloudinary_public_id: string;
  video_url: string;
  streaming_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  format: string | null;
  width: number | null;
  height: number | null;
  status: "processing" | "ready" | "error";
  created_at: string;
  updated_at: string;
}
