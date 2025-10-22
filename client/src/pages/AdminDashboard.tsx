import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Briefcase, ClipboardList, TrendingUp, Users, Award, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: jobs = [], isLoading: jobsLoading } = trpc.jobs.list.useQuery();
  const { data: tests = [], isLoading: testsLoading } = trpc.tests.list.useQuery();
  const { data: candidates = [], isLoading: candidatesLoading } = trpc.candidates.list.useQuery();

  const completedCandidates = candidates.filter((c) => c.completedAt);
  const averageScore =
    completedCandidates.length > 0
      ? completedCandidates.reduce((sum, c) => sum + (parseInt(c.score || "0") || 0), 0) /
        completedCandidates.length
      : 0;
  const completionRate =
    candidates.length > 0 ? (completedCandidates.length / candidates.length) * 100 : 0;

  // Calculate success rate (candidates scoring 15+)
  const successfulCandidates = completedCandidates.filter((c) => parseInt(c.score || "0") >= 15);
  const successRate =
    completedCandidates.length > 0
      ? (successfulCandidates.length / completedCandidates.length) * 100
      : 0;

  // Get job stats
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
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 gradient-lime opacity-10 rounded-3xl blur-3xl" />
          <div className="relative">
            <h1 className="text-5xl font-bold tracking-tight text-gradient mb-3">Dashboard</h1>
            <p className="text-muted-foreground text-xl">Welcome to Atom HR Portal</p>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Card
              key={stat.title}
              className="bento-card overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`h-3 ${stat.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-2xl ${stat.gradient} shadow-md`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className={`text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Candidates - Spans 2 columns */}
          <Card className="bento-card lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-xl gradient-mint">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Recent Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedCandidates.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No completed tests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedCandidates.slice(0, 5).map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full gradient-coral flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-base">{candidate.name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${
                            parseInt(candidate.score || "0") >= 15
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {candidate.score || "0"}/21
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(candidate.completedAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Success Rate Card - Spans 1 column */}
          <Card className="bento-card border-0 shadow-lg gradient-lime text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
            <CardHeader className="relative z-10 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-6xl font-bold mb-2">{successRate.toFixed(0)}%</div>
              <p className="text-white/90 text-sm mb-6">Candidates scoring 15+</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Successful</span>
                  <span className="font-semibold">
                    {successfulCandidates.length} / {completedCandidates.length}
                  </span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Roles Grid */}
        <Card className="bento-card border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-coral">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              Job Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobStats.slice(0, 6).map((job, idx) => {
                const gradients = ["gradient-coral", "gradient-lime", "gradient-mint"];
                const gradient = gradients[idx % 3];
                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-accent/5 to-accent/10 hover:from-accent/10 hover:to-accent/20 transition-all border-l-4 border-transparent hover:border-current group"
                    style={{
                      borderLeftColor:
                        idx % 3 === 0 ? "#FF6347" : idx % 3 === 1 ? "#C4D82E" : "#A8D5BA",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg group-hover:text-[#FF6347] transition-colors">
                        {job.title}
                      </h3>
                      <div className={`p-2 rounded-xl ${gradient} shadow-sm`}>
                        <Briefcase className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.experience} experience
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ClipboardList className="h-4 w-4" />
                        <span>{job.testCount} tests</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{job.candidateCount} candidates</span>
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

