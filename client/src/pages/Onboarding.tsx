import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Play, ExternalLink, ArrowRight } from "lucide-react";
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
      "Choose the plan that fits your needs (we recommend the $297/mo plan)",
      "Complete the account setup wizard",
      "Once done, share your login details with us via the intake form or email",
    ],
    hasAlternate: true,
    alternateTitle: "Already have your own GHL Agency account?",
    alternateKey: "agency_admin",
    alternateDescription:
      "If you already have a GHL Agency account, you just need to add us as an agency admin so we can access your account and set everything up for you.",
    alternateVideoId: "aW9JSF80-os",
    alternateVideoStart: 0,
    alternateInstructions: [
      "Log into your GoHighLevel Agency account",
      "Go to Settings → Team → Add Employee",
      "Enter our email address and set the role to Agency Admin",
      "Click Save — we'll get an invite and can start working immediately",
    ],
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
    subtitle: "Add us as an admin to your Facebook Business Manager",
    description:
      "We need admin access to your Facebook Business Manager to set up your ad campaigns, tracking pixels, and CAPI integration. Watch this quick tutorial to add us.",
    videoId: "KDEKN5DcA30",
    videoStart: 0,
    instructions: [
      "Go to business.facebook.com → Settings",
      "Click 'People' in the left sidebar",
      "Click 'Add People' and enter our email address",
      "Set the role to 'Admin' and click 'Send Invite'",
    ],
    hasAlternate: false,
  },
];

export default function Onboarding() {
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId || "0");
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [showAlternate, setShowAlternate] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  // Fetch onboarding progress
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
      setShowAlternate(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowAlternate(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const allComplete = ONBOARDING_STEPS.every(
    (s) => completedSteps[s.key] || (s.key === "ghl_setup" && completedSteps["agency_admin"])
  );
  const completedCount = ONBOARDING_STEPS.filter(
    (s) => completedSteps[s.key] || (s.key === "ghl_setup" && completedSteps["agency_admin"])
  ).length;

  const isCurrentStepComplete =
    completedSteps[step.key] || (step.hasAlternate && completedSteps[step.alternateKey!]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Progress Header */}
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-white">Getting Started</h1>
            <span className="text-sm text-slate-400">
              {completedCount} of {ONBOARDING_STEPS.length} steps complete
            </span>
          </div>

          {/* Step indicators */}
          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((s, i) => {
              const done = completedSteps[s.key] || (s.hasAlternate && completedSteps[s.alternateKey!]);
              return (
                <button
                  key={s.key}
                  onClick={() => {
                    setCurrentStep(i);
                    setShowAlternate(false);
                  }}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    done
                      ? "bg-green-500"
                      : i === currentStep
                      ? "bg-violet-500"
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
            const done = completedSteps[s.key] || (s.hasAlternate && completedSteps[s.alternateKey!]);
            return (
              <button
                key={s.key}
                onClick={() => {
                  setCurrentStep(i);
                  setShowAlternate(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  i === currentStep
                    ? "bg-violet-600 text-white"
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
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-slate-400 text-lg">{step.subtitle}</p>
          </div>

          {/* Alternate toggle (for GHL step) */}
          {step.hasAlternate && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowAlternate(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  !showAlternate
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
                }`}
              >
                I need to set up GHL
              </button>
              <button
                onClick={() => setShowAlternate(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showAlternate
                    ? "bg-violet-600 text-white"
                    : "bg-white/5 text-slate-400 border border-white/10 hover:border-white/20"
                }`}
              >
                I already have a GHL Agency account
              </button>
            </div>
          )}

          {/* Description */}
          <p className="text-slate-300 leading-relaxed">
            {showAlternate && step.hasAlternate ? step.alternateDescription : step.description}
          </p>

          {/* Video Embed */}
          <Card className="bg-black border-white/10 overflow-hidden">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${
                  showAlternate && step.hasAlternate ? step.alternateVideoId : step.videoId
                }?start=${
                  showAlternate && step.hasAlternate ? step.alternateVideoStart : step.videoStart
                }&rel=0&modestbranding=1`}
                title={showAlternate && step.hasAlternate ? step.alternateTitle : step.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Card>

          {/* Instructions */}
          <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-violet-400" />
              Quick Steps
            </h3>
            <ol className="space-y-3">
              {(showAlternate && step.hasAlternate
                ? step.alternateInstructions!
                : step.instructions
              ).map((instruction, i) => (
                <li key={i} className="flex gap-3 text-slate-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center text-xs font-semibold">
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

            <div className="flex items-center gap-3">
              <Button
                onClick={() =>
                  handleToggleComplete(
                    showAlternate && step.hasAlternate ? step.alternateKey! : step.key
                  )
                }
                variant={isCurrentStepComplete ? "outline" : "default"}
                className={
                  isCurrentStepComplete
                    ? "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                    : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
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

            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
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
          {allComplete && (
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
