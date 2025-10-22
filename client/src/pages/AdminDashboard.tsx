import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Clock,
  ClipboardList,
  TrendingUp,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "../components/DashboardLayout";

export default function AdminDashboard() {
  const { data: jobs = [] } = trpc.jobs.list.useQuery();
  const { data: tests = [] } = trpc.tests.list.useQuery();
  const { data: candidates = [] } = trpc.candidates.list.useQuery();

  const utils = trpc.useUtils();
  const approveReappearanceMutation = trpc.candidates.approveReappearance.useMutation({
    onSuccess: () => {
      utils.candidates.list.invalidate();
      toast.success("Reappearance approved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const completedCandidates = candidates.filter((c) => c.status === "completed");
  const reappearanceRequests = candidates.filter((c) => c.status === "reappearance_requested");
  const lockedOutCandidates = candidates.filter((c) => c.status === "locked_out");

  const totalQuestions = 21;
  const averageScore =
    completedCandidates.length > 0
      ? completedCandidates.reduce((sum, c) => sum + (c.score || 0), 0) / completedCandidates.length
      : 0;

  const sortedCandidates = [...completedCandidates].sort((a, b) => {
    const aPercentage = ((a.score || 0) / totalQuestions) * 100;
    const bPercentage = ((b.score || 0) / totalQuestions) * 100;
    return bPercentage - aPercentage;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FF6347] via-[#C4D82E] to-[#A8D5BA] bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-[#2d5f4e]">Welcome to Atom</p>
        </div>

        {/* Reappearance Requests Alert */}
        {reappearanceRequests.length > 0 && (
          <Card className="border-2 border-[#FF6347] bg-gradient-to-r from-[#FF6347]/5 to-[#FF6347]/10 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#FF6347] mb-2 flex items-center gap-2">
                    <AlertCircle className="h-6 w-6" />
                    Reappearance Requests ({reappearanceRequests.length})
                  </h3>
                  {reappearanceRequests.map((candidate) => (
                    <div key={candidate.id} className="mt-4 p-4 bg-white rounded-xl border border-[#FF6347]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#FF6347] flex items-center justify-center text-white font-bold text-lg">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-[#2d5f4e]">{candidate.name}</p>
                            <p className="text-sm text-[#2d5f4e]/70">{candidate.email}</p>
                            <p className="text-xs text-[#FF6347] mt-1">
                              Locked out: {candidate.lockoutReason || "Unknown reason"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => approveReappearanceMutation.mutate({ candidateId: candidate.id })}
                          disabled={approveReappearanceMutation.isPending}
                          className="bg-gradient-to-r from-[#C4D82E] to-[#A8D5BA] text-[#2d5f4e] font-semibold hover:shadow-lg transition-all"
                        >
                          {approveReappearanceMutation.isPending ? "Approving..." : "Approve Reappearance"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked Out Candidates Alert */}
        {lockedOutCandidates.length > 0 && (
          <Card className="border-2 border-[#FF6347]/50 bg-gradient-to-r from-red-50 to-orange-50 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-[#FF6347] mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Locked Out Candidates ({lockedOutCandidates.length})
              </h3>
              <div className="space-y-3">
                {lockedOutCandidates.map((candidate) => (
                  <div key={candidate.id} className="p-4 bg-white rounded-xl border border-[#FF6347]/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#FF6347]/20 flex items-center justify-center text-[#FF6347] font-bold">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#2d5f4e]">{candidate.name}</p>
                        <p className="text-sm text-[#2d5f4e]/70">{candidate.email}</p>
                        <p className="text-xs text-[#FF6347]">Reason: {candidate.lockoutReason || "Unknown"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Jobs */}
          <Card className="border-0 bg-gradient-to-br from-[#FF6347] to-[#ff8570] text-white shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium opacity-90">Total Jobs</p>
                <p className="text-5xl font-bold tracking-tight">{jobs.length}</p>
                <p className="text-xs opacity-75">Active job roles</p>
              </div>
            </CardContent>
          </Card>

          {/* Tests Generated */}
          <Card className="border-0 bg-gradient-to-br from-[#C4D82E] to-[#d4e556] text-[#2d5f4e] shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/20" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/30 backdrop-blur">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium opacity-90">Tests Generated</p>
                <p className="text-5xl font-bold tracking-tight">{tests.length}</p>
                <p className="text-xs opacity-75">Total assessments</p>
              </div>
            </CardContent>
          </Card>

          {/* Candidates */}
          <Card className="border-0 bg-gradient-to-br from-[#A8D5BA] to-[#c0e5d0] text-[#2d5f4e] shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/20" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/30 backdrop-blur">
                  <Users className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium opacity-90">Candidates</p>
                <p className="text-5xl font-bold tracking-tight">{completedCandidates.length}</p>
                <p className="text-xs opacity-75">{completedCandidates.length} completed</p>
              </div>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="border-0 bg-gradient-to-br from-[#FF6347] via-[#ff7a5e] to-[#C4D82E] text-white shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium opacity-90">Average Score</p>
                <p className="text-5xl font-bold tracking-tight">
                  {averageScore.toFixed(1)}/{totalQuestions}
                </p>
                <p className="text-xs opacity-75">
                  {completedCandidates.length > 0 ? Math.round((averageScore / totalQuestions) * 100) : 0}% completion rate
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Larger Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Candidates - Spans 2 columns */}
          <Card className="lg:col-span-2 border-2 border-[#A8D5BA]/30 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-[#A8D5BA]/10 to-transparent border-b border-[#A8D5BA]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#A8D5BA] to-[#c0e5d0]">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#2d5f4e]">Recent Candidates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {sortedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-[#A8D5BA] mb-3 opacity-50" />
                  <p className="text-[#2d5f4e]/60">No completed tests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedCandidates.slice(0, 5).map((candidate) => {
                    const percentage = ((candidate.score || 0) / totalQuestions) * 100;
                    const isPassed = percentage >= 85;
                    return (
                      <div
                        key={candidate.id}
                        className={`p-5 rounded-2xl border-2 transition-all hover:shadow-lg ${
                          isPassed
                            ? "bg-gradient-to-r from-[#C4D82E]/10 to-[#A8D5BA]/10 border-[#C4D82E]/30"
                            : "bg-gradient-to-r from-[#FF6347]/10 to-[#ff8570]/10 border-[#FF6347]/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shadow-lg ${
                                isPassed
                                  ? "bg-gradient-to-br from-[#C4D82E] to-[#A8D5BA] text-white"
                                  : "bg-gradient-to-br from-[#FF6347] to-[#ff8570] text-white"
                              }`}
                            >
                              {candidate.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-lg text-[#2d5f4e]">{candidate.name}</p>
                              <p className="text-sm text-[#2d5f4e]/70">{candidate.email}</p>
                              {isPassed ? (
                                <div className="flex items-center gap-1 mt-1">
                                  <Trophy className="h-4 w-4 text-[#C4D82E]" />
                                  <span className="text-sm font-semibold text-[#C4D82E]">Top Performer</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-4 w-4 text-[#FF6347]" />
                                  <span className="text-sm font-semibold text-[#FF6347]">Did not pass</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-4xl font-bold ${
                                isPassed ? "text-[#C4D82E]" : "text-[#FF6347]"
                              }`}
                            >
                              {Math.round(percentage)}%
                            </p>
                            <p className="text-sm text-[#2d5f4e]/60">
                              {candidate.score}/{totalQuestions}
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

          {/* Success Rate */}
          <Card className="border-2 border-[#C4D82E]/30 bg-gradient-to-br from-[#C4D82E]/5 to-[#A8D5BA]/5 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-[#C4D82E]/10 to-transparent border-b border-[#C4D82E]/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#C4D82E] to-[#A8D5BA]">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#2d5f4e]">Success Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="text-7xl font-bold bg-gradient-to-r from-[#C4D82E] to-[#A8D5BA] bg-clip-text text-transparent">
                    {completedCandidates.length > 0
                      ? Math.round(
                          (completedCandidates.filter((c) => ((c.score || 0) / totalQuestions) * 100 >= 85).length /
                            completedCandidates.length) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
                <p className="text-sm text-[#2d5f4e]/70 mt-4">Candidates scoring 85%+</p>
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2d5f4e]/70">Successful</span>
                    <span className="font-semibold text-[#C4D82E]">
                      {completedCandidates.filter((c) => ((c.score || 0) / totalQuestions) * 100 >= 85).length} /{" "}
                      {completedCandidates.length}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#C4D82E] to-[#A8D5BA] transition-all duration-500"
                      style={{
                        width: `${
                          completedCandidates.length > 0
                            ? (completedCandidates.filter((c) => ((c.score || 0) / totalQuestions) * 100 >= 85)
                                .length /
                                completedCandidates.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Roles Grid */}
        <Card className="border-2 border-[#FF6347]/30 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#FF6347]/10 to-transparent border-b border-[#FF6347]/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF6347] to-[#ff8570]">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl text-[#2d5f4e]">Job Roles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {jobs.map((job, index) => {
                const jobTests = tests.filter((t) => t.jobId === job.id);
                const jobCandidates = candidates.filter((c) => jobTests.some((t) => t.id === c.testId));

                const gradients = [
                  { bg: "from-[#FF6347] to-[#ff8570]", text: "text-[#FF6347]", icon: "bg-[#FF6347]/10" },
                  { bg: "from-[#C4D82E] to-[#d4e556]", text: "text-[#C4D82E]", icon: "bg-[#C4D82E]/10" },
                  { bg: "from-[#A8D5BA] to-[#c0e5d0]", text: "text-[#A8D5BA]", icon: "bg-[#A8D5BA]/10" },
                  { bg: "from-[#FF6347] to-[#C4D82E]", text: "text-[#FF6347]", icon: "bg-gradient-to-br from-[#FF6347]/10 to-[#C4D82E]/10" },
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
                      <div
                        className={`w-16 h-16 rounded-2xl ${gradient.icon} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform border-4 border-white`}
                      >
                        <Briefcase className={`h-8 w-8 ${gradient.text}`} />
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 min-h-[3.5rem] text-[#2d5f4e]">
                        {job.title}
                      </h3>

                      {/* Experience */}
                      <p className="text-sm text-[#2d5f4e]/70 mb-4">{job.experience}</p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${gradient.icon}`}>
                            <ClipboardList className={`h-3.5 w-3.5 ${gradient.text}`} />
                          </div>
                          <span className="text-sm font-semibold text-[#2d5f4e]">{jobTests.length}</span>
                          <span className="text-xs text-[#2d5f4e]/60">tests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${gradient.icon}`}>
                            <Users className={`h-3.5 w-3.5 ${gradient.text}`} />
                          </div>
                          <span className="text-sm font-semibold text-[#2d5f4e]">{jobCandidates.length}</span>
                          <span className="text-xs text-[#2d5f4e]/60">candidates</span>
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

