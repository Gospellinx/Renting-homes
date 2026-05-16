import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  CloudUpload, Film, Info, Loader2, RefreshCw, Trash2, Video, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  type CloudinaryUploadResult, type UploadState,
  uploadVideoToCloudinary, validateVideoFile, VIDEO_LIMITS,
} from "@/lib/cloudinaryUpload";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

const VIDEO_INSTRUCTIONS = [
  { icon: "🎬", text: "Recommended length: 30 seconds – 2 minutes" },
  { icon: "📦", text: "Maximum file size: 100 MB" },
  { icon: "📹", text: "Supported formats: MP4, MOV, WebM" },
  { icon: "🔄", text: "Record in landscape (horizontal) mode when possible" },
  { icon: "💡", text: "Ensure good lighting and stable camera movement" },
  { icon: "🏠", text: "Show all important areas of the property clearly" },
  { icon: "🎵", text: "Avoid using copyrighted background music" },
  { icon: "📶", text: "Keep your internet connection stable during upload" },
  { icon: "✨", text: "Use clear, high-quality footage for best results" },
];

function UploadInstructions({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left" aria-expanded={open}>
        <div className="flex items-center gap-2 text-blue-800 font-semibold text-sm">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          Tips for a great property video
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-500" /> : <ChevronDown className="w-4 h-4 text-blue-500" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="instr" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <ul className="px-4 pb-4 space-y-2">
              {VIDEO_INSTRUCTIONS.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-900/80">
                  <span className="shrink-0 text-base leading-5">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DropZone({ onFileSelected, disabled, validationError }: {
  onFileSelected: (f: File) => void; disabled?: boolean; validationError?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }, [disabled, onFileSelected]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={[
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none py-12 px-6 text-center",
        isDragging ? "border-indigo-500 bg-indigo-50/70 scale-[1.01]"
          : validationError ? "border-red-400 bg-red-50/40"
          : "border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/40",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
      ].join(" ")}
      role="button" aria-label="Upload property video"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={e => e.key === "Enter" && !disabled && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file"
        accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFileSelected(f); if (inputRef.current) inputRef.current.value = ""; }}
        disabled={disabled} id="video-upload-input" />
      <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${isDragging ? "bg-indigo-100" : "bg-slate-100"}`}>
        <CloudUpload className={`w-8 h-8 ${isDragging ? "text-indigo-600" : "text-slate-400"}`} />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-slate-700">{isDragging ? "Drop your video here" : "Drag & drop a video, or tap to browse"}</p>
        <p className="text-sm text-slate-500">MP4, MOV, WebM · Max 100 MB</p>
      </div>
      {validationError && (
        <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />{validationError}
        </p>
      )}
    </div>
  );
}

function VideoPreviewCard({ file, onRemove, disabled }: { file: File; onRemove: () => void; disabled?: boolean }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-black">
      {previewUrl && <video src={previewUrl} className="w-full max-h-64 object-contain bg-black" controls preload="metadata" playsInline aria-label="Video preview" />}
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Film className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{file.name}</p>
            <p className="text-slate-400 text-xs">{sizeMB} MB</p>
          </div>
        </div>
        {!disabled && (
          <button type="button" onClick={onRemove}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors"
            aria-label="Remove selected video">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function UploadProgressView({ progress, onCancel }: { progress: number; onCancel: () => void }) {
  return (
    <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          <span className="font-semibold text-indigo-800">Uploading video…</span>
        </div>
        <span className="text-indigo-600 font-bold tabular-nums">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2.5 bg-indigo-100" />
      <div className="flex items-center justify-between">
        <p className="text-sm text-indigo-600/80">
          {progress < 30 ? "Starting upload…" : progress < 70 ? "Uploading — keep your connection active"
            : progress < 100 ? "Almost done — do not close this tab" : "Finalising…"}
        </p>
        <button type="button" onClick={onCancel} className="text-xs text-slate-500 hover:text-red-500 underline transition-colors">Cancel</button>
      </div>
    </div>
  );
}

function ProcessingView() {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-3 py-8 px-6 rounded-2xl bg-amber-50 border border-amber-200 text-center">
      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-amber-600 animate-spin" />
      </div>
      <div>
        <p className="font-semibold text-amber-900">Cloudinary is optimising your video</p>
        <p className="text-sm text-amber-700/80 mt-1">Compressing and preparing for fast global streaming…</p>
      </div>
    </motion.div>
  );
}

function SuccessView({ result, onUploadAnother }: { result: CloudinaryUploadResult; onUploadAnother: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl overflow-hidden border border-emerald-200">
      {result.thumbnailUrl && (
        <div className="relative bg-black">
          <img src={result.thumbnailUrl} alt="Video thumbnail" className="w-full max-h-52 object-contain bg-black" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Video className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      )}
      <div className="px-4 py-4 bg-emerald-50 space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800">Video uploaded successfully!</p>
            <p className="text-sm text-emerald-700/80 mt-0.5">Cloudinary is transcoding for fast global streaming. It will appear on your listing shortly.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {result.durationSeconds && <span className="bg-white/70 border border-slate-200 rounded-full px-2 py-0.5">⏱ {Math.round(result.durationSeconds)}s</span>}
          <span className="bg-white/70 border border-slate-200 rounded-full px-2 py-0.5">📦 {(result.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
          {result.format && <span className="bg-white/70 border border-slate-200 rounded-full px-2 py-0.5">🎬 {result.format.toUpperCase()}</span>}
          {result.width && result.height && <span className="bg-white/70 border border-slate-200 rounded-full px-2 py-0.5">📐 {result.width}×{result.height}</span>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onUploadAnother} className="border-emerald-300 text-emerald-700 hover:bg-emerald-100">
          <RefreshCw className="w-4 h-4 mr-2" />Upload another video
        </Button>
      </div>
    </motion.div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-5 rounded-2xl bg-red-50 border border-red-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-red-800">Upload failed</p>
          <p className="text-sm text-red-700/90 mt-1">{message}</p>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry} className="self-start border-red-300 text-red-700 hover:bg-red-100">
        <RefreshCw className="w-4 h-4 mr-2" />Try again
      </Button>
    </motion.div>
  );
}

function ConfigurationWarning() {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 space-y-2">
      <div className="flex items-center gap-2 text-amber-800 font-semibold">
        <AlertCircle className="w-5 h-5 text-amber-500" />Cloudinary not configured
      </div>
      <p className="text-sm text-amber-700">
        Add <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
        <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> to your <code className="bg-amber-100 px-1 rounded">.env</code> file.
      </p>
    </div>
  );
}

export interface VideoUploaderProps {
  propertyId?: string;
  onUploadComplete?: (result: CloudinaryUploadResult) => void;
  showInstructions?: boolean;
  disabled?: boolean;
  label?: string;
}

export function VideoUploader({
  propertyId, onUploadComplete, showInstructions = true, disabled = false, label = "Property Video",
}: VideoUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const [uploadState, setUploadState] = useState<UploadState>({ phase: "idle" });
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileSelected = useCallback((file: File) => {
    setValidationError(undefined);
    const v = validateVideoFile(file);
    if (!v.valid) { setValidationError(v.error); return; }
    setSelectedFile(file);
    setUploadState({ phase: "idle" });
  }, []);

  const handleRemoveSelected = () => {
    setSelectedFile(null); setValidationError(undefined);
    setUploadState({ phase: "idle" }); abortControllerRef.current?.abort();
  };
  const handleCancel = () => { abortControllerRef.current?.abort(); setUploadState({ phase: "idle" }); };
  const handleReset = () => { setSelectedFile(null); setValidationError(undefined); setUploadState({ phase: "idle" }); };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      setUploadState({ phase: "error", message: "Cloudinary env variables are missing." }); return;
    }
    abortControllerRef.current = new AbortController();
    setUploadState({ phase: "uploading", progress: 0 });
    try {
      const result = await uploadVideoToCloudinary(selectedFile, {
        cloudName: CLOUDINARY_CLOUD_NAME, uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        folder: "homes-nigeria/videos", signal: abortControllerRef.current.signal,
        onProgress: ({ percent }) => setUploadState({ phase: "uploading", progress: percent }),
      });
      setUploadState({ phase: "processing" });
      if (propertyId) {
        const { saveVideoMetadata } = await import("@/lib/cloudinaryUpload");
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await saveVideoMetadata({ propertyId, userId: user.id, result });
      }
      setUploadState({ phase: "success", result });
      onUploadComplete?.(result);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") { setUploadState({ phase: "idle" }); return; }
      setUploadState({ phase: "error", message: err instanceof Error ? err.message : "Unexpected error. Please try again." });
    }
  };

  const isUploading = uploadState.phase === "uploading" || uploadState.phase === "processing";
  const isConfigured = !!CLOUDINARY_CLOUD_NAME && !!CLOUDINARY_UPLOAD_PRESET;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-5 h-5 text-indigo-500" />
        <span className="font-semibold text-slate-800 text-sm">{label}</span>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Optional</span>
      </div>
      {!isConfigured && <ConfigurationWarning />}
      {showInstructions && isConfigured && <UploadInstructions />}
      {isConfigured && (
        <AnimatePresence mode="wait">
          {uploadState.phase === "success" ? (
            <motion.div key="success">
              <SuccessView result={(uploadState as Extract<UploadState, { phase: "success" }>).result} onUploadAnother={handleReset} />
            </motion.div>
          ) : uploadState.phase === "error" ? (
            <motion.div key="error">
              <ErrorView message={(uploadState as Extract<UploadState, { phase: "error" }>).message} onRetry={handleReset} />
            </motion.div>
          ) : uploadState.phase === "processing" ? (
            <motion.div key="processing"><ProcessingView /></motion.div>
          ) : uploadState.phase === "uploading" ? (
            <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <UploadProgressView progress={(uploadState as Extract<UploadState, { phase: "uploading" }>).progress} onCancel={handleCancel} />
            </motion.div>
          ) : selectedFile ? (
            <motion.div key="preview" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <VideoPreviewCard file={selectedFile} onRemove={handleRemoveSelected} disabled={isUploading} />
              <div className="flex gap-3">
                <Button type="button" onClick={handleUpload} disabled={disabled || isUploading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-md shadow-indigo-200">
                  <CloudUpload className="w-4 h-4 mr-2" />Upload to Cloudinary
                </Button>
                <Button type="button" variant="outline" onClick={handleRemoveSelected} disabled={disabled || isUploading} className="shrink-0" aria-label="Remove video">
                  <Trash2 className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <DropZone onFileSelected={handleFileSelected} disabled={disabled} validationError={validationError} />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

export default VideoUploader;
