import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  MessageSquarePlus,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Trash2,
  AlertCircle,
  ArrowUpCircle,
  ArrowRightCircle,
} from "lucide-react";

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-slate-400", bg: "bg-slate-500/20", icon: ArrowRightCircle },
  medium: { label: "Med", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: ArrowUpCircle },
  high: { label: "High", color: "text-red-400", bg: "bg-red-500/20", icon: AlertCircle },
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/20", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/20", icon: ArrowRightCircle },
  done: { label: "Done", color: "text-green-400", bg: "bg-green-500/20", icon: Check },
};

export default function ChangeRequestButton() {
  // ALL hooks must be called before any conditional returns
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const panelRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === "admin";

  const { data: requests, refetch } = trpc.changeRequests.list.useQuery(undefined, {
    enabled: isOpen && isAdmin,
  });

  const createMutation = trpc.changeRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Request logged!");
      setDescription("");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.changeRequests.updateStatus.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteMutation = trpc.changeRequests.delete.useMutation({
    onSuccess: () => {
      toast.success("Request deleted");
      refetch();
    },
  });

  const pendingCount = useMemo(
    () => requests?.filter((r) => r.status === "pending").length || 0,
    [requests]
  );

  // Only show for authenticated admin users — AFTER all hooks
  if (!isAdmin) return null;

  const currentPage = window.location.pathname;

  const handleSubmit = () => {
    if (!description.trim()) return;
    createMutation.mutate({
      description: description.trim(),
      page: currentPage,
      priority,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-105 transition-all group"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span className="text-sm font-medium">Request Change</span>
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>
      )}

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[80vh] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/95">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-violet-400" />
              <span className="text-sm font-semibold text-white">Change Requests</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                  {pendingCount} pending
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* New Request Form */}
          <div className="p-4 border-b border-white/10 space-y-3">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the change you want..."
              className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 resize-none min-h-[80px] text-sm focus:border-violet-500/50"
              rows={3}
            />

            <div className="flex items-center justify-between">
              {/* Priority selector */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500 mr-1">Priority:</span>
                {(["low", "medium", "high"] as const).map((p) => {
                  const config = PRIORITY_CONFIG[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                        priority === p
                          ? `${config.bg} ${config.color} ring-1 ring-current`
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!description.trim() || createMutation.isPending}
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white text-xs px-3 h-7"
              >
                <Send className="h-3 w-3 mr-1" />
                {createMutation.isPending ? "..." : "Log"}
              </Button>
            </div>

            <p className="text-[10px] text-slate-600">
              Page: {currentPage} · Ctrl+Enter to submit
            </p>
          </div>

          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center justify-between px-4 py-2 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span>Request History ({requests?.length || 0})</span>
            {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {/* History List */}
          {showHistory && (
            <div className="flex-1 overflow-y-auto max-h-[40vh] divide-y divide-white/5">
              {!requests || requests.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No requests yet. Log your first one above.
                </div>
              ) : (
                requests.map((req) => {
                  const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const priorityConfig = PRIORITY_CONFIG[req.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
                  const PriorityIcon = priorityConfig.icon;

                  return (
                    <div key={req.id} className="px-4 py-3 hover:bg-white/5 transition-colors group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 leading-snug">{req.description}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`flex items-center gap-1 text-[10px] ${priorityConfig.color}`}>
                              <PriorityIcon className="h-3 w-3" />
                              {priorityConfig.label}
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${statusConfig.bg} ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                            {req.page && (
                              <span className="text-[10px] text-slate-600 truncate max-w-[120px]">
                                {req.page}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {req.status !== "done" && (
                            <button
                              onClick={() =>
                                updateStatusMutation.mutate({
                                  id: req.id,
                                  status: req.status === "pending" ? "in_progress" : "done",
                                })
                              }
                              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-green-400 transition-colors"
                              title={req.status === "pending" ? "Mark In Progress" : "Mark Done"}
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate({ id: req.id })}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
