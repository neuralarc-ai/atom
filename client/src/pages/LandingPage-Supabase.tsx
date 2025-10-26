import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Target, Users, BarChart3, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import AnimatedParticles from "@/components/AnimatedParticles";
import { signIn } from "@/lib/supabase";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await signIn(email, password);
      
      if (response.success && response.user) {
        toast.success(`Welcome to Atom, ${response.user.email}!`);
        // Store authentication state
        localStorage.setItem("atom_admin_token", "authenticated");
        setTimeout(() => {
          setLocation("/admin");
        }, 500);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Invalid credentials. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF6347] to-[#FF8C69] rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-[#1B5E20]">Atom</CardTitle>
            <CardDescription className="text-base">
              Neural Arc Internal Portal - Supabase Auth
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-[#A8D5BA] focus:border-[#1B5E20]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-[#A8D5BA] focus:border-[#1B5E20]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF6347] to-[#FF8C69] hover:from-[#FF4500] hover:to-[#FF6347] text-white font-semibold py-6"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In with Supabase"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowLogin(false)}
              >
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ... rest of the landing page remains the same ...
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] relative overflow-hidden">
      {/* Animated Particles Background */}
      <AnimatedParticles />
      
      {/* Rest of landing page content... */}
      <div className="relative z-10">
        {/* Header and content */}
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#FF6347] to-[#FF8C69] rounded-3xl flex items-center justify-center shadow-2xl">
                <Brain className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-bold mb-4 text-[#1B5E20]">
              Atom
            </h1>
            <p className="text-xl text-gray-700 mb-2 font-semibold">
              by Neural Arc
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Internal Talent Assessment & Evaluation Platform
            </p>
          </div>

          {/* Admin Login Button */}
          <div className="text-center mb-16">
            <Card className="max-w-2xl mx-auto shadow-xl border-2 border-[#FF6347]">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">
                  Internal Use Only
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  This platform is exclusively for Neural Arc's internal talent assessment and recruitment processes.
                </p>
                <Button
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-[#FF6347] to-[#FF8C69] hover:from-[#FF4500] hover:to-[#FF6347] text-white font-semibold px-8 py-6 text-lg shadow-lg"
                >
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

