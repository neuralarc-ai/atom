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
    },
    {
      title: "Tests Generated",
      value: tests.length,
      icon: ClipboardList,
      description: "Total assessments",
    },
    {
      title: "Candidates",
      value: candidates.length,
      icon: Users,
      description: `${completedCandidates.length} completed`,
    },
    {
      title: "Average Score",
      value: `${averageScore.toFixed(1)}/21`,
      icon: TrendingUp,
      description: `${completionRate.toFixed(0)}% completion rate`,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Atom HR Portal</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              {candidatesLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : completedCandidates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed tests yet</p>
              ) : (
                <div className="space-y-4">
                  {completedCandidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {candidate.score}/21
                        </p>
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

          <Card>
            <CardHeader>
              <CardTitle>Job Roles</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No jobs created yet</p>
              ) : (
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => {
                    const jobTests = tests.filter((t) => t.jobId === job.id);
                    const jobCandidates = candidates.filter((c) =>
                      jobTests.some((t) => t.id === c.testId)
                    );
                    return (
                      <div key={job.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.experience}</p>
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
        </div>
      </div>
    </DashboardLayout>
  );
}

