import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Play,
  Video,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  "GHL Setup": "🖥️",
  "Domain & Hosting": "🌐",
  "Phone & SMS": "📱",
  "Facebook & Ads": "📘",
};

function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || "🎬";
}

export default function ClientHelpVideos() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);

  const { data: videos = [], isLoading } = trpc.helpVideos.list.useQuery();

  // Derive categories from video data
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white/60 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-slate-300 hover:bg-white/5"
            onClick={() => setLocation("/client-portal")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portal
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Help Videos</h1>
            <p className="text-slate-400 mt-1">
              Step-by-step tutorials to help you get set up
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search videos (e.g. domain, phone, facebook)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
          />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <Play className="h-6 w-6 text-black ml-0.5" />
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
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {video.description}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    {isExpanded ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 text-slate-300 hover:bg-white/5"
                        onClick={() => setExpandedVideo(null)}
                      >
                        Collapse
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-white hover:bg-white/90 text-black"
                        onClick={() => setExpandedVideo(video.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/10 text-slate-300 hover:bg-white/5"
                      onClick={() =>
                        window.open(video.youtubeUrl, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      YouTube
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <Card className="bg-white/[0.04] border-white/10 p-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              {search
                ? `No videos found matching "${search}"`
                : "No help videos available yet"}
            </p>
            {search && (
              <p className="text-slate-500 text-sm mt-2">
                Try a different search term or category
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
