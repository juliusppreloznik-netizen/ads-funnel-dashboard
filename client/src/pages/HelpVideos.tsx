import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Copy,
  Check,
  ExternalLink,
  Play,
  Monitor,
  Globe,
  Phone,
  Facebook,
  Shield,
  Video,
} from "lucide-react";
import { toast } from "sonner";

interface HelpVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  category: string;
  youtubeUrl: string;
  tags: string[];
}

const HELP_VIDEOS: HelpVideo[] = [
  {
    id: "ghl-setup",
    title: "GoHighLevel Account Setup",
    description:
      "Walk your client through creating their GHL account from scratch. Covers signup, choosing the $97/mo plan, and initial dashboard orientation.",
    videoId: "YmYNiMH8uQQ",
    category: "GHL Setup",
    youtubeUrl: "https://www.youtube.com/watch?v=YmYNiMH8uQQ",
    tags: ["ghl", "setup", "account", "signup", "new account"],
  },
  {
    id: "agency-admin",
    title: "Add Agency Admin in GHL",
    description:
      "Show your client how to add your team as an agency admin in their GoHighLevel account. Required for building funnels, automations, and workflows.",
    videoId: "njgC28VeUEc",
    category: "GHL Setup",
    youtubeUrl: "https://www.youtube.com/watch?v=njgC28VeUEc",
    tags: ["ghl", "agency", "admin", "access", "team", "permissions"],
  },
  {
    id: "domain-setup",
    title: "Domain Setup in GHL",
    description:
      "Guide your client through buying a new domain, transferring an existing one, or connecting a domain they already own inside GoHighLevel.",
    videoId: "L7COia29_Cs",
    category: "Domain & Hosting",
    youtubeUrl: "https://www.youtube.com/watch?v=L7COia29_Cs",
    tags: ["domain", "dns", "hosting", "transfer", "buy domain", "connect"],
  },
  {
    id: "phone-number",
    title: "Phone Number Purchase in GHL",
    description:
      "Help your client buy a dedicated phone number inside GHL for SMS follow-ups, calls, and automation triggers.",
    videoId: "t1wPfy7PTRw",
    category: "Phone & SMS",
    youtubeUrl: "https://www.youtube.com/watch?v=t1wPfy7PTRw",
    tags: ["phone", "sms", "number", "twilio", "calls", "text"],
  },
  {
    id: "facebook-access",
    title: "Add User to Meta Business Manager",
    description:
      "Walk your client through adding you as a user in their Meta Business Manager so you can set up ad campaigns, tracking pixels, and CAPI integration.",
    videoId: "r9bwiFVUezE",
    category: "Facebook & Ads",
    youtubeUrl: "https://www.youtube.com/watch?v=r9bwiFVUezE",
    tags: ["facebook", "meta", "business manager", "ads", "pixel", "access", "admin"],
  },
];

const CATEGORIES = [
  { name: "All", icon: Video },
  { name: "GHL Setup", icon: Monitor },
  { name: "Domain & Hosting", icon: Globe },
  { name: "Phone & SMS", icon: Phone },
  { name: "Facebook & Ads", icon: Facebook },
];

export default function HelpVideos() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const filteredVideos = HELP_VIDEOS.filter((video) => {
    const matchesCategory =
      activeCategory === "All" || video.category === activeCategory;
    const matchesSearch =
      search === "" ||
      video.title.toLowerCase().includes(search.toLowerCase()) ||
      video.description.toLowerCase().includes(search.toLowerCase()) ||
      video.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const copyLink = (video: HelpVideo) => {
    navigator.clipboard.writeText(video.youtubeUrl);
    setCopiedId(video.id);
    toast.success("Link copied! Paste it in your message to the client.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
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

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search videos (e.g. domain, phone, facebook)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/80 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            const count =
              cat.name === "All"
                ? HELP_VIDEOS.length
                : HELP_VIDEOS.filter((v) => v.category === cat.name).length;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.name}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-700 text-slate-400"
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
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 overflow-hidden"
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
                      <div className="w-16 h-16 rounded-full bg-violet-600/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
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
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-700/60 text-slate-400 whitespace-nowrap">
                      {video.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                    {video.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => copyLink(video)}
                      size="sm"
                      className={`flex-1 transition-all ${
                        copiedId === video.id
                          ? "bg-green-600 hover:bg-green-600 text-white"
                          : "bg-violet-600 hover:bg-violet-700 text-white"
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

        {filteredVideos.length === 0 && (
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              No videos found matching "{search}"
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Try a different search term or category
            </p>
          </Card>
        )}

        {/* Quick Tip */}
        <Card className="mt-8 bg-gradient-to-r from-violet-900/30 to-indigo-900/30 border-violet-500/20 p-5">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-violet-300 font-medium text-sm">
                Quick Tip
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Click "Copy Link to Send" on any video, then paste it directly
                into your text or email to the client. They'll get a direct
                YouTube link they can watch on any device.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
