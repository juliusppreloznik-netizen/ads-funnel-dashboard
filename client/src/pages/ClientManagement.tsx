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
import { UserPlus, ArrowLeft, CheckCircle2, Circle, Clock, Key, Trash2, Plus, Archive, ArchiveRestore } from "lucide-react";
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
  const [newTaskName, setNewTaskName] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed" | "archived">("all");
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

  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted successfully!");
      setSelectedClientId(null);
      refetchClients();
    },
    onError: (error) => {
      toast.error("Failed to delete client: " + error.message);
    },
  });

  const createTasksMutation = trpc.clients.createTasksForClient.useMutation({
    onSuccess: () => {
      toast.success("Tasks created successfully!");
      refetchTasks();
    },
    onError: (error) => {
      toast.error("Failed to create tasks: " + error.message);
    },
  });

  const createCustomTaskMutation = trpc.tasks.createCustomTask.useMutation({
    onSuccess: () => {
      toast.success("Task created successfully!");
      setNewTaskName("");
      refetchTasks();
    },
    onError: (error) => {
      toast.error("Failed to create task: " + error.message);
    },
  });

  const archiveClientMutation = trpc.clients.archive.useMutation({
    onSuccess: () => {
      toast.success("Client archived successfully!");
      setSelectedClientId(null);
      refetchClients();
    },
    onError: (error) => {
      toast.error("Failed to archive client: " + error.message);
    },
  });

  const unarchiveClientMutation = trpc.clients.unarchive.useMutation({
    onSuccess: () => {
      toast.success("Client unarchived successfully!");
      refetchClients();
    },
    onError: (error) => {
      toast.error("Failed to unarchive client: " + error.message);
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
            <div className="flex items-center gap-2">
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
              {selectedClient.archived === 0 && progress?.percentage === 100 && (
                <Button
                  onClick={() => archiveClientMutation.mutate({ clientId: selectedClientId })}
                  variant="outline"
                  className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Client
                </Button>
              )}
              {selectedClient.archived === 1 && (
                <Button
                  onClick={() => unarchiveClientMutation.mutate({ clientId: selectedClientId })}
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                >
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                  Unarchive
                </Button>
              )}
              <Button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${selectedClient.name}? This will also delete all their tasks and assets.`)) {
                    deleteClientMutation.mutate({ clientId: selectedClientId });
                  }
                }}
                variant="outline"
                className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Client
              </Button>
            </div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Tasks</h2>
            {tasks && tasks.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="taskName" className="text-white">Task Name</Label>
                      <Input
                        id="taskName"
                        placeholder="Enter task name"
                        className="bg-slate-800 border-white/10 text-white"
                        onChange={(e) => setNewTaskName(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (newTaskName.trim() && selectedClientId) {
                          createCustomTaskMutation.mutate({
                            clientId: selectedClientId,
                            taskName: newTaskName,
                          });
                        }
                      }}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                    >
                      Create Task
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="space-y-4">
            {tasks && tasks.length === 0 && (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-12 text-center">
                <p className="text-slate-400 mb-4">No tasks found for this client.</p>
                <Button
                  onClick={() => createTasksMutation.mutate({ clientId: selectedClientId })}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Default Tasks
                </Button>
              </Card>
            )}
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
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/admin')}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Client Management</h1>
              <p className="text-slate-400">Manage clients and track project progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
              <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all" className="text-white">All Clients</SelectItem>
                <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                <SelectItem value="completed" className="text-white">Completed</SelectItem>
                <SelectItem value="archived" className="text-white">Archived</SelectItem>
              </SelectContent>
            </Select>
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
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients?.filter((client) => {
            if (filterStatus === "all") return client.archived === 0;
            if (filterStatus === "in_progress") return client.archived === 0 && client.progress?.percentage !== 100;
            if (filterStatus === "completed") return client.archived === 0 && client.progress?.percentage === 100;
            if (filterStatus === "archived") return client.archived === 1;
            return true;
          }).map((client) => {
            const isComplete = client.progress?.percentage === 100;
            const isArchived = client.archived === 1;
            return (
              <Card
                key={client.id}
                className={`p-6 cursor-pointer transition-all ${
                  isArchived
                    ? 'bg-gradient-to-br from-slate-800/40 to-slate-700/30 border-slate-500/20 hover:border-slate-500/40 opacity-75'
                    : isComplete
                    ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-500/30 hover:border-green-500/50'
                    : 'bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 hover:border-violet-500/50'
                }`}
                onClick={() => setSelectedClientId(client.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{client.name}</h3>
                    <p className="text-slate-400 text-sm">{client.businessName}</p>
                  </div>
                  {isArchived && (
                    <Archive className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                  {!isArchived && isComplete && (
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-slate-500 text-xs mb-3">{client.email}</p>
                {client.progress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isComplete ? 'text-green-400' : 'text-slate-400'}>
                        Progress
                      </span>
                      <span className={`font-semibold ${isComplete ? 'text-green-400' : 'text-violet-400'}`}>
                        {client.progress.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                        }`}
                        style={{ width: `${client.progress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
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
