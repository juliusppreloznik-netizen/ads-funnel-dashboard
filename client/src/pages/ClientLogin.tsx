import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock } from "lucide-react";
import { useLocation } from "wouter";

export default function ClientLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/client-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        setLocation("/client-portal");
      } else {
        toast.error(data.error || "Invalid email or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black flex items-center justify-center p-6">
      {/* Logo */}
      <a
        href="/"
        className="fixed top-6 left-6 transition-opacity hover:opacity-80"
      >
        <img src="/catalyst-logo.png" alt="Catalyst Marketing" className="h-12 w-auto" />
      </a>

      {/* Login Card */}
      <Card className="w-full max-w-md bg-white/[0.04] border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white mb-4">
              <Lock className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Client Portal
            </h1>
            <p className="text-slate-400">
              Login to view your project progress
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30 focus:ring-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30 focus:ring-white/10"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full h-12 bg-white hover:bg-white/90 text-black border-0 font-semibold mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Forgot your password? Contact support for assistance.
          </p>
        </div>
      </Card>
    </div>
  );
}
