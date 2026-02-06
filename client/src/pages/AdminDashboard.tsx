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
import { Loader2, Search, FileText, Zap, Sparkles, Eye, Users, Copy, Download, Settings, Globe, Palette } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [uniqueMechanism, setUniqueMechanism] = useState<string>("Funding Optimization");
  const [isAdminFieldsOpen, setIsAdminFieldsOpen] = useState(false);
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

  // New mutations
  const generateFunnelMutation = trpc.funnels.generateForClient.useMutation({
    onSuccess: () => {
      toast.success("Funnel generated successfully!");
      refetchAssets();
      refetchSelectedClient();
    },
    onError: (error: any) => {
      toast.error("Funnel generation failed: " + error.message);
    },
  });

  const generateSurveyCssMutation = trpc.funnels.generateSurveyCss.useMutation({
    onSuccess: () => {
      toast.success("Survey CSS generated successfully!");
      refetchAssets();
    },
    onError: (error: any) => {
      toast.error("Survey CSS generation failed: " + error.message);
    },
  });

  const reviseAllAssetsMutation = trpc.funnels.reviseAllAssets.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Revised ${data.revisedAssets.join(", ")}!`);
      refetchAssets();
    },
    onError: (error: any) => {
      toast.error("Asset revision failed: " + error.message);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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

  const handleGenerateFunnel = () => {
    if (!selectedClient) return;
    if (!uniqueMechanism.trim()) {
      toast.error("Please enter a unique mechanism");
      return;
    }
    generateFunnelMutation.mutate({ clientId: selectedClient.id, mechanismName: uniqueMechanism });
  };

  const handleGenerateSurveyCss = () => {
    if (!selectedClient) return;
    generateSurveyCssMutation.mutate({ clientId: selectedClient.id });
  };

  const handleReviseAllAssets = () => {
    if (!selectedClient) return;
    if (!assets || assets.length === 0) {
      toast.error("No assets to revise yet");
      return;
    }
    reviseAllAssetsMutation.mutate({ clientId: selectedClient.id });
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
  const landingPageAsset = getLatestAsset("landing_page_html");
  const thankyouPageAsset = getLatestAsset("thankyou_page_html");
  const surveyCssAsset = getLatestAsset("survey_css");

  const anyGenerating = generateVSL.isPending || generateAds.isPending || generateFunnelMutation.isPending || generateSurveyCssMutation.isPending || reviseAllAssetsMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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

              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Generation Panel */}
        {selectedClient && (
          <Card className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 backdrop-blur-xl shadow-2xl">
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
                          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
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
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 h-16"
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
                    className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white border-0 h-16"
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

                {/* Row 2: Funnel + Survey CSS (new) */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleGenerateFunnel}
                    disabled={generateFunnelMutation.isPending || anyGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 h-16"
                  >
                    {generateFunnelMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Funnel...
                      </>
                    ) : (
                      <>
                        <Globe className="h-5 w-5 mr-2" />
                        Generate Funnel
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleGenerateSurveyCss}
                    disabled={generateSurveyCssMutation.isPending || anyGenerating}
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0 h-16"
                  >
                    {generateSurveyCssMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating CSS...
                      </>
                    ) : (
                      <>
                        <Palette className="h-5 w-5 mr-2" />
                        Generate Survey CSS
                      </>
                    )}
                  </Button>
                </div>

                {/* Row 3: Revise All Assets (full width) */}
                <Button
                  onClick={handleReviseAllAssets}
                  disabled={reviseAllAssetsMutation.isPending || anyGenerating || !assets || assets.length === 0}
                  size="lg"
                  className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white border-0 h-16"
                >
                  {reviseAllAssetsMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Revising All Assets...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Revise All Assets
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Asset Viewer Tabs - shown when client is selected and has assets */}
        {selectedClient && assets && assets.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="p-8">
              <h2 className="text-xl font-bold text-white mb-4">Generated Assets</h2>
              <Tabs defaultValue="vsl" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 h-auto">
                  <TabsTrigger value="vsl" className="text-xs sm:text-sm py-2">VSL Script</TabsTrigger>
                  <TabsTrigger value="ads" className="text-xs sm:text-sm py-2">Ad Scripts</TabsTrigger>
                  <TabsTrigger value="landing" className="text-xs sm:text-sm py-2">Landing Page</TabsTrigger>
                  <TabsTrigger value="thankyou" className="text-xs sm:text-sm py-2">Thank You</TabsTrigger>
                  <TabsTrigger value="survey" className="text-xs sm:text-sm py-2">Survey CSS</TabsTrigger>
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

                <TabsContent value="landing" className="mt-4">
                  {landingPageAsset ? (
                    <AssetDisplay
                      asset={landingPageAsset}
                      clientName={selectedClient.name}
                      fileExt="html"
                      isHtml
                      onCopy={handleCopyToClipboard}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                    />
                  ) : (
                    <EmptyAsset label="landing page" />
                  )}
                </TabsContent>

                <TabsContent value="thankyou" className="mt-4">
                  {thankyouPageAsset ? (
                    <AssetDisplay
                      asset={thankyouPageAsset}
                      clientName={selectedClient.name}
                      fileExt="html"
                      isHtml
                      onCopy={handleCopyToClipboard}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                    />
                  ) : (
                    <EmptyAsset label="thank you page" />
                  )}
                </TabsContent>

                <TabsContent value="survey" className="mt-4">
                  {surveyCssAsset ? (
                    <AssetDisplay
                      asset={surveyCssAsset}
                      clientName={selectedClient.name}
                      fileExt="css"
                      onCopy={handleCopyToClipboard}
                      onDownload={handleDownload}
                    />
                  ) : (
                    <EmptyAsset label="survey CSS" />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        )}

        {/* Client List */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 backdrop-blur-xl shadow-2xl">
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
                                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
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
      <div className="bg-slate-950/50 p-4 rounded-lg max-h-80 overflow-y-auto">
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
