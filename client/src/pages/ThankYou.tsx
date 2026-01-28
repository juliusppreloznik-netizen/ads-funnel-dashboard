import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-base">
            Your marketing assets will be generated shortly. Our team will review your submission and begin creating your personalized VSL script, ad campaigns, and landing page.
          </p>
          <p className="text-muted-foreground text-sm">
            We'll reach out to you via email once your assets are ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
