import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Search, FileText, Zap, Sparkles, Eye, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [uniqueMechanism, setUniqueMechanism] = useState<string>("Funding Optimization");

  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery(undefined, {
    enabled: !!user,
  });

  const utils = trpc.useUtils();

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

  const selectedClient = clients?.find((c) => c.id === selectedClientId);

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
              <Button
                onClick={() => setLocation("/admin/funnel-builder")}
                variant="outline"
                className="bg-violet-600/20 border-violet-500/30 text-violet-300 hover:bg-violet-600/30"
              >
                <Zap className="h-4 w-4 mr-2" />
                Funnel Builder
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

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleGenerateVSL}
                    disabled={generateVSL.isPending}
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
                    disabled={generateAds.isPending}
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
              </div>
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
