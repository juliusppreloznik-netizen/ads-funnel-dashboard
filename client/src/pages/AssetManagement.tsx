import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Download, ArrowLeft, Edit } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AssetManagement() {
  const { clientId } = useParams<{ clientId: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { data: client } = trpc.clients.getById.useQuery(
    { id: parseInt(clientId || "0") },
    { enabled: !!user && !!clientId }
  );

  const { data: assets, isLoading: assetsLoading } = trpc.assets.getByClientId.useQuery(
    { clientId: parseInt(clientId || "0") },
    { enabled: !!user && !!clientId }
  );

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

  const vslAssets = assets?.filter((a) => a.assetType === "vsl") || [];
  const adsAssets = assets?.filter((a) => a.assetType === "ads") || [];
  const landingPageAssets = assets?.filter((a) => a.assetType === "landing_page") || [];

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded successfully!");
  };

  const handleEdit = (assetId: number) => {
    setSelectedAssetId(assetId);
    setIsEditing(true);
    setLocation(`/admin/editor/${assetId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/admin")}
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              Generated Assets
            </CardTitle>
            <CardDescription>
              {client ? `${client.name} - ${client.businessName}` : "Loading..."}
            </CardDescription>
          </CardHeader>
        </Card>

        {assetsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="vsl" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="vsl">
                VSL Scripts ({vslAssets.length})
              </TabsTrigger>
              <TabsTrigger value="ads">
                Ad Scripts ({adsAssets.length})
              </TabsTrigger>
              <TabsTrigger value="landing">
                Landing Pages ({landingPageAssets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vsl" className="space-y-4">
              {vslAssets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No VSL scripts generated yet
                  </CardContent>
                </Card>
              ) : (
                vslAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>VSL Script</CardTitle>
                          <CardDescription>
                            Generated on {new Date(asset.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(asset.content, `vsl-${asset.id}.txt`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                        <Streamdown>{asset.content}</Streamdown>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="ads" className="space-y-4">
              {adsAssets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No ad scripts generated yet
                  </CardContent>
                </Card>
              ) : (
                adsAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>5 Ad Scripts</CardTitle>
                          <CardDescription>
                            Generated on {new Date(asset.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(asset.content, `ads-${asset.id}.txt`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                        <Streamdown>{asset.content}</Streamdown>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="landing" className="space-y-4">
              {landingPageAssets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No landing pages generated yet
                  </CardContent>
                </Card>
              ) : (
                landingPageAssets.map((asset) => (
                  <Card key={asset.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Landing Page HTML</CardTitle>
                          <CardDescription>
                            Generated on {new Date(asset.createdAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(asset.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit with GrapesJS
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(asset.content, `landing-page-${asset.id}.html`)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <iframe
                          srcDoc={asset.content}
                          className="w-full h-96 border rounded"
                          title="Landing Page Preview"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
