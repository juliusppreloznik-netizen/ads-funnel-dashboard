import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function IntakeForm() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    ghlEmail: "",
    ghlPassword: "",
    driveLink: "",
    password: "",
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Submission successful!");
      setLocation("/thank-you");
    },
    onError: (error: any) => {
      toast.error("Submission failed: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.businessName || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    createClient.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
      {/* Logo - Clickable to admin */}
      <a
        href="/admin"
        className="fixed top-6 left-6 transition-opacity hover:opacity-80"
      >
        <img src="/catalyst-logo.png" alt="Catalyst Marketing" className="h-12 w-auto" />
      </a>

      {/* Main Form Card */}
      <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Client Intake Form
            </h1>
            <p className="text-slate-400 text-lg">
              Let's get started with your marketing assets
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-sm font-medium">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-white text-sm font-medium">
                Business Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Your Business LLC"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ghlEmail" className="text-white text-sm font-medium">
                  GoHighLevel Email
                </Label>
                <Input
                  id="ghlEmail"
                  name="ghlEmail"
                  value={formData.ghlEmail}
                  onChange={handleChange}
                  placeholder="ghl@example.com"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ghlPassword" className="text-white text-sm font-medium">
                  GoHighLevel Password
                </Label>
                <Input
                  id="ghlPassword"
                  name="ghlPassword"
                  type="password"
                  value={formData.ghlPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driveLink" className="text-white text-sm font-medium">
                Google Drive Link
              </Label>
              <Input
                id="driveLink"
                name="driveLink"
                value={formData.driveLink}
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
              <p className="text-xs text-slate-500">
                Share your funding results or relevant documents
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Create Portal Password <span className="text-red-400">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
                required
              />
              <p className="text-xs text-slate-500">
                This password will be used to access your client portal
              </p>
            </div>

            <Button
              type="submit"
              disabled={createClient.isPending}
              size="lg"
              className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 text-lg font-semibold mt-8"
            >
              {createClient.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            Your information is secure and will only be used for asset generation
          </p>
        </div>
      </Card>
    </div>
  );
}
