import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Target, Users, BarChart3, Shield, Zap } from "lucide-react";
import { toast } from "sonner";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Custom authentication - only allow specific admin account
    if (username === "at@he2.ai" && password === "neuralarc") {
      // Store auth token
      localStorage.setItem("atom_admin_token", "authenticated");
      localStorage.setItem("atom_admin_user", JSON.stringify({
        email: "at@he2.ai",
        name: "Admin",
        role: "admin"
      }));
      
      toast.success("Welcome to Atom!");
      setTimeout(() => {
        setLocation("/admin");
      }, 500);
    } else {
      toast.error("Invalid credentials. Access denied.");
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
              Neural Arc Internal Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Email</Label>
                <Input
                  id="username"
                  type="email"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="ghost"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9]">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#FF6347] to-[#FF8C69] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform">
              <Brain className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-[#1B5E20] mb-4">
            Atom
          </h1>
          <p className="text-2xl text-[#2E7D32] mb-2">
            by Neural Arc
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Internal Talent Assessment & Evaluation Platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-2 border-[#A8D5BA] hover:border-[#1B5E20] transition-all hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-[#FF6347] to-[#FF8C69] rounded-xl flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-[#1B5E20]">AI-Powered Assessments</CardTitle>
              <CardDescription>
                Generate customized technical tests tailored to specific job roles and complexity levels
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#C4D82E] hover:border-[#1B5E20] transition-all hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-[#1B5E20] to-[#2E7D32] rounded-xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-[#1B5E20]">Candidate Management</CardTitle>
              <CardDescription>
                Track and evaluate candidates with comprehensive scoring and analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-[#A8D5BA] hover:border-[#1B5E20] transition-all hover:shadow-xl">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-[#C4D82E] to-[#A8D5BA] rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-7 h-7 text-[#1B5E20]" />
              </div>
              <CardTitle className="text-[#1B5E20]">Real-time Analytics</CardTitle>
              <CardDescription>
                Monitor test performance and candidate progress with live dashboards
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Key Features */}
        <Card className="mb-16 border-2 border-[#1B5E20] shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-[#1B5E20]">Platform Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#FF6347] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Automated Test Generation</h3>
                  <p className="text-gray-600 text-sm">
                    Create 21-question assessments in seconds using advanced AI models
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#1B5E20] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Secure & Reliable</h3>
                  <p className="text-gray-600 text-sm">
                    Enterprise-grade security for confidential talent assessment
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#C4D82E] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-[#1B5E20]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Role-Specific Testing</h3>
                  <p className="text-gray-600 text-sm">
                    Customized assessments for developers, designers, data scientists, and more
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-[#A8D5BA] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-[#1B5E20]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1B5E20] mb-1">Comprehensive Analytics</h3>
                  <p className="text-gray-600 text-sm">
                    Detailed insights into candidate performance and success rates
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="inline-block border-2 border-[#FF6347] shadow-2xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-[#1B5E20] mb-4">
                Internal Use Only
              </h2>
              <p className="text-gray-600 mb-6 max-w-md">
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

      {/* Footer */}
      <div className="border-t border-[#A8D5BA] py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            © 2025 Neural Arc Inc. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Atom - Internal Talent Assessment Platform
          </p>
        </div>
      </div>
    </div>
  );
}

