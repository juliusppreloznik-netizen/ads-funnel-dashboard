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
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fetch or generate transcript
  const fetchTranscript = useCallback(async (forceRegenerate = false) => {
    if (!adId) return;

    setLoading(true);
    setError(null);

    try {
      // First try to get existing transcript
      if (!forceRegenerate) {
        const { data: existing } = await getAdTranscript(adId);
        if (existing && existing.status === "completed") {
          setTranscript(existing);
          setLoading(false);
          return;
        }
      }

      // Generate new transcript
      setGenerating(true);
      const { data, error: genError } = await generateAdTranscript(
        adId,
        forceRegenerate
      );

      if (genError) {
        setError(genError.message);
      } else if (data) {
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

    // Download transcript as text file
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              {transcript?.media_type === "video" ? (
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {adName}
              </h2>
              <p className="text-sm text-gray-500">
                {transcript?.media_type === "video" ? "Video Ad" : "Image Ad"}
                {transcript?.duration_seconds && ` - ${Math.floor(transcript.duration_seconds / 60)}:${(transcript.duration_seconds % 60).toString().padStart(2, "0")}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {transcript && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {loading ? (
            <LoadingState generating={generating} />
          ) : error ? (
            <ErrorState error={error} onRetry={() => fetchTranscript(true)} />
          ) : transcript ? (
            <>
              {/* Left Panel - Media Preview */}
              <div className="w-3/5 bg-gray-900 flex items-center justify-center p-6 overflow-hidden">
                {transcript.media_type === "video" && transcript.video_url ? (
                  <VideoPlayer
                    ref={videoRef}
                    videoUrl={transcript.video_url}
                    thumbnailUrl={transcript.thumbnail_url}
                  />
                ) : transcript.image_url ? (
                  <ImageViewer
                    imageUrl={transcript.image_url}
                    alt={adName}
                  />
                ) : transcript.thumbnail_url ? (
                  <ImageViewer
                    imageUrl={transcript.thumbnail_url}
                    alt={adName}
                  />
                ) : (
                  <NoMediaState />
                )}
              </div>

              {/* Right Panel - Transcript/Ad Copy */}
              <div className="w-2/5 bg-white flex flex-col border-l border-gray-200">
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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
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
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p>No media available for this ad</p>
    </div>
  );
}

// Video Player Component
interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string | null;
}

const VideoPlayer = ({ videoUrl, thumbnailUrl }: VideoPlayerProps & { ref?: React.Ref<HTMLVideoElement> }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <video
        className="max-w-full max-h-full rounded-lg shadow-lg"
        controls
        poster={thumbnailUrl || undefined}
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

// Image Viewer Component
interface ImageViewerProps {
  imageUrl: string;
  alt: string;
}

function ImageViewer({ imageUrl, alt }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
          className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
          className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
      <div className="overflow-auto max-w-full max-h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="rounded-lg shadow-lg transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center center" }}
        />
      </div>
    </div>
  );
}

// Transcript Panel Component
interface TranscriptPanelProps {
  transcript: string | null;
  transcriptJson: TranscriptSegment[] | null;
  adCopy: AdCopy | null;
  mediaType: "video" | "image" | "carousel" | null;
  onCopy: () => void;
}

function TranscriptPanel({
  transcript,
  transcriptJson,
  adCopy,
  mediaType,
  onCopy,
}: TranscriptPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
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
      <div className="flex-1 overflow-y-auto p-4">
        {mediaType === "video" && transcriptJson && transcriptJson.length > 0 ? (
          <div className="space-y-4">
            {transcriptJson.map((segment, index) => (
              <div key={index} className="flex gap-3">
                <span className="flex-shrink-0 text-orange-500 font-mono text-sm font-medium">
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
          <div className="space-y-4">
            {adCopy.headline && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Headline
                </label>
                <p className="text-gray-900 font-medium">{adCopy.headline}</p>
              </div>
            )}
            {adCopy.body && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Body
                </label>
                <p className="text-gray-700 whitespace-pre-wrap">{adCopy.body}</p>
              </div>
            )}
            {adCopy.description && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <p className="text-gray-700">{adCopy.description}</p>
              </div>
            )}
            {adCopy.cta && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Call-to-Action
                </label>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {adCopy.cta}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
