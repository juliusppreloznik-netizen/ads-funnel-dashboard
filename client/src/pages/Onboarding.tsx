import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Play, ExternalLink, ArrowRight, Mail } from "lucide-react";
import { useLocation, useParams } from "wouter";

// Onboarding step definitions with YouTube video embeds
const ONBOARDING_STEPS = [
  {
    key: "ghl_setup",
    title: "Set Up Your GoHighLevel Account",
    subtitle: "Create your GHL account so we can build your funnels and automations",
    description:
      "If you don't already have a GoHighLevel account, watch this video to get set up. This is the platform we'll use to build your funnels, automations, and manage your leads.",
    videoId: "YmYNiMH8uQQ",
    videoStart: 0,
    instructions: [
      "Go to GoHighLevel.com and sign up for an account",
      "Choose the $97/mo plan",
      "Complete the account setup wizard",
      "Once your account is created, mark this step as done and move to the next step",
    ],
    hasAlternate: false,
  },
  {
    key: "agency_admin",
    title: "Add Us as Agency Admin",
    subtitle: "Give our team access to your GHL account so we can set everything up",
    description:
      "Now that your GHL account is ready, you need to add us as an agency admin. This lets our team access your account to build your funnels, automations, and workflows. Watch the video below and follow the quick steps.",
    videoId: "m3MOW1xstbg",
    videoStart: 0,
    noEmbed: true,
    instructions: [
      "Log into your GoHighLevel account",
      "Go to Settings → My Staff (or Team)",
      "Click 'Add Employee'",
      "Enter the email: employee@catalystmarketingco.net",
      "First Name: Catalyst, Last Name: Marketing",
      "Set the role to Admin and click Save",
      "We'll receive the invite and start working on your account right away",
    ],
    extraInfo: {
      email: "employee@catalystmarketingco.net",
      name: "Catalyst Marketing",
    },
    hasAlternate: false,
  },
  {
    key: "domain_setup",
    title: "Set Up Your Domain",
    subtitle: "Buy, transfer, or connect a domain for your funnels",
    description:
      "Your funnels need a custom domain to look professional and build trust. Watch this video to learn how to buy a new domain, transfer an existing one, or connect one you already own inside GoHighLevel.",
    videoId: "L7COia29_Cs",
    videoStart: 0,
    instructions: [
      "Inside GHL, go to Settings → Domains",
      "Choose one: Buy a new domain, Transfer an existing domain, or Connect a domain you own",
      "Follow the steps in the video to complete DNS setup",
      "Once connected, let us know so we can assign it to your funnel",
    ],
    hasAlternate: false,
  },
  {
    key: "phone_number",
    title: "Purchase a Phone Number",
    subtitle: "Get a dedicated phone number for SMS and calls",
    description:
      "A dedicated phone number lets you send and receive texts and calls through your GHL account. This is essential for follow-up automations and lead nurturing.",
    videoId: "t1wPfy7PTRw",
    videoStart: 0,
    instructions: [
      "Inside GHL, go to Settings → Phone Numbers",
      "Click 'Add Number' or 'Buy Number'",
      "Choose a local or toll-free number in your area code",
      "Complete the purchase and verify the number is active",
    ],
    hasAlternate: false,
  },
  {
    key: "facebook_admin",
    title: "Give Us Facebook Business Access",
    subtitle: "Add us as a user in your Meta Business Manager",
    description:
      "We need access to your Meta Business Manager to set up your ad campaigns, tracking pixels, and CAPI integration. Watch this quick tutorial to learn how to add users to your account.",
    videoId: "r9bwiFVUezE",
    videoStart: 0,
    instructions: [
      "Go to business.facebook.com and log in",
      "Click the gear icon (Settings) in the bottom left",
      "In the left menu, click 'People' under Users",
      "Click 'Invite People' (or 'Add People') in the top right",
      "Enter our emails: duffyjamir@gmail.com and Sharifcmt182@gmail.com",
      "Toggle on Full Access (give full access to all assets)",
      "Click 'Next', then assign all relevant assets (Ad Account, Pages, etc.)",
      "Click 'Send Invite' — we'll accept and get started",
    ],
    extraInfo: {
      email: "duffyjamir@gmail.com",
      email2: "Sharifcmt182@gmail.com",
      name: "Catalyst Marketing",
      note: "Give full access",
    },
    hasAlternate: false,
  },
];

type OnboardingStep = typeof ONBOARDING_STEPS[number];

export default function Onboarding() {
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId || "0");
  const isGuideMode = clientId === 0; // No client ID = view-only guide mode
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Fetch onboarding progress (only when linked to a client)
  const { data: progress, refetch: refetchProgress } = trpc.onboarding.getProgress.useQuery(
    { clientId },
    { enabled: clientId > 0 }
  );

  // Sync progress to local state
  useEffect(() => {
    if (progress) {
      const completed: Record<string, boolean> = {};
      progress.forEach((step) => {
        completed[step.stepKey] = step.completed;
      });
      setCompletedSteps(completed);
    }
  }, [progress]);

  const markCompleteMutation = trpc.onboarding.markComplete.useMutation({
    onSuccess: () => {
      refetchProgress();
    },
  });

  const markIncompleteMutation = trpc.onboarding.markIncomplete.useMutation({
    onSuccess: () => {
      refetchProgress();
    },
  });

  const handleToggleComplete = (stepKey: string) => {
    if (isGuideMode) return; // No tracking in guide mode
    if (completedSteps[stepKey]) {
      setCompletedSteps((prev) => ({ ...prev, [stepKey]: false }));
      markIncompleteMutation.mutate({ clientId, stepKey });
    } else {
      setCompletedSteps((prev) => ({ ...prev, [stepKey]: true }));
      markCompleteMutation.mutate({ clientId, stepKey });
      toast.success("Step completed!");
    }
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const allComplete = ONBOARDING_STEPS.every((s) => completedSteps[s.key]);
  const completedCount = ONBOARDING_STEPS.filter((s) => completedSteps[s.key]).length;
  const isCurrentStepComplete = completedSteps[step.key];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black">
      {/* Progress Header */}
      <div className="border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-white">{isGuideMode ? "Setup Guide" : "Getting Started"}</h1>
            {!isGuideMode && (
              <span className="text-sm text-slate-400">
                {completedCount} of {ONBOARDING_STEPS.length} steps complete
              </span>
            )}
            {isGuideMode && (
              <span className="text-sm text-slate-400">
                {ONBOARDING_STEPS.length} steps
              </span>
            )}
          </div>

          {/* Step indicators */}
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((s, i) => {
              const done = completedSteps[s.key];
              return (
                <button
                  key={s.key}
                  onClick={() => setCurrentStep(i)}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    done
                      ? "bg-green-500"
                      : i === currentStep
                      ? "bg-white"
                      : "bg-white/10"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Navigation Pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {ONBOARDING_STEPS.map((s, i) => {
            const done = completedSteps[s.key];
            return (
              <button
                key={s.key}
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  i === currentStep
                    ? "bg-white text-black"
                    : done
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                )}
                Step {i + 1}
              </button>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="space-y-6">
          {/* Step Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-slate-400 text-lg">{step.subtitle}</p>
          </div>

          {/* Description */}
          <p className="text-slate-300 leading-relaxed">{step.description}</p>

          {/* Extra Info Card (Agency Admin + Facebook) */}
          {"extraInfo" in step && (step as any).extraInfo && (
            <Card className="bg-white/[0.06] border-white/15 p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Details to Enter</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">
                      <span className="text-slate-400">{(step as any).extraInfo.email2 ? "Email 1:" : "Email:"}</span>{" "}
                      <span className="text-white font-mono select-all">
                        {(step as any).extraInfo.email}
                      </span>
                    </p>
                    {(step as any).extraInfo.email2 && (
                      <p className="text-slate-300">
                        <span className="text-slate-400">Email 2:</span>{" "}
                        <span className="text-white font-mono select-all">
                          {(step as any).extraInfo.email2}
                        </span>
                      </p>
                    )}
                    <p className="text-slate-300">
                      <span className="text-slate-400">Name:</span>{" "}
                      <span className="text-white font-mono select-all">
                        {(step as any).extraInfo.name}
                      </span>
                    </p>
                    {(step as any).extraInfo.note && (
                      <p className="text-slate-300">
                        <span className="text-slate-400">Access Level:</span>{" "}
                        <span className="text-green-400 font-semibold">
                          {(step as any).extraInfo.note}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Video Embed */}
          <Card className="bg-black border-white/10 overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {step.noEmbed ? (
                <a
                  href={`https://www.youtube.com/watch?v=${step.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 w-full h-full group"
                >
                  <img
                    src={`https://img.youtube.com/vi/${step.videoId}/maxresdefault.jpg`}
                    alt={step.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${step.videoId}/hqdefault.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-8 w-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Watch on YouTube
                  </div>
                </a>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${step.videoId}?start=${step.videoStart}&rel=0&modestbranding=1`}
                  title={step.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="bg-white/[0.04] border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-white/60" />
              Quick Steps
            </h3>
            <ol className="space-y-3">
              {step.instructions.map((instruction, i) => (
                <li key={i} className="flex gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white/60 flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Mark Complete / Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={handlePrev}
              disabled={currentStep === 0}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {!isGuideMode && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleToggleComplete(step.key)}
                  variant={isCurrentStepComplete ? "outline" : "default"}
                  className={
                    isCurrentStepComplete
                      ? "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                      : "bg-white text-black hover:bg-white/90"
                  }
                >
                  {isCurrentStepComplete ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark as Done
                    </>
                  )}
                </Button>
              </div>
            )}

            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-white text-black hover:bg-white/90"
              >
                Next Step
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setLocation("/client-login")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                Go to Client Portal
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>

          {/* All Complete Banner */}
          {allComplete && !isGuideMode && (
            <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30 p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">You're All Set!</h3>
              <p className="text-slate-300 mb-4">
                All onboarding steps are complete. Our team will start building your marketing
                assets right away. You can track progress in your client portal.
              </p>
              <Button
                onClick={() => setLocation("/client-login")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Access Client Portal
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
