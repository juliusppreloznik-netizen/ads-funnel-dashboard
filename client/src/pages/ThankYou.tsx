import { CheckCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Thank You!</CardTitle>
          <CardDescription className="text-lg">
            Your information has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-base">
            Your marketing assets will be generated shortly. Our team will review your submission and begin creating your personalized VSL script, ad campaigns, and landing page.
          </p>
          <div className="border-t pt-6">
            <p className="text-muted-foreground text-sm mb-4">
              Track your project progress in real-time through your client portal:
            </p>
            <Button
              onClick={() => window.location.href = '/client-login'}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Access Client Portal
            </Button>
            <p className="text-muted-foreground text-xs mt-4">
              Use the email and password you provided in the form to log in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
