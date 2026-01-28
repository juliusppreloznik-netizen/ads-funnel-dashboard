import { useEffect, useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

export default function HTMLEditor() {
  const { assetId } = useParams<{ assetId: string }>();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<any>(null);
  const [ghlSurveyEmbed, setGhlSurveyEmbed] = useState("");
  const [ghlCalendarEmbed, setGhlCalendarEmbed] = useState("");
  const [ctaButtonLink, setCtaButtonLink] = useState("");

  const { data: asset, isLoading: assetLoading } = trpc.assets.getById.useQuery(
    { id: parseInt(assetId || "0") },
    { enabled: !!user && !!assetId }
  );

  const updateAsset = trpc.assets.update.useMutation({
    onSuccess: () => {
      toast.success("Changes saved successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to save: " + error.message);
    },
  });

  // Initialize GrapesJS editor
  useEffect(() => {
    if (!editorRef.current || !asset || editor) return;

    const gjs = grapesjs.init({
      container: editorRef.current,
      height: "600px",
      width: "auto",
      storageManager: false,
      panels: { defaults: [] },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px" },
          { name: "Mobile", width: "375px" },
        ],
      },
      canvas: {
        styles: [],
        scripts: [],
      },
    });

    gjs.setComponents(asset.content);

    // Add panels
    gjs.Panels.addPanel({
      id: "basic-actions",
      el: ".panel__basic-actions",
      buttons: [
        {
          id: "visibility",
          active: true,
          className: "btn-toggle-borders",
          label: '<i class="fa fa-clone"></i>',
          command: "sw-visibility",
        },
        {
          id: "export",
          className: "btn-open-export",
          label: '<i class="fa fa-code"></i>',
          command: "export-template",
        },
      ],
    });

    gjs.Panels.addPanel({
      id: "devices-c",
      el: ".panel__devices",
      buttons: [
        {
          id: "desktop",
          command: "set-device-desktop",
          active: true,
          label: '<i class="fa fa-desktop"></i>',
        },
        {
          id: "tablet",
          command: "set-device-tablet",
          label: '<i class="fa fa-tablet"></i>',
        },
        {
          id: "mobile",
          command: "set-device-mobile",
          label: '<i class="fa fa-mobile"></i>',
        },
      ],
    });

    setEditor(gjs);

    return () => {
      gjs.destroy();
    };
  }, [asset, editorRef.current]);

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

  const handleSave = () => {
    if (!editor || !assetId) return;

    let html = editor.getHtml();
    const css = editor.getCss();
    
    // Inject CSS into HTML
    if (css) {
      html = html.replace("</head>", `<style>${css}</style></head>`);
    }

    // Inject GHL embeds if provided
    if (ghlSurveyEmbed) {
      html = html.replace("</body>", `${ghlSurveyEmbed}</body>`);
    }
    if (ghlCalendarEmbed) {
      html = html.replace("</body>", `${ghlCalendarEmbed}</body>`);
    }

    // Update CTA button links if provided
    if (ctaButtonLink) {
      html = html.replace(/href="#"/g, `href="${ctaButtonLink}"`);
    }

    updateAsset.mutate({
      id: parseInt(assetId),
      content: html,
    });
  };

  if (assetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setLocation("/admin")}
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={handleSave} disabled={updateAsset.isPending}>
            {updateAsset.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">HTML Editor</CardTitle>
            <CardDescription>
              Edit your landing page with GrapesJS visual editor
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="panel__basic-actions p-2 border-b flex gap-2"></div>
                <div className="panel__devices p-2 border-b flex gap-2"></div>
                <div ref={editorRef}></div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>GHL Embeds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="survey">Survey Embed Code</Label>
                  <Textarea
                    id="survey"
                    placeholder="<script>...</script>"
                    value={ghlSurveyEmbed}
                    onChange={(e) => setGhlSurveyEmbed(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calendar">Calendar Embed Code</Label>
                  <Textarea
                    id="calendar"
                    placeholder="<script>...</script>"
                    value={ghlCalendarEmbed}
                    onChange={(e) => setGhlCalendarEmbed(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta">CTA Button Link</Label>
                  <Input
                    id="cta"
                    type="url"
                    placeholder="https://example.com"
                    value={ctaButtonLink}
                    onChange={(e) => setCtaButtonLink(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
