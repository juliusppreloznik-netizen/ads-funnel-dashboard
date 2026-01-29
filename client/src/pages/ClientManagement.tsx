import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus, ArrowLeft, CheckCircle2, Circle, Clock, Key } from "lucide-react";
import { useLocation } from "wouter";

interface Task {
  id: number;
  taskName: string;
  taskOrder: number;
  status: "not_started" | "in_progress" | "done";
  internalNotes: string | null;
  completedAt: Date | string | null;
}

export default function ClientManagement() {
  const [, setLocation] = useLocation();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [createFormData, setCreateFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    password: "",
    ghlEmail: "",
    ghlPassword: "",
    driveLink: "",
  });

  const { data: clients, refetch: refetchClients } = trpc.clients.list.useQuery();
  const { data: selectedClient } = trpc.clients.getById.useQuery(
    { id: selectedClientId! },
    { enabled: !!selectedClientId }
  );
  const { data: tasks, refetch: refetchTasks } = trpc.tasks.getByClientId.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );
  const { data: progress } = trpc.tasks.getProgress.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const createClientMutation = trpc.clients.createManual.useMutation({
    onSuccess: () => {
      toast.success("Client created successfully!");
      setIsCreateDialogOpen(false);
      setCreateFormData({
        name: "",
        email: "",
        businessName: "",
        password: "",
        ghlEmail: "",
        ghlPassword: "",
        driveLink: "",
      });
      refetchClients();
    },
    onError: (error) => {
      toast.error("Failed to create client: " + error.message);
    },
  });

  const updateTaskStatusMutation = trpc.tasks.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Task updated!");
      refetchTasks();
    },
    onError: (error) => {
      toast.error("Failed to update task: " + error.message);
    },
  });

  const updateTaskNotesMutation = trpc.tasks.updateNotes.useMutation({
    onSuccess: () => {
      toast.success("Notes saved!");
      refetchTasks();
    },
    onError: (error) => {
      toast.error("Failed to save notes: " + error.message);
    },
  });

  const resetPasswordMutation = trpc.clients.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully!");
      setIsResetPasswordOpen(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error("Failed to reset password: " + error.message);
    },
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    createClientMutation.mutate(createFormData);
  };

  const handleResetPassword = () => {
    if (!selectedClientId || !newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    resetPasswordMutation.mutate({ clientId: selectedClientId, newPassword });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Circle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30";
    }
  };

  if (selectedClientId && selectedClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setSelectedClientId(null)}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Clients
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{selectedClient.name}</h1>
                <p className="text-slate-400">{selectedClient.businessName}</p>
              </div>
            </div>
            <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Key className="h-4 w-4 mr-2" />
                  Reset Password
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Reset Client Password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                  <Button
                    onClick={handleResetPassword}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  >
                    Reset Password
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Progress Card */}
          {progress && (
            <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Overall Progress</h2>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                  {progress.percentage}%
                </span>
              </div>
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-2">
                {progress.completedTasks} of {progress.totalTasks} tasks completed
              </p>
            </Card>
          )}

          {/* Tasks List */}
          <div className="space-y-4">
            {tasks?.map((task: Task) => (
              <Card key={task.id} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold text-white">{task.taskName}</h3>
                    </div>
                    <Select
                      value={task.status}
                      onValueChange={(value: "not_started" | "in_progress" | "done") => {
                        updateTaskStatusMutation.mutate({
                          taskId: task.id,
                          status: value,
                        });
                      }}
                    >
                      <SelectTrigger className={`w-40 ${getStatusColor(task.status)} border`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {task.completedAt && (
                    <p className="text-sm text-slate-400">
                      Completed on {new Date(task.completedAt).toLocaleDateString()}
                    </p>
                  )}

                  <div>
                    <Label className="text-white text-sm">Internal Notes</Label>
                    <Textarea
                      value={task.internalNotes || ""}
                      onChange={(e) => {
                        updateTaskNotesMutation.mutate({
                          taskId: task.id,
                          notes: e.target.value,
                        });
                      }}
                      placeholder="Add internal notes (not visible to client)"
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Management</h1>
            <p className="text-slate-400">Manage clients and track project progress</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Client</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Full Name *</Label>
                    <Input
                      value={createFormData.name}
                      onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label className="text-white">Email *</Label>
                    <Input
                      type="email"
                      value={createFormData.email}
                      onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Business Name *</Label>
                  <Input
                    value={createFormData.businessName}
                    onChange={(e) => setCreateFormData({ ...createFormData, businessName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Portal Password *</Label>
                  <Input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">GHL Email</Label>
                    <Input
                      value={createFormData.ghlEmail}
                      onChange={(e) => setCreateFormData({ ...createFormData, ghlEmail: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">GHL Password</Label>
                    <Input
                      type="password"
                      value={createFormData.ghlPassword}
                      onChange={(e) => setCreateFormData({ ...createFormData, ghlPassword: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Google Drive Link</Label>
                  <Input
                    value={createFormData.driveLink}
                    onChange={(e) => setCreateFormData({ ...createFormData, driveLink: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  {createClientMutation.isPending ? "Creating..." : "Create Client"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients?.map((client) => (
            <Card
              key={client.id}
              className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6 cursor-pointer hover:border-violet-500/50 transition-all"
              onClick={() => setSelectedClientId(client.id)}
            >
              <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
              <p className="text-slate-400 text-sm mb-3">{client.businessName}</p>
              <p className="text-slate-500 text-xs">{client.email}</p>
            </Card>
          ))}
        </div>

        {clients?.length === 0 && (
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-12 text-center">
            <p className="text-slate-400">No clients yet. Create your first client to get started.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
