import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Briefcase, ClipboardList, TrendingUp, Users, Award, Clock, Trophy, AlertCircle, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const utils = trpc.useUtils();
  const { data: jobs = [], isLoading: jobsLoading } = trpc.jobs.list.useQuery();
  const { data: tests = [], isLoading: testsLoading } = trpc.tests.list.useQuery();
  const { data: candidates = [], isLoading: candidatesLoading } = trpc.candidates.list.useQuery();

  const approveReappearanceMutation = trpc.candidates.approveReappearance.useMutation({
    onSuccess: () => {
      utils.candidates.list.invalidate();
      toast.success("Reappearance approved successfully");
    },
    onError: (error) => {
      toast.error("Failed to approve reappearance: " + error.message);
    },
  });

  const completedCandidates = candidates.filter((c) => c.completedAt);
  const reappearanceRequests = candidates.filter((c) => c.status === "reappearance_requested");
  const lockedOutCandidates = candidates.filter((c) => c.status === "locked_out");
  
  // Calculate percentage for each candidate
  const candidatesWithPercentage = completedCandidates.map((c) => {
    const score = c.score || 0;
    const total = c.totalQuestions || 21;
    const percentage = total > 0 ? (score / total) * 100 : 0;
    return { ...c, percentage, score, total };
  });

  // Sort: Top performers (85%+) first, then others
  const topPerformers = candidatesWithPercentage.filter((c) => c.percentage >= 85);
  const otherCandidates = candidatesWithPercentage.filter((c) => c.percentage < 85);
  const sortedCandidates = [...topPerformers, ...otherCandidates];

  const averageScore =
    completedCandidates.length > 0
      ? completedCandidates.reduce((sum, c) => {
          const score = c.score || 0;
          return sum + score;
        }, 0) / completedCandidates.length
      : 0;

  const totalQuestions = 21;
  const successRate = completedCandidates.length > 0
    ? (topPerformers.length / completedCandidates.length) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 gradient-coral opacity-10 rounded-3xl blur-3xl" />
          <div className="relative">
            <h1 className="text-5xl font-bold tracking-tight text-gradient mb-3">Dashboard</h1>
            <p className="text-muted-foreground text-xl">Welcome to Atom</p>
          </div>
        </div>

        {/* Reappearance Requests Alert */}
        {reappearanceRequests.length > 0 && (
          <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-orange-900">Reappearance Requests ({reappearanceRequests.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reappearanceRequests.map((candidate) => (
                  <div key={candidate.id} className="p-4 bg-white rounded-xl border border-orange-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        <p className="text-xs text-orange-600 mt-1">
                          Locked out: {candidate.lockoutReason || "Unknown reason"}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => approveReappearanceMutation.mutate({ candidateId: candidate.id })}
                      disabled={approveReappearanceMutation.isPending}
                      className="gradient-lime text-white"
                    >
                      {approveReappearanceMutation.isPending ? "Approving..." : "Approve Reappearance"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked Out Candidates */}
        {lockedOutCandidates.length > 0 && (
          <Card className="border-2 border-red-300 bg-gradient-to-r from-red-50 to-pink-50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-500">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-red-900">Locked Out Candidates ({lockedOutCandidates.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lockedOutCandidates.map((candidate) => (
                  <div key={candidate.id} className="p-4 bg-white rounded-xl border border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-lg">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Locked out: {candidate.lockoutReason || "Unknown reason"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(candidate.startedAt!).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-red-600 font-medium">
                      No reappearance request yet
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
          {/* Total Jobs - Compact */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 gradient-coral opacity-5 group-hover:opacity-10 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl gradient-coral">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-4xl font-bold tracking-tight">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">Active job roles</p>
              </div>
            </CardContent>
          </Card>

          {/* Tests Generated - Compact */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 gradient-lime opacity-5 group-hover:opacity-10 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl gradient-lime">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Tests Generated</p>
                <p className="text-4xl font-bold tracking-tight">{tests.length}</p>
                <p className="text-xs text-muted-foreground">Total assessments</p>
              </div>
            </CardContent>
          </Card>

          {/* Candidates - Compact */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 gradient-mint opacity-5 group-hover:opacity-10 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl gradient-mint">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Candidates</p>
                <p className="text-4xl font-bold tracking-tight">{candidates.length}</p>
                <p className="text-xs text-muted-foreground">{completedCandidates.length} completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Average Score - Compact */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 gradient-coral opacity-5 group-hover:opacity-10 transition-opacity" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl gradient-coral">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-4xl font-bold tracking-tight">{averageScore.toFixed(1)}/{totalQuestions}</p>
                <p className="text-xs text-muted-foreground">{completedCandidates.length > 0 ? Math.round((averageScore / totalQuestions) * 100) : 0}% completion rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Larger Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Candidates - Spans 2 columns */}
          <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl gradient-mint">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl">Recent Candidates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {sortedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground">No completed tests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedCandidates.slice(0, 5).map((candidate) => {
                    const isPassed = candidate.percentage >= 85;
                    return (
                      <div
                        key={candidate.id}
                        className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                          isPassed
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                            : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              isPassed ? "gradient-lime text-white" : "gradient-coral text-white"
                            }`}>
                              {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{candidate.name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.email}</p>
                              {isPassed ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <Trophy className="h-3 w-3 text-green-600" />
                                  <span className="text-xs font-medium text-green-600">Top Performer</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3 text-orange-600" />
                                  <span className="text-xs font-medium text-orange-600">Did not pass</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-3xl font-bold ${isPassed ? "text-green-600" : "text-orange-600"}`}>
                              {Math.round(candidate.percentage)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {candidate.score}/{candidate.total}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(candidate.completedAt!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Success Rate - Tall card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 gradient-lime opacity-20" />
            <CardContent className="p-8 relative h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-white/50">
                  <Award className="h-5 w-5 text-[#5A7C3F]" />
                </div>
                <h3 className="text-xl font-bold text-[#5A7C3F]">Success Rate</h3>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-7xl font-bold text-[#5A7C3F] mb-2">{Math.round(successRate)}%</p>
                  <p className="text-sm text-[#5A7C3F]/80 font-medium">Candidates scoring 85%+</p>
                </div>
              </div>

              <div className="space-y-2 pt-6 border-t border-[#5A7C3F]/20">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5A7C3F]/80">Successful</span>
                  <span className="font-bold text-[#5A7C3F]">{topPerformers.length} / {completedCandidates.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Roles Grid */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-coral">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">Job Roles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {jobs.map((job, index) => {
                const jobTests = tests.filter((t) => t.jobId === job.id);
                const jobCandidates = candidates.filter((c) =>
                  jobTests.some((t) => t.id === c.testId)
                );
                
                const gradients = [
                  { bg: "from-orange-500 to-red-500", text: "text-orange-600", icon: "bg-orange-100" },
                  { bg: "from-lime-500 to-yellow-500", text: "text-lime-600", icon: "bg-lime-100" },
                  { bg: "from-teal-500 to-cyan-500", text: "text-teal-600", icon: "bg-teal-100" },
                  { bg: "from-purple-500 to-pink-500", text: "text-purple-600", icon: "bg-purple-100" },
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <div
                    key={job.id}
                    className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  >
                    {/* Gradient Header */}
                    <div className={`h-24 bg-gradient-to-br ${gradient.bg} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
                      <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 -mt-8 relative">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl ${gradient.icon} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Briefcase className={`h-8 w-8 ${gradient.text}`} />
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 min-h-[3.5rem]">{job.title}</h3>
                      
                      {/* Experience */}
                      <p className="text-sm text-muted-foreground mb-4">{job.experience}</p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${gradient.icon}`}>
                            <ClipboardList className={`h-3.5 w-3.5 ${gradient.text}`} />
                          </div>
                          <span className="text-sm font-semibold">{jobTests.length}</span>
                          <span className="text-xs text-muted-foreground">tests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${gradient.icon}`}>
                            <Users className={`h-3.5 w-3.5 ${gradient.text}`} />
                          </div>
                          <span className="text-sm font-semibold">{jobCandidates.length}</span>
                          <span className="text-xs text-muted-foreground">candidates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

