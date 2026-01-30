import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Loader2, Sparkles, Download, Upload, MessageSquare, X } from 'lucide-react';
import { toast } from 'sonner';

const COLOR_PRESETS = [
  { name: 'Emerald', value: 'emerald', color: '#10B981' },
  { name: 'Blue', value: 'blue', color: '#3B82F6' },
  { name: 'Violet', value: 'violet', color: '#8B5CF6' },
  { name: 'Amber', value: 'amber', color: '#F59E0B' },
  { name: 'Coral', value: 'coral', color: '#F97316' },
  { name: 'Cyan', value: 'cyan', color: '#06B6D4' },
];

export default function FunnelBuilderV2() {
  const [currentHtml, setCurrentHtml] = useState<string>('');
  const [mechanism, setMechanism] = useState('');
  const [colorScheme, setColorScheme] = useState<'emerald' | 'blue' | 'violet' | 'amber' | 'coral' | 'cyan'>('emerald');
  const [pageType, setPageType] = useState<'landing' | 'thankyou' | 'both'>('landing');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [aiInput, setAiInput] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateMutation = trpc.funnels.generate.useMutation({
    onSuccess: (data) => {
      setCurrentHtml(data.landingHtml);
      setShowGenerateDialog(false);
      toast.success('Funnel generated successfully!');
      // Load into preview
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(data.landingHtml);
          doc.close();
        }
      }
    },
    onError: (error) => {
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  const editWithAIMutation = trpc.funnels.editWithAI.useMutation({
    onSuccess: (data) => {
      setCurrentHtml(data.modifiedHtml);
      // Reload preview
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(data.modifiedHtml);
          doc.close();
        }
      }
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Changes applied successfully!' }]);
    },
    onError: (error) => {
      setAiMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    },
  });

  const handleGenerate = () => {
    if (!mechanism.trim()) {
      toast.error('Please enter a unique mechanism');
      return;
    }
    generateMutation.mutate({ mechanism, colorScheme, pageType });
  };

  const handleLoadHtml = (html: string) => {
    setCurrentHtml(html);
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
    setShowLoadDialog(false);
    toast.success('HTML loaded successfully!');
  };

  const handleExportHtml = () => {
    if (!currentHtml) {
      toast.error('No funnel to export');
      return;
    }
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `funnel-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Funnel exported!');
  };

  const handleAISend = () => {
    if (!aiInput.trim() || !currentHtml) return;
    
    const userMessage = aiInput;
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiInput('');
    
    editWithAIMutation.mutate({
      currentHtml,
      instruction: userMessage,
      context: '',
    });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">Funnel Builder</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Funnel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate New Funnel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="mechanism">Unique Mechanism</Label>
                  <Input
                    id="mechanism"
                    placeholder="e.g., The Bureau Attack Method"
                    value={mechanism}
                    onChange={(e) => setMechanism(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setColorScheme(preset.value as typeof colorScheme)}
                        className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all ${
                          colorScheme === preset.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-sm">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Page Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['landing', 'thankyou', 'both'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setPageType(type)}
                        className={`p-2 rounded-lg border-2 transition-all capitalize ${
                          pageType === type
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating... (30-60s)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Load HTML
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Load Existing HTML</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Paste your HTML code here..."
                  className="min-h-[300px] font-mono text-sm"
                  onChange={(e) => {
                    const html = e.target.value;
                    if (html.trim()) {
                      handleLoadHtml(html);
                    }
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={handleExportHtml}
            disabled={!currentHtml}
          >
            <Download className="w-4 h-4 mr-2" />
            Export HTML
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowAIChat(!showAIChat)}
            disabled={!currentHtml}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 pt-14 flex">
        {/* Left Sidebar - Elements (placeholder for now) */}
        <div className="w-64 bg-card border-r border-border p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">Elements</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Element library coming soon...</p>
            <p className="text-xs">Use "Generate Funnel" to create a complete funnel, then use AI Assistant to make changes.</p>
          </div>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 bg-muted/20 p-4">
          <Card className="h-full overflow-hidden">
            {currentHtml ? (
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Funnel Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center space-y-4">
                  <Sparkles className="w-16 h-16 mx-auto opacity-20" />
                  <div>
                    <p className="text-lg font-medium">No funnel loaded</p>
                    <p className="text-sm">Click "Generate Funnel" to create a new funnel</p>
                    <p className="text-sm">or "Load HTML" to import an existing one</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar - Settings/AI Chat */}
        <div className="w-80 bg-card border-l border-border">
          {showAIChat && currentHtml ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">AI Assistant</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAIChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {aiMessages.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Ask me to make changes to your funnel!</p>
                    <p className="text-xs mt-2">Example: "Change the hero headline to be more aggressive"</p>
                  </div>
                ) : (
                  aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-4'
                          : 'bg-muted mr-4'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Describe your changes..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAISend();
                      }
                    }}
                    disabled={editWithAIMutation.isPending}
                  />
                  <Button
                    onClick={handleAISend}
                    disabled={!aiInput.trim() || editWithAIMutation.isPending}
                  >
                    {editWithAIMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="general" className="h-full">
              <div className="p-4 border-b border-border">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="styles">Styles</TabsTrigger>
                  <TabsTrigger value="animations">Animations</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="general" className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Settings panel coming soon...
                </p>
                <p className="text-xs text-muted-foreground">
                  Use AI Assistant to make changes to your funnel for now.
                </p>
              </TabsContent>
              <TabsContent value="styles" className="p-4">
                <p className="text-sm text-muted-foreground">
                  Style controls coming soon...
                </p>
              </TabsContent>
              <TabsContent value="animations" className="p-4">
                <p className="text-sm text-muted-foreground">
                  Animation controls coming soon...
                </p>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
