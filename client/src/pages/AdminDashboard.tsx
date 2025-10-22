import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Briefcase, ClipboardList, TrendingUp, Users } from "lucide-react";

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

  const stats = [
    {
      title: "Total Jobs",
      value: jobs.length,
      icon: Briefcase,
      description: "Active job roles",
      gradient: "gradient-coral",
    },
    {
      title: "Tests Generated",
      value: tests.length,
      icon: ClipboardList,
      description: "Total assessments",
      gradient: "gradient-lime",
    },
    {
      title: "Candidates",
      value: candidates.length,
      icon: Users,
      description: `${completedCandidates.length} completed`,
      gradient: "gradient-mint",
    },
    {
      title: "Average Score",
      value: `${averageScore.toFixed(1)}/21`,
      icon: TrendingUp,
      description: `${completionRate.toFixed(0)}% completion rate`,
      gradient: "gradient-coral",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gradient mb-2">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Welcome to Atom HR Portal</p>
        </div>

        {/* Bento Grid Stats */}
        <div className="bento-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <Card key={stat.title} className="bento-card overflow-hidden">
              <div className={`h-2 ${stat.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-xl ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bento Grid Content */}
        <div className="bento-grid grid-cols-1 lg:grid-cols-2">
          {/* Recent Candidates - Larger Card */}
          <Card className="bento-card lg:row-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Recent Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              {candidatesLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : completedCandidates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No completed tests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedCandidates.slice(0, 8).map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-accent/10 hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-coral flex items-center justify-center text-white font-bold">
                          {candidate.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{candidate.score}/21</p>
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

          {/* Job Roles - Stacked Cards */}
          <Card className="bento-card">
            <CardHeader>
              <CardTitle className="text-xl">Job Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No jobs created yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job, idx) => {
                    const jobTests = tests.filter((t) => t.jobId === job.id);
                    const jobCandidates = candidates.filter((c) =>
                      jobTests.some((t) => t.id === c.testId)
                    );
                    const gradients = ["gradient-coral", "gradient-lime", "gradient-mint"];
                    return (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-12 rounded-full ${gradients[idx % 3]}`} />
                          <div>
                            <p className="text-sm font-medium">{job.title}</p>
                            <p className="text-xs text-muted-foreground">{job.experience}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{jobTests.length} tests</p>
                          <p className="text-xs text-muted-foreground">
                            {jobCandidates.length} candidates
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bento-card gradient-lime text-white">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-90">Success Rate</p>
                  <p className="text-4xl font-bold">
                    {completedCandidates.length > 0
                      ? ((completedCandidates.filter((c) => parseInt(c.score || "0") >= 15).length /
                          completedCandidates.length) *
                          100).toFixed(0)
                      : 0}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm opacity-90">Candidates scoring 15+</p>
                  <p className="text-2xl font-bold">
                    {completedCandidates.filter((c) => parseInt(c.score || "0") >= 15).length} /{" "}
                    {completedCandidates.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

