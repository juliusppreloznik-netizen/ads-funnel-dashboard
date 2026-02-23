import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Search, FileText, Zap, Sparkles, Eye, Users, Copy, Download, Settings, ClipboardCopy, ExternalLink, User, Mail, Building2, KeyRound, Link2, Trash2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [uniqueMechanism, setUniqueMechanism] = useState<string>("Funding Optimization");
  const [isAdminFieldsOpen, setIsAdminFieldsOpen] = useState(false);
  const [isClientDetailsOpen, setIsClientDetailsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [adminFields, setAdminFields] = useState({
    ghlApiToken: "",
    ghlLocationId: "",
    funnelAccentColor: "",
  });

  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: selectedClient, refetch: refetchSelectedClient } = trpc.clients.getById.useQuery(
    { id: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const { data: assets, refetch: refetchAssets } = trpc.assets.getByClientId.useQuery(
    { clientId: selectedClientId! },
    { enabled: !!selectedClientId }
  );

  const utils = trpc.useUtils();

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

  // Existing mutations
  const generateVSL = trpc.generation.generateVSL.useMutation({
    onSuccess: () => {
      toast.success("VSL script generated successfully!");
      utils.assets.getByClientId.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to generate VSL: " + error.message);
    },
  });

  const generateAds = trpc.generation.generateAds.useMutation({
    onSuccess: () => {
      toast.success("5 ad scripts generated successfully!");
      utils.assets.getByClientId.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to generate ads: " + error.message);
    },
  });

  const clearAllGenerations = trpc.generation.clearAll.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Cleared all test generations (${data.deleted} removed)`);
      utils.assets.getByClientId.invalidate();
    },
    onError: (error: any) => {
      toast.error("Failed to clear: " + error.message);
    },
  });

  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Admin fields updated!");
      setIsAdminFieldsOpen(false);
      refetchSelectedClient();
    },
    onError: (error: any) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-neutral-950 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const filteredClients = clients?.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.businessName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateVSL = () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    if (!uniqueMechanism.trim()) {
      toast.error("Please enter a unique mechanism");
      return;
    }
    generateVSL.mutate({ clientId: selectedClient.id, uniqueMechanism });
  };

  const handleGenerateAds = () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    if (!uniqueMechanism.trim()) {
      toast.error("Please enter a unique mechanism");
      return;
    }
    generateAds.mutate({ clientId: selectedClient.id, uniqueMechanism });
  };

  const handleUpdateAdminFields = () => {
    if (!selectedClientId) return;
    updateClientMutation.mutate({
      id: selectedClientId,
      ...adminFields,
    });
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

  // Get latest version of each asset type
  const getLatestAsset = (type: string) => {
    return assets
      ?.filter((a) => a.assetType === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const vslAsset = getLatestAsset("vsl");
  const adsAsset = getLatestAsset("ads");
  const anyGenerating = generateVSL.isPending || generateAds.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/catalyst-logo.png" alt="Catalyst" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-white">Command Center</h1>
                <p className="text-sm text-slate-400">AI-Powered Asset Generation</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/admin/clients")}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Clients
              </Button>
              <Button
                onClick={() => setLocation("/admin/help-videos")}
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <FileText className="h-4 w-4 mr-2" />
                Help Videos
              </Button>

              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Links Bar */}
        <Card className="mb-6 bg-white/[0.03] border-white/10 backdrop-blur-xl">
          <div className="p-4 flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-white flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Quick Links
            </span>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <span className="text-xs text-slate-400">Intake Form:</span>
                <code className="text-xs text-white/70 font-mono">{window.location.origin}/</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => handleCopyToClipboard(window.location.origin + "/")}
                >
                  <ClipboardCopy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <span className="text-xs text-slate-400">Setup Guide:</span>
                <code className="text-xs text-white/70 font-mono">{window.location.origin}/setup</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => handleCopyToClipboard(window.location.origin + "/setup")}
                >
                  <ClipboardCopy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => window.open("/setup", "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                <span className="text-xs text-slate-400">Help Videos:</span>
                <code className="text-xs text-white/70 font-mono">{window.location.origin}/help-videos</code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => handleCopyToClipboard(window.location.origin + "/help-videos")}
                >
                  <ClipboardCopy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                  onClick={() => window.open("/help-videos", "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              {selectedClient && (
                <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5">
                  <span className="text-xs text-slate-400">Onboarding:</span>
                  <code className="text-xs text-white/70 font-mono">{window.location.origin}/onboarding/{selectedClient.id}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                    onClick={() => handleCopyToClipboard(window.location.origin + "/onboarding/" + selectedClient.id)}
                  >
                    <ClipboardCopy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-white/10"
                    onClick={() => window.open("/onboarding/" + selectedClient.id, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Generation Panel */}
        {selectedClient && (
          <Card className="mb-8 bg-white/[0.04] border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedClient.name}
                  </h2>
                  <p className="text-slate-400">{selectedClient.businessName}</p>
                  <p className="text-sm text-slate-500">{selectedClient.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Client Details Dialog */}
                  <Dialog open={isClientDetailsOpen} onOpenChange={(open) => { setIsClientDetailsOpen(open); if (!open) setShowPassword(false); }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Client Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-950 border-white/10 max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-white">Client Intake Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <ClientDetailRow
                          icon={<User className="h-4 w-4 text-white/60" />}
                          label="Full Name"
                          value={selectedClient.name}
                          onCopy={handleCopyToClipboard}
                        />
                        <ClientDetailRow
                          icon={<Mail className="h-4 w-4 text-white/60" />}
                          label="Email Address"
                          value={selectedClient.email}
                          onCopy={handleCopyToClipboard}
                        />
                        <ClientDetailRow
                          icon={<Building2 className="h-4 w-4 text-emerald-400" />}
                          label="Business Name"
                          value={selectedClient.businessName}
                          onCopy={handleCopyToClipboard}
                        />
                        <div className="border-t border-white/10 pt-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">GoHighLevel Credentials</p>
                          <div className="space-y-3">
                            <ClientDetailRow
                              icon={<Mail className="h-4 w-4 text-amber-400" />}
                              label="GHL Email"
                              value={selectedClient.ghlEmail || "—"}
                              onCopy={handleCopyToClipboard}
                            />
                            <ClientDetailRow
                              icon={<KeyRound className="h-4 w-4 text-rose-400" />}
                              label="GHL Password"
                              value={selectedClient.ghlPassword || "—"}
                              masked={!showPassword}
                              onCopy={handleCopyToClipboard}
                              onToggleMask={() => setShowPassword(!showPassword)}
                            />
                          </div>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resources</p>
                          <ClientDetailRow
                            icon={<Link2 className="h-4 w-4 text-cyan-400" />}
                            label="Google Drive Link"
                            value={selectedClient.driveLink || "—"}
                            isLink={!!selectedClient.driveLink}
                            onCopy={handleCopyToClipboard}
                          />
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <p className="text-xs text-slate-500">Submitted {new Date(selectedClient.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Admin Fields Dialog */}
                  <Dialog open={isAdminFieldsOpen} onOpenChange={setIsAdminFieldsOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Fields
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-950 border-white/10">
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
                          <div className="flex gap-2">
                            <Input
                              value={adminFields.funnelAccentColor}
                              onChange={(e) => setAdminFields({ ...adminFields, funnelAccentColor: e.target.value })}
                              className="bg-white/5 border-white/10 text-white flex-1"
                              placeholder="#8B5CF6"
                            />
                            {adminFields.funnelAccentColor && (
                              <div
                                className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
                                style={{ backgroundColor: adminFields.funnelAccentColor }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Used for survey CSS generation. Auto-set after funnel generation.</p>
                        </div>
                        <Button
                          onClick={handleUpdateAdminFields}
                          className="w-full bg-white text-black hover:bg-white/90"
                          disabled={updateClientMutation.isPending}
                        >
                          {updateClientMutation.isPending ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Save Admin Fields
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation(`/admin/assets/${selectedClient.id}`)}
                    className="text-white hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Assets
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="uniqueMechanism" className="text-white mb-2 block">
                    Unique Mechanism
                  </Label>
                  <Input
                    id="uniqueMechanism"
                    value={uniqueMechanism}
                    onChange={(e) => setUniqueMechanism(e.target.value)}
                    placeholder="e.g., Funding Optimization, Credit Stacking System"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    This mechanism will be used across all generated assets
                  </p>
                </div>

                {/* Row 1: VSL + Ads (existing) */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleGenerateVSL}
                    disabled={generateVSL.isPending || anyGenerating}
                    size="lg"
                    className="bg-white hover:bg-white/90 text-black border-0 h-16"
                  >
                    {generateVSL.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5 mr-2" />
                        Generate VSL Script
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleGenerateAds}
                    disabled={generateAds.isPending || anyGenerating}
                    size="lg"
                    className="bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10 h-16"
                  >
                    {generateAds.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate 5 Ads
                      </>
                    )}
                  </Button>
                </div>

                {/* Clear Test Generations */}
                <div className="pt-2 border-t border-white/5">
                  <Button
                    onClick={() => {
                      if (confirm("Clear ALL generated assets (VSL scripts, ad scripts) for ALL clients? This cannot be undone.")) {
                        clearAllGenerations.mutate();
                      }
                    }}
                    disabled={clearAllGenerations.isPending}
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    {clearAllGenerations.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Test Generations
                      </>
                    )}
                  </Button>
                </div>

              </div>
            </div>
          </Card>
        )}

        {/* Asset Viewer Tabs - shown when client is selected and has assets */}
        {selectedClient && assets && assets.length > 0 && (
          <Card className="mb-8 bg-white/[0.04] border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-4">Generated Assets</h2>
              <Tabs defaultValue="vsl" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/5 h-auto">
                  <TabsTrigger value="vsl" className="text-xs sm:text-sm py-2">VSL Script</TabsTrigger>
                  <TabsTrigger value="ads" className="text-xs sm:text-sm py-2">Ad Scripts</TabsTrigger>
                </TabsList>

                <TabsContent value="vsl" className="mt-4">
                  {vslAsset ? (
                    <AssetDisplay
                      asset={vslAsset}
                      clientName={selectedClient.name}
                      fileExt="txt"
                      onCopy={handleCopyToClipboard}
                      onDownload={handleDownload}
                    />
                  ) : (
                    <EmptyAsset label="VSL script" />
                  )}
                </TabsContent>

                <TabsContent value="ads" className="mt-4">
                  {adsAsset ? (
                    <AssetDisplay
                      asset={adsAsset}
                      clientName={selectedClient.name}
                      fileExt="txt"
                      onCopy={handleCopyToClipboard}
                      onDownload={handleDownload}
                    />
                  ) : (
                    <EmptyAsset label="ad scripts" />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        )}

        {/* Client List */}
        <Card className="bg-white/[0.04] border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Client Submissions</h2>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30"
                />
              </div>
            </div>

            {clientsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : filteredClients && filteredClients.length > 0 ? (
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Email</TableHead>
                      <TableHead className="text-slate-300">Business</TableHead>
                      <TableHead className="text-slate-300">Submitted</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className={`border-white/10 hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedClientId === client.id ? "bg-white/10" : ""
                        }`}
                      >
                        <TableCell className="font-medium text-white">
                          {client.name}
                        </TableCell>
                        <TableCell className="text-slate-400">{client.email}</TableCell>
                        <TableCell className="text-slate-400">
                          {client.businessName}
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => setSelectedClientId(client.id)}
                            variant={selectedClientId === client.id ? "default" : "outline"}
                            size="sm"
                            className={
                              selectedClientId === client.id
                                ? "bg-white text-black border-0"
                                : "border-white/20 text-white hover:bg-white/10"
                            }
                          >
                            {selectedClientId === client.id ? (
                              <>
                                <Zap className="h-4 w-4 mr-1" />
                                Selected
                              </>
                            ) : (
                              "Select"
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">No client submissions found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Sub-components for asset display
function AssetDisplay({
  asset,
  clientName,
  fileExt,
  isHtml,
  onCopy,
  onDownload,
  onPreview,
}: {
  asset: { content: string; createdAt: Date | string };
  clientName: string;
  fileExt: string;
  isHtml?: boolean;
  onCopy: (content: string) => void;
  onDownload: (content: string, filename: string) => void;
  onPreview?: (content: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Generated {new Date(asset.createdAt).toLocaleString()}
        </p>
        <div className="flex gap-2">
          {isHtml && onPreview && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPreview(asset.content)}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(asset.content)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(asset.content, `${clientName}-asset.${fileExt}`)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
      <div className="bg-black/40 p-4 rounded-lg max-h-80 overflow-y-auto">
        <pre className="text-white text-xs whitespace-pre-wrap font-mono">{asset.content}</pre>
      </div>
    </div>
  );
}

function EmptyAsset({ label }: { label: string }) {
  return (
    <div className="text-center py-10 text-slate-500">
      No {label} generated yet
    </div>
  );
}

function ClientDetailRow({
  icon,
  label,
  value,
  masked,
  isLink,
  onCopy,
  onToggleMask,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  masked?: boolean;
  isLink?: boolean;
  onCopy: (content: string) => void;
  onToggleMask?: () => void;
}) {
  const displayValue = masked ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : value;
  const canCopy = value && value !== "\u2014";

  return (
    <div className="flex items-center gap-3 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 mb-0.5">{label}</p>
        {isLink && value !== "\u2014" ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-2 truncate block"
          >
            {value}
          </a>
        ) : (
          <p className={`text-sm text-white truncate ${masked ? "font-mono tracking-wider" : ""}`}>
            {displayValue}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onToggleMask && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleMask}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
        {canCopy && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(value)}
            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
