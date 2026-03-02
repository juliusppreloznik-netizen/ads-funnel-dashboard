"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  AdTranscript,
  TranscriptSegment,
  AdCopy,
  getAdTranscript,
  generateAdTranscript,
} from "@/lib/contact-queries";

interface AdPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adName: string;
}

export default function AdPreviewModal({
  isOpen,
  onClose,
  adId,
  adName,
}: AdPreviewModalProps) {
  const [transcript, setTranscript] = useState<AdTranscript | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch or generate transcript
  const fetchTranscript = useCallback(async (forceRegenerate = false) => {
    if (!adId) return;

    setLoading(true);
    setError(null);

    try {
      // First try to get existing transcript from database
      if (!forceRegenerate) {
        const { data: existing } = await getAdTranscript(adId);
        console.log("[AdPreviewModal] getAdTranscript result:", existing);
        // Accept completed or failed status (failed still has useful thumbnail/metadata)
        if (existing && (existing.status === "completed" || existing.status === "failed")) {
          console.log("[AdPreviewModal] Using cached transcript:", {
            media_type: existing.media_type,
            image_url: existing.image_url ? "present" : "null",
            thumbnail_url: existing.thumbnail_url ? "present" : "null",
            video_url: existing.video_url ? "present" : "null",
          });
          setTranscript(existing);
          setLoading(false);
          return;
        }
      }

      // Generate new transcript via Edge Function
      setGenerating(true);
      const { data, error: genError } = await generateAdTranscript(
        adId,
        forceRegenerate
      );

      if (genError) {
        setError(genError.message);
      } else if (data) {
        console.log("[AdPreviewModal] generateAdTranscript result:", {
          media_type: data.media_type,
          image_url: data.image_url ? "present" : "null",
          thumbnail_url: data.thumbnail_url ? "present" : "null",
          video_url: data.video_url ? "present" : "null",
        });
        setTranscript(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ad preview");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }, [adId]);

  useEffect(() => {
    if (isOpen && adId) {
      fetchTranscript();
    }
  }, [isOpen, adId, fetchTranscript]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Download functionality
  const handleDownload = async () => {
    if (!transcript) return;

    const transcriptText = transcript.transcript_json
      ? transcript.transcript_json
          .map((seg) => `${seg.start}-${seg.end}  ${seg.text}`)
          .join("\n\n")
      : transcript.transcript || "";

    const adCopyText = transcript.ad_copy
      ? `Headline: ${transcript.ad_copy.headline || "N/A"}\nBody: ${transcript.ad_copy.body || "N/A"}\nDescription: ${transcript.ad_copy.description || "N/A"}\nCTA: ${transcript.ad_copy.cta || "N/A"}`
      : "";

    const content = transcript.media_type === "video"
      ? `Ad: ${adName}\n\n=== TRANSCRIPT ===\n\n${transcriptText}\n\n=== AD COPY ===\n\n${adCopyText}`
      : `Ad: ${adName}\n\n=== AD COPY ===\n\n${adCopyText}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${adName.replace(/[^a-z0-9]/gi, "_")}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy transcript to clipboard
  const handleCopyTranscript = async () => {
    if (!transcript) return;

    const text = transcript.transcript_json
      ? transcript.transcript_json.map((seg) => seg.text).join(" ")
      : transcript.transcript || "";

    await navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-7xl h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              {transcript?.media_type === "video" ? (
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 truncate max-w-lg">
                {adName}
              </h2>
              <p className="text-xs text-gray-500">
                {transcript?.media_type === "video" ? "Video Ad" : "Image Ad"}
                {transcript?.duration_seconds && ` - ${Math.floor(transcript.duration_seconds / 60)}:${(transcript.duration_seconds % 60).toString().padStart(2, "0")}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {transcript && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            )}
            <button
              onClick={() => fetchTranscript(true)}
              disabled={generating}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {loading ? (
            <LoadingState generating={generating} />
          ) : error ? (
            <ErrorState error={error} onRetry={() => fetchTranscript(true)} />
          ) : transcript ? (
            <>
              {/* Left Panel - Media Preview (60%) */}
              <div className="w-[60%] bg-neutral-900 relative flex items-center justify-center">
                {/* Debug info - always show for now */}
                <div className="absolute top-2 left-2 z-50 text-xs text-white bg-black/70 p-2 rounded max-w-xs">
                  <div>media_type: {String(transcript.media_type)}</div>
                  <div>image_url: {transcript.image_url ? "YES" : "NO"}</div>
                  <div>thumbnail_url: {transcript.thumbnail_url ? "YES" : "NO"}</div>
                  <div>video_url: {transcript.video_url ? "YES" : "NO"}</div>
                  <div>Keys: {Object.keys(transcript).join(", ")}</div>
                </div>
                {/* Render the appropriate media component */}
                {transcript.media_type === "video" && transcript.video_url ? (
                  <VideoPlayer videoUrl={transcript.video_url} thumbnailUrl={transcript.thumbnail_url} />
                ) : transcript.media_type === "video" && transcript.facebook_video_id ? (
                  <FacebookVideoEmbed videoId={transcript.facebook_video_id} thumbnailUrl={transcript.thumbnail_url} />
                ) : transcript.media_type === "video" && transcript.thumbnail_url ? (
                  <VideoThumbnailFallback thumbnailUrl={transcript.thumbnail_url} errorMessage={transcript.error_message} />
                ) : transcript.image_url ? (
                  <>
                    <div className="absolute bottom-2 left-2 z-50 text-xs text-green-400 bg-black/70 px-2 py-1 rounded">
                      RENDERING: ImageViewer
                    </div>
                    <ImageViewer imageUrl={transcript.image_url} alt={adName} />
                  </>
                ) : transcript.thumbnail_url ? (
                  <>
                    <div className="absolute bottom-2 left-2 z-50 text-xs text-yellow-400 bg-black/70 px-2 py-1 rounded">
                      RENDERING: ImageViewer (thumbnail)
                    </div>
                    <ImageViewer imageUrl={transcript.thumbnail_url} alt={adName} />
                  </>
                ) : (
                  <>
                    <div className="absolute bottom-2 left-2 z-50 text-xs text-red-400 bg-black/70 px-2 py-1 rounded">
                      RENDERING: NoMediaState
                    </div>
                    <NoMediaState />
                  </>
                )}
              </div>

              {/* Right Panel - Transcript/Ad Copy (40%) */}
              <div className="w-[40%] bg-white flex flex-col border-l border-gray-200 min-h-0">
                <TranscriptPanel
                  transcript={transcript.transcript}
                  transcriptJson={transcript.transcript_json}
                  adCopy={transcript.ad_copy}
                  mediaType={transcript.media_type}
                  onCopy={handleCopyTranscript}
                />
              </div>
            </>
          ) : (
            <ErrorState error="No data available" onRetry={() => fetchTranscript(true)} />
          )}
        </div>
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState({ generating }: { generating: boolean }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">
          {generating ? "Fetching ad creative..." : "Loading..."}
        </p>
        {generating && (
          <p className="text-sm text-gray-500 mt-1">
            This may take a moment for video ads
          </p>
        )}
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-900 font-medium mb-2">Failed to load ad preview</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// No Media State Component
function NoMediaState() {
  return (
    <div className="text-center text-gray-400">
      <svg className="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p>No media available for this ad</p>
    </div>
  );
}

// Video Player Component - fills the container with full playback controls
function VideoPlayer({ videoUrl, thumbnailUrl }: { videoUrl: string; thumbnailUrl?: string | null }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <video
        className="w-full h-full object-contain"
        controls
        autoPlay
        loop
        playsInline
        poster={thumbnailUrl || undefined}
        preload="auto"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// Facebook Video Embed Component - embeds video using Facebook Video Player (fallback when direct URL unavailable)
function FacebookVideoEmbed({ videoId, thumbnailUrl }: { videoId: string; thumbnailUrl?: string | null }) {
  const [loaded, setLoaded] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Construct Facebook video embed URL
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D${videoId}&show_text=false&width=800&height=450&autoplay=true`;
  const publicVideoUrl = `https://www.facebook.com/watch/?v=${videoId}`;

  if (!showEmbed) {
    // Show thumbnail with play button and permission notice
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        {/* Thumbnail as background */}
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-contain opacity-40"
          />
        )}

        {/* Overlay with play button and info */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8">
          <button
            onClick={() => setShowEmbed(true)}
            className="w-20 h-20 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-2xl mb-6"
          >
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>

          <p className="text-white text-lg font-medium mb-2">Video Ad Preview</p>
          <p className="text-gray-400 text-sm max-w-md mb-4">
            Direct video URL not available. Click to play via Facebook embed.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setShowEmbed(true)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Play Video
            </button>
            <a
              href={publicVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Open on Facebook
            </a>
          </div>

          <p className="text-gray-500 text-xs mt-6 max-w-sm">
            To enable direct video playback, update the Facebook access token with &apos;pages_read_engagement&apos; permission.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      {/* Show thumbnail while loading */}
      {!loaded && thumbnailUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-contain opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Facebook Video Embed iframe */}
      <iframe
        src={embedUrl}
        className={`w-full h-full ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ border: "none", overflow: "hidden" }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen={true}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        onLoad={() => setLoaded(true)}
      />

      {/* Back button */}
      <button
        onClick={() => setShowEmbed(false)}
        className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-black/60 text-white text-sm rounded-lg hover:bg-black/80 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}

// Video Thumbnail Fallback Component - shows thumbnail with message when video_url unavailable
function VideoThumbnailFallback({ thumbnailUrl, errorMessage }: { thumbnailUrl: string; errorMessage?: string | null }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Thumbnail as background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumbnailUrl}
        alt="Video thumbnail"
        className="w-full h-full object-contain opacity-60"
      />
      {/* Overlay message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
        <div className="bg-black/70 rounded-xl p-6 max-w-md text-center">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-white font-medium mb-2">Video Ad</p>
          <p className="text-gray-300 text-sm">
            {errorMessage || "Video playback not available"}
          </p>
          <p className="text-gray-400 text-xs mt-3">
            View this ad directly on Facebook Ads Manager for full video playback
          </p>
        </div>
      </div>
    </div>
  );
}

// Image Viewer Component - fills the container with zoom controls
function ImageViewer({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => {
    setZoom((z) => Math.min(z + 0.5, 4));
  };

  const zoomOut = () => {
    const newZoom = Math.max(zoom - 0.5, 1);
    setZoom(newZoom);
    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 flex gap-1.5 z-20">
        <button
          onClick={zoomIn}
          className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
          title="Zoom In"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          disabled={zoom <= 1}
          className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Zoom Out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        {zoom > 1 && (
          <button
            onClick={resetView}
            className="p-2 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
            title="Reset View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Zoom indicator */}
      {zoom > 1 && (
        <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs rounded z-20">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Image container - fills the panel */}
      <div
        className={`absolute inset-0 ${zoom > 1 ? "cursor-grab" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        style={{
          transform: zoom > 1 ? `translate(${position.x}px, ${position.y}px)` : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-contain select-none"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          draggable={false}
        />
      </div>
    </div>
  );
}

// Transcript Panel Component
function TranscriptPanel({
  transcript,
  transcriptJson,
  adCopy,
  mediaType,
  onCopy,
}: {
  transcript: string | null;
  transcriptJson: TranscriptSegment[] | null;
  adCopy: AdCopy | null;
  mediaType: "video" | "image" | "carousel" | null;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-900">
          {mediaType === "video" ? "Ad Transcript" : "Ad Copy"}
        </h3>
        {(transcript || transcriptJson) && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {mediaType === "video" && transcriptJson && transcriptJson.length > 0 ? (
          <div className="space-y-4">
            {transcriptJson.map((segment, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex-shrink-0 text-orange-500 font-mono text-sm font-medium whitespace-nowrap">
                  {segment.start}-{segment.end}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {segment.text}
                </p>
              </div>
            ))}
          </div>
        ) : mediaType === "video" && transcript ? (
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {transcript}
          </p>
        ) : adCopy ? (
          <div className="space-y-5">
            {adCopy.headline && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Headline
                </label>
                <p className="text-gray-900 font-medium">{adCopy.headline}</p>
              </div>
            )}
            {adCopy.body && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Body
                </label>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{adCopy.body}</p>
              </div>
            )}
            {adCopy.description && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <p className="text-gray-700 leading-relaxed">{adCopy.description}</p>
              </div>
            )}
            {adCopy.cta && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Call-to-Action
                </label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {adCopy.cta}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No transcript available</p>
            <p className="text-xs mt-1">Click &quot;Refresh&quot; to generate</p>
          </div>
        )}
      </div>
    </div>
  );
}
