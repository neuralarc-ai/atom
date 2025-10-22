import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Briefcase, ClipboardList, TrendingUp, Users, Award, Clock, Trophy, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const { data: jobs = [], isLoading: jobsLoading } = trpc.jobs.list.useQuery();
  const { data: tests = [], isLoading: testsLoading } = trpc.tests.list.useQuery();
  const { data: candidates = [], isLoading: candidatesLoading } = trpc.candidates.list.useQuery();

  const completedCandidates = candidates.filter((c) => c.completedAt);
  
  // Calculate percentage for each candidate
  const candidatesWithPercentage = completedCandidates.map((c) => {
    const score = parseInt(c.score?.split("/")[0] || "0");
    const total = parseInt(c.score?.split("/")[1] || "21");
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
          const score = parseInt(c.score?.split("/")[0] || "0");
          return sum + score;
        }, 0) / completedCandidates.length
      : 0;

  const completionRate =
    candidates.length > 0 ? (completedCandidates.length / candidates.length) * 100 : 0;

  const successRate =
    completedCandidates.length > 0 ? (topPerformers.length / completedCandidates.length) * 100 : 0;

  const jobStats = jobs.map((job) => {
    const jobTests = tests.filter((t) => t.jobId === job.id);
    const jobCandidates = jobTests.flatMap((test) =>
      candidates.filter((c) => c.testId === test.id)
    );
    return {
      ...job,
      testCount: jobTests.length,
      candidateCount: jobCandidates.length,
    };
  });

  const stats = [
    {
      title: "Total Jobs",
      value: jobs.length,
      icon: Briefcase,
      description: "Active job roles",
      gradient: "gradient-coral",
      color: "text-[#FF6347]",
    },
    {
      title: "Tests Generated",
      value: tests.length,
      icon: ClipboardList,
      description: "Total assessments",
      gradient: "gradient-lime",
      color: "text-[#C4D82E]",
    },
    {
      title: "Candidates",
      value: candidates.length,
      icon: Users,
      description: `${completedCandidates.length} completed`,
      gradient: "gradient-mint",
      color: "text-[#A8D5BA]",
    },
    {
      title: "Average Score",
      value: `${averageScore.toFixed(1)}/21`,
      icon: TrendingUp,
      description: `${completionRate.toFixed(0)}% completion rate`,
      gradient: "gradient-coral",
      color: "text-[#FF6347]",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <div className="relative">
          <div className="absolute inset-0 gradient-coral opacity-10 rounded-3xl blur-3xl" />
          <div className="relative">
            <h1 className="text-5xl font-bold tracking-tight text-gradient mb-3">Dashboard</h1>
            <p className="text-muted-foreground text-xl">Welcome to Atom HR Portal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="bento-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-3 ${stat.gradient}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-2xl ${stat.gradient} shadow-md`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bento-card border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl gradient-mint">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Recent Candidates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {sortedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed tests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCandidates.slice(0, 5).map((candidate) => {
                    const isPassed = candidate.percentage >= 85;
                    return (
                      <div
                        key={candidate.id}
                        className={`flex items-center justify-between p-5 rounded-2xl transition-all ${
                          isPassed
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                            : "bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                              isPassed ? "gradient-lime" : "gradient-coral"
                            }`}
                          >
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            {isPassed ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Trophy className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium text-green-600">Top Performer</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-xs font-medium text-orange-600">Did not pass</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-3xl font-bold ${
                              isPassed ? "text-green-600" : "text-orange-600"
                            }`}
                          >
                            {candidate.percentage.toFixed(0)}%
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {candidate.score}/{candidate.total}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(candidate.completedAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bento-card border-0 shadow-lg gradient-lime text-white">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Success Rate</h3>
              </div>
              <div className="text-7xl font-bold mb-4">{successRate.toFixed(0)}%</div>
              <p className="text-lg mb-6 text-white/90">
                Candidates scoring 85%+
              </p>
              <div className="space-y-3 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">Successful</span>
                  <span className="font-bold">
                    {topPerformers.length} / {completedCandidates.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bento-card border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl gradient-coral">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl">Job Roles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobStats.slice(0, 6).map((job, idx) => {
                const gradients = ["gradient-coral", "gradient-lime", "gradient-mint"];
                const colors = ["#FF6347", "#C4D82E", "#A8D5BA"];
                const gradient = gradients[idx % 3];
                const color = colors[idx % 3];

                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl border-2 hover:shadow-md transition-all"
                    style={{ borderLeftWidth: "6px", borderLeftColor: color }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{job.title}</h4>
                      <div className={`p-2 rounded-xl ${gradient}`}>
                        <Briefcase className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{job.experience}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" style={{ color }} />
                        <span className="font-medium">{job.testCount} tests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" style={{ color }} />
                        <span className="font-medium">{job.candidateCount} candidates</span>
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
