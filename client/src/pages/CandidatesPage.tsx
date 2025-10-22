import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Users } from "lucide-react";

export default function CandidatesPage() {
  const { data: candidates = [], isLoading } = trpc.candidates.list.useQuery();
  const { data: tests = [] } = trpc.tests.list.useQuery();
  const { data: jobs = [] } = trpc.jobs.list.useQuery();

  const completedCandidates = candidates.filter((c) => c.completedAt);

  const getCandidateDetails = (candidate: any) => {
    const test = tests.find((t) => t.id === candidate.testId);
    const job = test ? jobs.find((j) => j.id === test.jobId) : null;
    return { test, job };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">View and manage test submissions</p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading candidates...</p>
        ) : completedCandidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No completed tests yet</p>
              <p className="text-sm text-muted-foreground">
                Candidates will appear here after completing tests
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Completed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedCandidates.map((candidate) => {
                    const { job, test } = getCandidateDetails(candidate);
                    const score = parseInt(candidate.score || "0");
                    const percentage = (score / 21) * 100;
                    return (
                      <TableRow key={candidate.id}>
                        <TableCell className="font-medium">{candidate.name}</TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job?.title || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">
                              {test?.complexity || "N/A"} complexity
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold">
                              {score}/21
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percentage.toFixed(0)}%
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(candidate.completedAt!).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

