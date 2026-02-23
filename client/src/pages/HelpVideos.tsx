import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Copy,
  Check,
  ExternalLink,
  Play,
  Video,
  Plus,
  Pencil,
  Trash2,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // bare video ID
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Normalize YouTube URL to standard format
function normalizeYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// Default category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  "GHL Setup": "🖥️",
  "Domain & Hosting": "🌐",
  "Phone & SMS": "📱",
  "Facebook & Ads": "📘",
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || "🎬";
}

interface VideoFormData {
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  customCategory: string;
  tags: string;
}

const EMPTY_FORM: VideoFormData = {
  title: "",
  description: "",
  youtubeUrl: "",
  category: "",
  customCategory: "",
  tags: "",
};

export default function HelpVideos() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<number | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<number | null>(null);
  const [formData, setFormData] = useState<VideoFormData>(EMPTY_FORM);
  const [urlPreviewId, setUrlPreviewId] = useState<string | null>(null);

  // tRPC queries and mutations
  const utils = trpc.useUtils();
  const { data: videos = [], isLoading } = trpc.helpVideos.list.useQuery();

  const createMutation = trpc.helpVideos.create.useMutation({
    onSuccess: () => {
      utils.helpVideos.list.invalidate();
      utils.helpVideos.categories.invalidate();
      setShowAddDialog(false);
      setFormData(EMPTY_FORM);
      setUrlPreviewId(null);
      toast.success("Video added to library!");
    },
    onError: (err) => toast.error(`Failed to add video: ${err.message}`),
  });

  const updateMutation = trpc.helpVideos.update.useMutation({
    onSuccess: () => {
      utils.helpVideos.list.invalidate();
      utils.helpVideos.categories.invalidate();
      setShowEditDialog(false);
      setEditingVideoId(null);
      setFormData(EMPTY_FORM);
      setUrlPreviewId(null);
      toast.success("Video updated!");
    },
    onError: (err) => toast.error(`Failed to update video: ${err.message}`),
  });

  const deleteMutation = trpc.helpVideos.delete.useMutation({
    onSuccess: () => {
      utils.helpVideos.list.invalidate();
      utils.helpVideos.categories.invalidate();
      setShowDeleteDialog(false);
      setDeletingVideoId(null);
      toast.success("Video removed from library.");
    },
    onError: (err) => toast.error(`Failed to delete video: ${err.message}`),
  });

  // Derive categories from actual video data
  const categories = useMemo(() => {
    const cats = Array.from(new Set(videos.map((v) => v.category)));
    return ["All", ...cats.sort()];
  }, [videos]);

  // Filter videos
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesCategory =
        activeCategory === "All" || video.category === activeCategory;
      const searchLower = search.toLowerCase();
      const matchesSearch =
        search === "" ||
        video.title.toLowerCase().includes(searchLower) ||
        (video.description || "").toLowerCase().includes(searchLower) ||
        (video.tags || "").toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [videos, activeCategory, search]);

  const copyLink = (video: { id: number; youtubeUrl: string }) => {
    navigator.clipboard.writeText(video.youtubeUrl);
    setCopiedId(video.id);
    toast.success("Link copied! Paste it in your message to the client.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle YouTube URL input with live preview
  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({ ...prev, youtubeUrl: url }));
    const videoId = extractYouTubeVideoId(url);
    setUrlPreviewId(videoId);
  };

  // Open edit dialog
  const openEditDialog = (video: (typeof videos)[0]) => {
    setEditingVideoId(video.id);
    setFormData({
      title: video.title,
      description: video.description || "",
      youtubeUrl: video.youtubeUrl,
      category: video.category,
      customCategory: "",
      tags: video.tags || "",
    });
    setUrlPreviewId(video.videoId);
    setShowEditDialog(true);
  };

  // Submit add form
  const handleAdd = () => {
    const videoId = extractYouTubeVideoId(formData.youtubeUrl);
    if (!videoId) {
      toast.error("Please enter a valid YouTube URL or video ID.");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Please enter a video title.");
      return;
    }
    const category = formData.customCategory.trim() || formData.category;
    if (!category) {
      toast.error("Please select or enter a category.");
      return;
    }

    createMutation.mutate({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      youtubeUrl: normalizeYouTubeUrl(videoId),
      videoId,
      category,
      tags: formData.tags.trim() || undefined,
    });
  };

  // Submit edit form
  const handleEdit = () => {
    if (!editingVideoId) return;
    const videoId = extractYouTubeVideoId(formData.youtubeUrl);
    if (!videoId) {
      toast.error("Please enter a valid YouTube URL or video ID.");
      return;
    }
    const category = formData.customCategory.trim() || formData.category;
    if (!category) {
      toast.error("Please select or enter a category.");
      return;
    }

    updateMutation.mutate({
      id: editingVideoId,
      title: formData.title.trim() || undefined,
      description: formData.description.trim(),
      youtubeUrl: normalizeYouTubeUrl(videoId),
      videoId,
      category,
      tags: formData.tags.trim(),
    });
  };

  // Video form fields (shared between add and edit)
  const renderFormFields = () => {
    const existingCategories = Array.from(
      new Set(videos.map((v) => v.category))
    ).sort();

    return (
      <div className="space-y-4">
        {/* YouTube URL with live preview */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
            YouTube URL or Video ID <span className="text-red-400">*</span>
          </label>
          <Input
            placeholder="https://www.youtube.com/watch?v=... or paste video ID"
            value={formData.youtubeUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
          {urlPreviewId && (
            <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                <img
                  src={`https://img.youtube.com/vi/${urlPreviewId}/hqdefault.jpg`}
                  alt="Video preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {formData.youtubeUrl && !urlPreviewId && (
            <p className="text-red-400 text-xs mt-1">
              Could not detect a valid YouTube video ID from this URL.
            </p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
            Video Title <span className="text-red-400">*</span>
          </label>
          <Input
            placeholder="e.g., How to Set Up Email Deliverability"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
            Description
          </label>
          <Textarea
            placeholder="Brief description of what this video covers..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
            Category <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {existingCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    category: cat,
                    customCategory: "",
                  }))
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  formData.category === cat && !formData.customCategory
                    ? "bg-white text-black"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {getCategoryIcon(cat)} {cat}
              </button>
            ))}
          </div>
          <Input
            placeholder="Or type a new category..."
            value={formData.customCategory}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customCategory: e.target.value,
                category: e.target.value ? "" : prev.category,
              }))
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">
            Search Tags{" "}
            <span className="text-slate-500 font-normal">(comma-separated)</span>
          </label>
          <Input
            placeholder="e.g., email, deliverability, spam, inbox"
            value={formData.tags}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tags: e.target.value }))
            }
            className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Help Videos</h1>
              <p className="text-slate-400 mt-1">
                Quick-send tutorial videos to clients who need help
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setFormData(EMPTY_FORM);
              setUrlPreviewId(null);
              setShowAddDialog(true);
            }}
            className="bg-white hover:bg-white/90 text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search videos (e.g. domain, phone, facebook)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === "All"
                ? videos.length
                : videos.filter((v) => v.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-black shadow-lg shadow-white/10"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {cat === "All" ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <span>{getCategoryIcon(cat)}</span>
                )}
                {cat}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-white/10 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVideos.map((video) => {
            const isExpanded = expandedVideo === video.id;
            return (
              <Card
                key={video.id}
                className="bg-white/[0.04] border-white/10 overflow-hidden"
              >
                {/* Video Thumbnail / Player */}
                {isExpanded ? (
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setExpandedVideo(video.id)}
                    className="relative w-full group cursor-pointer"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-7 w-7 text-white ml-1" />
                      </div>
                    </div>
                  </button>
                )}

                {/* Video Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {video.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-slate-400 whitespace-nowrap">
                      {video.category}
                    </span>
                  </div>
                  {video.description && (
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                      {video.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => copyLink(video)}
                      size="sm"
                      className={`flex-1 transition-all ${
                        copiedId === video.id
                          ? "bg-green-600 hover:bg-green-600 text-white"
                          : "bg-white hover:bg-white/90 text-black"
                      }`}
                    >
                      {copiedId === video.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link to Send
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-slate-300 hover:bg-white/5"
                      onClick={() =>
                        window.open(video.youtubeUrl, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-slate-300 hover:bg-white/5"
                      onClick={() => openEditDialog(video)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      onClick={() => {
                        setDeletingVideoId(video.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {isExpanded && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-slate-300 hover:bg-white/5"
                        onClick={() => setExpandedVideo(null)}
                      >
                        Collapse
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredVideos.length === 0 && !isLoading && (
          <Card className="bg-white/[0.04] border-white/10 p-12 text-center">
            {videos.length === 0 ? (
              <>
                <Video className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  No videos in the library yet
                </p>
                <p className="text-slate-500 text-sm mt-2 mb-4">
                  Add your first tutorial video to start building your help
                  library.
                </p>
                <Button
                  onClick={() => {
                    setFormData(EMPTY_FORM);
                    setUrlPreviewId(null);
                    setShowAddDialog(true);
                  }}
                  className="bg-white hover:bg-white/90 text-black"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Video
                </Button>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">
                  No videos found matching &ldquo;{search}&rdquo;
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Try a different search term or category
                </p>
              </>
            )}
          </Card>
        )}

        {/* Quick Tip */}
        <Card className="mt-8 bg-white/[0.06] border-white/15 p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-white/60 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/70 font-medium text-sm">Quick Tip</p>
              <p className="text-slate-400 text-sm mt-1">
                Click &ldquo;Copy Link to Send&rdquo; on any video, then paste it
                directly into your text or email to the client. Use the{" "}
                <Plus className="h-3 w-3 inline" /> Add Video button to grow your
                library with any YouTube tutorial.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ============ ADD VIDEO DIALOG ============ */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Add Tutorial Video</DialogTitle>
            <DialogDescription className="text-slate-400">
              Paste a YouTube URL to add a new video to your help library.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending}
              className="bg-white hover:bg-white/90 text-black"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ EDIT VIDEO DIALOG ============ */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Video</DialogTitle>
            <DialogDescription className="text-slate-400">
              Update the video details below.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={updateMutation.isPending}
              className="bg-white hover:bg-white/90 text-black"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRMATION DIALOG ============ */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-neutral-950 border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Video?</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will permanently remove this video from the help library. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-white/10 text-slate-300 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deletingVideoId) deleteMutation.mutate({ id: deletingVideoId });
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
