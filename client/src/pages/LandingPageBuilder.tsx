import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect, useRef } from "react";

type Step = "input" | "generating" | "editor";

export default function LandingPageBuilder() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("input");
  
  // Input form state
  const [businessName, setBusinessName] = useState("");
  const [uniqueMechanism, setUniqueMechanism] = useState("");
  const [hexColor, setHexColor] = useState("#ED6D05");
  
  // Generated HTML state
  const [generatedHTML, setGeneratedHTML] = useState("");
  
  // GrapesJS editor ref
  const editorRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const generateLandingPage = trpc.generation.generateLandingPageStandalone.useMutation({
    onSuccess: (data) => {
      setGeneratedHTML(data.html);
      setStep("editor");
      toast.success("Landing page generated! Now you can edit it.");
    },
    onError: (error: any) => {
      toast.error("Failed to generate: " + error.message);
      setStep("input");
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = getLoginUrl();
    }
  }, [user, authLoading]);

  // Initialize GrapesJS when entering editor step
  useEffect(() => {
    if (step === "editor" && generatedHTML && editorContainerRef.current && !editorRef.current) {
      // @ts-ignore - GrapesJS is loaded via CDN
      if (typeof grapesjs !== "undefined") {
        // @ts-ignore
        editorRef.current = grapesjs.init({
          container: editorContainerRef.current,
          height: "100vh",
          width: "100%",
          storageManager: false,
          panels: { defaults: [] },
          deviceManager: {
            devices: [
              { name: "Desktop", width: "" },
              { name: "Tablet", width: "768px", widthMedia: "992px" },
              { name: "Mobile", width: "320px", widthMedia: "480px" },
            ],
          },
        });

        editorRef.current.setComponents(generatedHTML);
        editorRef.current.setStyle("");
      } else {
        toast.error("Editor not loaded. Please refresh the page.");
      }
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [step, generatedHTML]);

  const handleGenerate = () => {
    if (!businessName.trim()) {
      toast.error("Please enter a business name");
      return;
    }
    if (!uniqueMechanism.trim()) {
      toast.error("Please enter a unique mechanism");
      return;
    }

    setStep("generating");
    generateLandingPage.mutate({ businessName, uniqueMechanism, hexColor });
  };

  const handleDownload = () => {
    if (!editorRef.current) return;

    const html = editorRef.current.getHtml();
    const css = editorRef.current.getCss();
    
    const fullHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${businessName} - Landing Page</title>
  <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Landing page downloaded!");
  };

  const handleStartOver = () => {
    setStep("input");
    setGeneratedHTML("");
    setBusinessName("");
    setUniqueMechanism("");
    setHexColor("#ED6D05");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Input Step
  if (step === "input") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Landing Page Builder</CardTitle>
              <CardDescription>
                Generate a personalized landing page with AI-powered copy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Acme Construction"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="uniqueMechanism">Unique Mechanism *</Label>
                <Input
                  id="uniqueMechanism"
                  value={uniqueMechanism}
                  onChange={(e) => setUniqueMechanism(e.target.value)}
                  placeholder="e.g., Funding Optimization, Credit Stacking System"
                />
                <p className="text-sm text-muted-foreground">
                  The core promise or method that makes your offer unique
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hexColor">Primary Color</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="hexColor"
                    value={hexColor}
                    onChange={(e) => setHexColor(e.target.value)}
                    placeholder="#ED6D05"
                    className="max-w-xs"
                  />
                  <div
                    className="w-12 h-12 rounded border-2 border-gray-300"
                    style={{ backgroundColor: hexColor }}
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                size="lg"
                className="w-full"
                disabled={generateLandingPage.isPending}
              >
                {generateLandingPage.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Landing Page"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Generating Step
  if (step === "generating") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Generating Your Landing Page</h2>
        <p className="text-muted-foreground">This may take 10-20 seconds...</p>
      </div>
    );
  }

  // Editor Step
  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleStartOver}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start Over
          </Button>
          <div>
            <h1 className="font-bold text-lg">{businessName}</h1>
            <p className="text-sm text-muted-foreground">{uniqueMechanism}</p>
          </div>
        </div>
        <Button onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download HTML
        </Button>
      </div>
      <div ref={editorContainerRef} className="flex-1" />
    </div>
  );
}
