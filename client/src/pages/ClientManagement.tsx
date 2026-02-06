import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { UserPlus, ArrowLeft, CheckCircle2, Circle, Clock, Key, Trash2, Plus, Archive, ArchiveRestore, Sparkles, Download, Copy, Eye, Loader2 } from "lucide-react";
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
  const [isAdminFieldsOpen, setIsAdminFieldsOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newTaskName, setNewTaskName] = useState("");
  const [mechanismName, setMechanismName] = useState("");
  const [isMechanismDialogOpen, setIsMechanismDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "in_progress" | "completed" | "archived">("all");
  const [adminFields, setAdminFields] = useState({
    ghlApiToken: "",
    ghlLocationId: "",
    funnelAccentColor: "",
  });
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
  const { data: selectedClient, refetch: refetchSelectedClient } = trpc.clients.getById.useQuery(
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
  const { data: assets, refetch: refetchAssets } = trpc.assets.getByClientId.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  // Load admin fields when client is selected
  useEffect(() => {
    if (selectedClient) {
      setAdminFields({
        ghlApiToken: selectedClient.ghlApiToken || "",
        ghlLocationId: selectedClient.ghlLocationId || "",
        funnelAccentColor: selectedClient.funnelAccentColor || "",
      });
    }
  }, [selectedClient]);

  // Mutations
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

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Admin fields updated!");
      setIsAdminFieldsOpen(false);
      refetchSelectedClient();
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const generateFunnelMutation = trpc.funnels.generateForClient.useMutation({
    onSuccess: () => {
      toast.success("Funnel generated successfully!");
      refetchAssets();
      refetchSelectedClient();
    },
    onError: (error) => {
      toast.error("Funnel generation failed: " + error.message);
    },
  });

  const generateSurveyCssMutation = trpc.funnels.generateSurveyCss.useMutation({
    onSuccess: () => {
      toast.success("Survey CSS generated successfully!");
      refetchAssets();
    },
    onError: (error) => {
      toast.error("Survey CSS generation failed: " + error.message);
    },
  });

  const reviseAllAssetsMutation = trpc.funnels.reviseAllAssets.useMutation({
    onSuccess: (data) => {
      toast.success(`Revised ${data.revisedAssets.join(", ")}!`);
      refetchAssets();
    },
    onError: (error) => {
      toast.error("Asset revision failed: " + error.message);
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

  const handleUpdateAdminFields = () => {
    if (!selectedClientId) return;
    updateClientMutation.mutate({
      id: selectedClientId,
      ...adminFields,
    });
  };

  const handleGenerateFunnel = () => {
    if (!selectedClientId) return;
    if (!adminFields.funnelAccentColor) {
      toast.error("Please set funnel accent color in admin fields first");
      return;
    }
    if (!mechanismName) {
      setIsMechanismDialogOpen(true);
      return;
    }
    generateFunnelMutation.mutate({ clientId: selectedClientId, mechanismName });
  };

  const handleGenerateSurveyCss = () => {
    if (!selectedClientId) return;
    if (!adminFields.funnelAccentColor) {
      toast.error("Please set funnel accent color in admin fields first");
      return;
    }
    generateSurveyCssMutation.mutate({ clientId: selectedClientId });
  };

  const handleReviseAllAssets = () => {
    if (!selectedClientId) return;
    if (!assets || assets.length === 0) {
      toast.error("No assets to revise yet");
      return;
    }
    reviseAllAssetsMutation.mutate({ clientId: selectedClientId });
  };

  const handleCopyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handlePreview = (content: string) => {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(content);
      win.document.close();
    }
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

  const filteredClients = clients?.filter((client) => {
    if (filterStatus === "archived") return client.archived === 1;
    if (filterStatus === "all") return client.archived === 0;
    // For in_progress and completed, we'd need to check tasks - simplified for now
    return client.archived === 0;
  });

  // Get latest version of each asset type
  const getLatestAsset = (type: string) => {
    return assets
      ?.filter((a) => a.assetType === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const vslAsset = getLatestAsset("vsl");
  const adsAsset = getLatestAsset("ads");
  const landingPageAsset = getLatestAsset("landing_page_html");
  const thankyouPageAsset = getLatestAsset("thankyou_page_html");
  const surveyCssAsset = getLatestAsset("survey_css");

  if (!selectedClientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Client Management</h1>
              <p className="text-slate-400">Manage client intake and project progress</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white text-2xl">Create New Client</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateClient} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={createFormData.email}
                        onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="businessName" className="text-white">Business Name *</Label>
                    <Input
                      id="businessName"
                      required
                      value={createFormData.businessName}
                      onChange={(e) => setCreateFormData({ ...createFormData, businessName: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-white">Portal Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={createFormData.password}
                      onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ghlEmail" className="text-white">GHL Email</Label>
                      <Input
                        id="ghlEmail"
                        value={createFormData.ghlEmail}
                        onChange={(e) => setCreateFormData({ ...createFormData, ghlEmail: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ghlPassword" className="text-white">GHL Password</Label>
                      <Input
                        id="ghlPassword"
                        value={createFormData.ghlPassword}
                        onChange={(e) => setCreateFormData({ ...createFormData, ghlPassword: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="driveLink" className="text-white">Google Drive Link</Label>
                    <Input
                      id="driveLink"
                      value={createFormData.driveLink}
                      onChange={(e) => setCreateFormData({ ...createFormData, driveLink: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600">
                    Create Client
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(["all", "in_progress", "completed", "archived"] as const).map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className={
                  filterStatus === status
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients?.map((client) => (
              <Card
                key={client.id}
                className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6 cursor-pointer hover:border-violet-500/50 transition-all"
                onClick={() => setSelectedClientId(client.id)}
              >
                <h3 className="text-xl font-bold text-white mb-2">{client.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{client.businessName}</p>
                <div className="flex items-center gap-2 text-sm">
                  {client.archived === 1 ? (
                    <span className="text-slate-500">Archived</span>
                  ) : (
                    <span className="text-violet-400">Active</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Client Detail View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setSelectedClientId(null)}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedClient?.name}</h1>
              <p className="text-slate-400">{selectedClient?.businessName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAdminFieldsOpen} onOpenChange={setIsAdminFieldsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  <Key className="h-4 w-4 mr-2" />
                  Admin Fields
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Admin-Only Fields</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">GHL API Token</Label>
                    <Input
                      value={adminFields.ghlApiToken}
                      onChange={(e) => setAdminFields({ ...adminFields, ghlApiToken: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter GHL API token"
                    />
                  </div>
                  <div>
                    <Label className="text-white">GHL Location ID</Label>
                    <Input
                      value={adminFields.ghlLocationId}
                      onChange={(e) => setAdminFields({ ...adminFields, ghlLocationId: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Enter GHL location ID"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Funnel Accent Color</Label>
                    <Input
                      value={adminFields.funnelAccentColor}
                      onChange={(e) => setAdminFields({ ...adminFields, funnelAccentColor: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="#FF5722 or rgb(255, 87, 34)"
                    />
                  </div>
                  <Button
                    onClick={handleUpdateAdminFields}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  >
                    Save Admin Fields
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
            {selectedClient?.archived === 0 && progress?.percentage === 100 && (
              <Button
                onClick={() => archiveClientMutation.mutate({ clientId: selectedClientId })}
                variant="outline"
                className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive Client
              </Button>
            )}
            {selectedClient?.archived === 1 && (
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
                if (confirm(`Are you sure you want to delete ${selectedClient?.name}? This will also delete all their tasks and assets.`)) {
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

        {/* Mechanism Name Dialog */}
        <Dialog open={isMechanismDialogOpen} onOpenChange={setIsMechanismDialogOpen}>
          <DialogContent className="bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">Enter Mechanism Name</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-white">Mechanism Name</Label>
                <Input
                  value={mechanismName}
                  onChange={(e) => setMechanismName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g., Revenue Based Funding, Business Credit Lines"
                />
                <p className="text-sm text-slate-400 mt-2">
                  The unique selling proposition or mechanism for this funnel
                </p>
              </div>
              <Button
                onClick={() => {
                  if (mechanismName.trim() && selectedClientId) {
                    setIsMechanismDialogOpen(false);
                    generateFunnelMutation.mutate({ clientId: selectedClientId, mechanismName });
                  } else {
                    toast.error("Please enter a mechanism name");
                  }
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                Generate Funnel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generation & Assets Section */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">Generation & Assets</h2>
          
          {/* Generation Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              onClick={handleGenerateFunnel}
              disabled={generateFunnelMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {generateFunnelMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Funnel
            </Button>
            <Button
              onClick={handleGenerateSurveyCss}
              disabled={generateSurveyCssMutation.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              {generateSurveyCssMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Survey CSS
            </Button>
            <Button
              onClick={handleReviseAllAssets}
              disabled={reviseAllAssetsMutation.isPending}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
            >
              {reviseAllAssetsMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Revise All Assets
            </Button>
          </div>

          {/* Asset Viewer Tabs */}
          <Tabs defaultValue="vsl" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
              <TabsTrigger value="vsl">VSL Script</TabsTrigger>
              <TabsTrigger value="ads">Ad Scripts</TabsTrigger>
              <TabsTrigger value="landing">Landing Page</TabsTrigger>
              <TabsTrigger value="thankyou">Thank You Page</TabsTrigger>
              <TabsTrigger value="survey">Survey CSS</TabsTrigger>
            </TabsList>

            <TabsContent value="vsl" className="mt-4">
              {vslAsset ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Generated {new Date(vslAsset.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(vslAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(vslAsset.content, `${selectedClient?.name}-vsl.txt`)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-white text-sm whitespace-pre-wrap">{vslAsset.content}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No VSL script generated yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="ads" className="mt-4">
              {adsAsset ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Generated {new Date(adsAsset.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(adsAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(adsAsset.content, `${selectedClient?.name}-ads.txt`)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-white text-sm whitespace-pre-wrap">{adsAsset.content}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No ad scripts generated yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="landing" className="mt-4">
              {landingPageAsset ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Generated {new Date(landingPageAsset.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(landingPageAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(landingPageAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(landingPageAsset.content, `${selectedClient?.name}-landing.html`)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-white text-xs whitespace-pre-wrap font-mono">{landingPageAsset.content}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No landing page generated yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="thankyou" className="mt-4">
              {thankyouPageAsset ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Generated {new Date(thankyouPageAsset.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(thankyouPageAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(thankyouPageAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(thankyouPageAsset.content, `${selectedClient?.name}-thankyou.html`)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-white text-xs whitespace-pre-wrap font-mono">{thankyouPageAsset.content}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No thank you page generated yet
                </div>
              )}
            </TabsContent>

            <TabsContent value="survey" className="mt-4">
              {surveyCssAsset ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                      Generated {new Date(surveyCssAsset.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyToClipboard(surveyCssAsset.content)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(surveyCssAsset.content, `${selectedClient?.name}-survey.css`)}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-white text-xs whitespace-pre-wrap font-mono">{surveyCssAsset.content}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No survey CSS generated yet
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

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
                Create Default Tasks
              </Button>
            </Card>
          )}
          {tasks?.map((task) => (
            <Card key={task.id} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{task.taskName}</h3>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        updateTaskStatusMutation.mutate({
                          taskId: task.id,
                          status: value as "not_started" | "in_progress" | "done",
                        })
                      }
                    >
                      <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="not_started" className="text-white">Not Started</SelectItem>
                        <SelectItem value="in_progress" className="text-white">In Progress</SelectItem>
                        <SelectItem value="done" className="text-white">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder="Internal notes (admin only)..."
                    value={task.internalNotes || ""}
                    onChange={(e) => {
                      const newNotes = e.target.value;
                      updateTaskNotesMutation.mutate({
                        taskId: task.id,
                        notes: newNotes,
                      });
                    }}
                    className="bg-white/5 border-white/10 text-white min-h-[80px]"
                  />
                  {task.completedAt && (
                    <p className="text-sm text-slate-400 mt-2">
                      Completed: {new Date(task.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
