import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle2, Circle, Clock, LogOut, Video } from "lucide-react";
import { useLocation } from "wouter";

interface Task {
  id: number;
  taskName: string;
  taskOrder: number;
  status: "not_started" | "in_progress" | "done";
  completedAt: string | null;
}

interface ClientData {
  id: number;
  name: string;
  businessName: string;
  email: string;
}

export default function ClientPortal() {
  const [, setLocation] = useLocation();
  const [client, setClient] = useState<ClientData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progress, setProgress] = useState({ completedTasks: 0, totalTasks: 0, percentage: 0 });
  const [onboarding, setOnboarding] = useState({ completedSteps: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const response = await fetch("/api/client-auth/me");
      
      if (!response.ok) {
        toast.error("Session expired. Please login again.");
        setLocation("/client-login");
        return;
      }

      const data = await response.json();
      setClient(data.client);
      setTasks(data.tasks);
      setProgress(data.progress);
      if (data.onboarding) setOnboarding(data.onboarding);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/client-auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      setLocation("/client-login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "in_progress":
        return <Clock className="h-6 w-6 text-yellow-500" />;
      default:
        return <Circle className="h-6 w-6 text-slate-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "done":
        return "Completed";
      case "in_progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "text-green-400";
      case "in_progress":
        return "text-yellow-400";
      default:
        return "text-slate-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <img src="/catalyst-logo.png" alt="Catalyst Marketing" className="h-12 w-auto" />
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome Card */}
        <Card className="bg-white/[0.04] border-white/10 backdrop-blur-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {client?.name}!
          </h1>
          <p className="text-slate-400 text-lg">
            {client?.businessName}
          </p>
        </Card>

        {/* Quick Links */}
        <div className="flex gap-3">
          <Button
            onClick={() => setLocation("/portal/help-videos")}
            variant="outline"
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Video className="h-4 w-4 mr-2" />
            Help Videos
          </Button>
        </div>

        {/* Continue Onboarding Banner */}
        {client && onboarding.completedSteps < 5 && (
          <Card className="bg-white/[0.06] border-white/15 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Finish Your Onboarding</h2>
                <p className="text-slate-300 text-sm">
                  Complete the remaining setup steps so we can start building your assets.
                </p>
              </div>
              <Button
                onClick={() => setLocation(`/onboarding/${client.id}`)}
                className="bg-white text-black hover:bg-white/90 whitespace-nowrap"
              >
                Continue Onboarding
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Card */}
        <Card className="bg-white/[0.04] border-white/10 backdrop-blur-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-white">Project Progress</h2>
              <span className="text-3xl font-bold text-white">
                {progress.percentage}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-4 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white transition-all duration-500 rounded-full"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            
            <p className="text-slate-400 text-sm mt-2">
              {progress.completedTasks} of {progress.totalTasks} tasks completed
            </p>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="text-white font-medium">{task.taskName}</h3>
                    {task.completedAt && (
                      <p className="text-slate-500 text-sm">
                        Completed on {new Date(task.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                  {getStatusText(task.status)}
                </span>
              </div>
            ))}
          </div>
        </Card>


      </div>
    </div>
  );
}
