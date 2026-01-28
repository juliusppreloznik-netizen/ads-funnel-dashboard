import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Search, FileText, Image as ImageIcon, Globe } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: clients, isLoading: clientsLoading } = trpc.clients.list.useQuery(undefined, {
    enabled: !!user,
  });

  const generateVSL = trpc.generation.generateVSL.useMutation({
    onSuccess: () => {
      toast.success("VSL script generated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to generate VSL: " + error.message);
    },
  });

  const generateAds = trpc.generation.generateAds.useMutation({
    onSuccess: () => {
      toast.success("5 ad scripts generated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to generate ads: " + error.message);
    },
  });

  const generateLandingPage = trpc.generation.generateLandingPage.useMutation({
    onSuccess: () => {
      toast.success("Landing page generated successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to generate landing page: " + error.message);
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    generateVSL.mutate({ clientId: selectedClient.id });
  };

  const handleGenerateAds = () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    generateAds.mutate({ clientId: selectedClient.id });
  };

  const handleGenerateLandingPage = () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    generateLandingPage.mutate({ clientId: selectedClient.id });
  };

  const viewAssets = () => {
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    setLocation(`/admin/assets/${selectedClient.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Admin Dashboard</CardTitle>
            <CardDescription>Manage client submissions and generate marketing assets</CardDescription>
          </CardHeader>
        </Card>

        {selectedClient && (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Selected Client: {selectedClient.name}</CardTitle>
              <CardDescription>
                {selectedClient.businessName} • {selectedClient.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={handleGenerateVSL}
                  disabled={generateVSL.isPending}
                  size="lg"
                  className="h-24 flex flex-col gap-2"
                >
                  {generateVSL.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <FileText className="h-6 w-6" />
                      <span>Generate VSL</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateAds}
                  disabled={generateAds.isPending}
                  size="lg"
                  className="h-24 flex flex-col gap-2"
                  variant="secondary"
                >
                  {generateAds.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-6 w-6" />
                      <span>Generate 5 Ads</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateLandingPage}
                  disabled={generateLandingPage.isPending}
                  size="lg"
                  className="h-24 flex flex-col gap-2"
                  variant="outline"
                >
                  {generateLandingPage.isPending ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <>
                      <Globe className="h-6 w-6" />
                      <span>Generate Landing Page</span>
                    </>
                  )}
                </Button>
              </div>
              <Button onClick={viewAssets} className="w-full mt-4" variant="outline">
                View Generated Assets
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Client Submissions</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredClients && filteredClients.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow
                        key={client.id}
                        className={selectedClientId === client.id ? "bg-muted" : ""}
                      >
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.businessName}</TableCell>
                        <TableCell>
                          {new Date(client.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => setSelectedClientId(client.id)}
                            size="sm"
                            variant={selectedClientId === client.id ? "default" : "outline"}
                          >
                            {selectedClientId === client.id ? "Selected" : "Select"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No clients found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
