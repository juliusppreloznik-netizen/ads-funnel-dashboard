import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";

export default function IntakeForm() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    ghlEmail: "",
    ghlPassword: "",
    driveLink: "",
  });

  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Your information has been submitted successfully!");
      setLocation("/thank-you");
    },
    onError: (error) => {
      toast.error("Failed to submit form: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.businessName) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="absolute top-6 left-6">
        <Logo />
      </div>
      <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Client Intake Form</CardTitle>
          <CardDescription className="text-center text-base">
            Please provide your information to get started with your marketing assets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Your Business LLC"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ghlEmail">GoHighLevel Email</Label>
              <Input
                id="ghlEmail"
                name="ghlEmail"
                type="email"
                placeholder="ghl@example.com"
                value={formData.ghlEmail}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ghlPassword">GoHighLevel Password</Label>
              <Input
                id="ghlPassword"
                name="ghlPassword"
                type="password"
                placeholder="••••••••"
                value={formData.ghlPassword}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driveLink">Google Drive Link for Funding Results</Label>
              <Input
                id="driveLink"
                name="driveLink"
                type="url"
                placeholder="https://drive.google.com/..."
                value={formData.driveLink}
                onChange={handleChange}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createClient.isPending}
            >
              {createClient.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
