/**
 * PropertyVideoPlayer.tsx
 * ──────────────────────────────────────────────────────────────
 * Production-grade video player for property listings.
 *
 * Features:
 *  • Lazy intersection-observer loading (won't load off-screen)
 *  • Thumbnail poster shown until user clicks play
 *  • No autoplay – prevents mobile data waste & CLS jank
 *  • Cloudinary CDN URL with q_auto / f_auto transformations
 *  • Responsive 16:9 aspect-ratio wrapper
 *  • Loading skeleton while video metadata fetches
 *  • Graceful fallback for missing / errored videos
 * ──────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState } from "react";
import { Play, Video, AlertCircle } from "lucide-react";
import type { PropertyVideoRecord } from "@/lib/cloudinaryUpload";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a Cloudinary CDN URL with q_auto,f_auto optimisations.
 * Falls back to the raw secure_url if cloudName is unknown.
 */
function buildOptimisedUrl(record: PropertyVideoRecord): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  if (!cloudName || !record.cloudinary_public_id) return record.video_url;
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,vc_auto/${record.cloudinary_public_id}`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function VideoSkeleton() {
  return (
    <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
        <Video className="w-6 h-6 text-slate-600" />
      </div>
    </div>
  );
}

// ─── Error fallback ───────────────────────────────────────────────────────────

function VideoError() {
  return (
    <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-2 text-slate-400">
      <AlertCircle className="w-8 h-8" />
      <p className="text-sm">Video unavailable</p>
    </div>
  );
}

// ─── Play Overlay ─────────────────────────────────────────────────────────────

function PlayOverlay({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute inset-0 flex items-center justify-center group"
      aria-label="Play property video"
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Play button */}
      <div className="relative z-10 w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
        <Play className="w-7 h-7 text-indigo-700 fill-indigo-700 ml-1" />
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export interface PropertyVideoPlayerProps {
  /** Single video record from property_videos table */
  video: PropertyVideoRecord;
  /** Extra CSS classes for the wrapper */
  className?: string;
}

type PlayerState = "idle" | "loading" | "playing" | "error";

export function PropertyVideoPlayer({ video, className = "" }: PropertyVideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [isInView, setIsInView] = useState(false);

  // Intersection observer — only load when in viewport
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePlay = () => {
    setPlayerState("loading");
    const vid = videoRef.current;
    if (!vid) return;
    vid.load();
    vid.play().catch(() => setPlayerState("error"));
  };

  const handleCanPlay = () => setPlayerState("playing");
  const handleError = () => setPlayerState("error");

  const optimisedUrl = buildOptimisedUrl(video);
  const showOverlay = playerState === "idle";
  const showSkeleton = playerState === "loading";
  const showError = playerState === "error";
  const showVideo = playerState === "loading" || playerState === "playing";

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full overflow-hidden rounded-xl bg-black ${className}`}
      style={{ aspectRatio: "16/9" }}
    >
      {/* Poster / thumbnail shown as background */}
      {video.thumbnail_url && playerState === "idle" && (
        <img
          src={video.thumbnail_url}
          alt="Property video thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {/* Only render <video> once in view */}
      {isInView && showVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          poster={video.thumbnail_url ?? undefined}
          controls
          playsInline
          preload="metadata"
          onCanPlay={handleCanPlay}
          onError={handleError}
          aria-label="Property video"
        >
          <source src={optimisedUrl} type="video/mp4" />
          {/* Streaming URL fallback (HLS) — browsers that support it */}
          {video.streaming_url && (
            <source src={video.streaming_url} type="application/x-mpegURL" />
          )}
          Your browser does not support video playback.
        </video>
      )}

      {/* States */}
      {showSkeleton && <VideoSkeleton />}
      {showError && <VideoError />}
      {showOverlay && isInView && <PlayOverlay onClick={handlePlay} />}

      {/* If not yet in view, show a minimal placeholder */}
      {!isInView && !video.thumbnail_url && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <Video className="w-8 h-8 text-slate-600" />
        </div>
      )}

      {/* Duration badge */}
      {video.duration_seconds && playerState === "idle" && (
        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
          {Math.floor(video.duration_seconds / 60)}:{String(Math.round(video.duration_seconds % 60)).padStart(2, "0")}
        </div>
      )}
    </div>
  );
}

export default PropertyVideoPlayer;
