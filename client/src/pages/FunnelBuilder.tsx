import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast as showToast } from 'sonner';

export default function FunnelBuilder() {
  const [, setLocation] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentFunnelId, setCurrentFunnelId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autosaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMutation = trpc.funnels.generate.useMutation();
  const createMutation = trpc.funnels.create.useMutation();
  const updateMutation = trpc.funnels.update.useMutation();
  const editWithAIMutation = trpc.funnels.editWithAI.useMutation();

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'GENERATE_FUNNEL') {
        const { mechanism, colorScheme, pageType } = event.data.payload;
        
        try {
          const result = await generateMutation.mutateAsync({
            mechanism,
            colorScheme,
            pageType,
          });

          // Send result back to iframe
          iframeRef.current?.contentWindow?.postMessage({
            type: 'GENERATION_COMPLETE',
            payload: result,
          }, '*');
        } catch (error) {
          iframeRef.current?.contentWindow?.postMessage({
            type: 'GENERATION_ERROR',
            payload: { error: 'Failed to generate funnel' },
          }, '*');
        }
      } else if (event.data.type === 'SAVE_FUNNEL') {
        await handleSave(event.data.payload);
      } else if (event.data.type === 'AUTOSAVE_DATA') {
        // Autosave triggered from iframe
        await handleAutosave(event.data.payload);
      } else if (event.data.type === 'AI_EDIT_REQUEST') {
        await handleAIEdit(event.data.payload);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [generateMutation]);

  // Setup autosave interval
  useEffect(() => {
    autosaveIntervalRef.current = setInterval(() => {
      // Request current state from iframe
      iframeRef.current?.contentWindow?.postMessage({
        type: 'REQUEST_AUTOSAVE',
      }, '*');
    }, 30000); // 30 seconds

    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({
          type: 'TRIGGER_SAVE',
        }, '*');
      }
      // Cmd/Ctrl + Z to undo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({
          type: 'TRIGGER_UNDO',
        }, '*');
      }
      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y to redo
      else if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || 
               ((e.metaKey || e.ctrlKey) && e.key === 'y')) {
        e.preventDefault();
        iframeRef.current?.contentWindow?.postMessage({
          type: 'TRIGGER_REDO',
        }, '*');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSave = async (data: { name: string; mechanism: string; colorScheme: string; landingHtml: string; thankyouHtml: string }) => {
    setIsSaving(true);
    try {
      if (currentFunnelId) {
        await updateMutation.mutateAsync({
          id: currentFunnelId,
          name: data.name,
          landingHtml: data.landingHtml,
          thankyouHtml: data.thankyouHtml,
        });
        showToast.success('Funnel saved successfully');
      } else {
        const result = await createMutation.mutateAsync({
          name: data.name,
          mechanism: data.mechanism,
          colorScheme: data.colorScheme,
          landingHtml: data.landingHtml,
          thankyouHtml: data.thankyouHtml,
        });
        setCurrentFunnelId(result.id);
        showToast.success('Funnel created successfully');
      }
      setLastSaved(new Date());
    } catch (error) {
      showToast.error('Failed to save funnel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutosave = async (data: { landingHtml: string; thankyouHtml: string }) => {
    if (!currentFunnelId) return;

    try {
      await updateMutation.mutateAsync({
        id: currentFunnelId,
        landingHtml: data.landingHtml,
        thankyouHtml: data.thankyouHtml,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  };

  const handleAIEdit = async (data: { instruction: string; currentHtml: string; context?: string }) => {
    try {
      const result = await editWithAIMutation.mutateAsync({
        currentHtml: data.currentHtml,
        instruction: data.instruction,
        context: data.context,
      });

      // Send modified HTML back to iframe
      iframeRef.current?.contentWindow?.postMessage({
        type: 'AI_EDIT_COMPLETE',
        payload: { modifiedHtml: result.modifiedHtml },
      }, '*');
      
      showToast.success('AI edit applied successfully');
    } catch (error) {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'AI_EDIT_ERROR',
        payload: { error: 'Failed to apply AI edit' },
      }, '*');
      showToast.error('AI edit failed');
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="h-14 bg-[#111111] border-b border-[#222222] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/admin')}
            className="text-white hover:bg-[#222222]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-[#222222]" />
          <span className="text-sm text-gray-400">
            {lastSaved ? `Last saved ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            iframeRef.current?.contentWindow?.postMessage({
              type: 'TRIGGER_SAVE',
            }, '*');
          }}
          disabled={isSaving}
          className="bg-violet-600 hover:bg-violet-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>
      </div>

      {/* Funnel Builder Iframe */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src="/funnel-builder-integrated.html"
          className="w-full h-full border-none"
          title="Funnel Builder"
        />
      </div>
    </div>
  );
}
