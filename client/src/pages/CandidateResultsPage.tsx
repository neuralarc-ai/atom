import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { useRoute, useLocation } from "wouter";

export default function CandidateResultsPage() {
  const [, params] = useRoute("/admin/candidates/:id");
  const [, setLocation] = useLocation();
  const candidateId = params?.id || "";

  const { data: candidate, isLoading } = trpc.candidates.getById.useQuery({ id: candidateId });
  const { data: tests = [] } = trpc.tests.list.useQuery();
  const { data: jobs = [] } = trpc.jobs.list.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading candidate details...</p>
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setLocation("/admin/candidates")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
          <p className="text-muted-foreground">Candidate not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const test = tests.find((t) => t.id === candidate.test_id);
  const job = test ? jobs.find((j) => j.id === test.job_id) : null;
  const questions = candidate.questions ? JSON.parse(candidate.questions) : [];
  const answers = candidate.answers ? JSON.parse(candidate.answers) : [];
  const score = candidate.score || 0;
  const totalQuestions = candidate.total_questions || 21;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setLocation("/admin/candidates")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </div>

        {/* Candidate Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{candidate.name}</CardTitle>
            <CardDescription>{candidate.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Job Role</p>
                <p className="text-lg font-medium">{job?.title || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Test Complexity</p>
                <p className="text-lg font-medium capitalize">{test?.complexity || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">
                  {score}/21
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({percentage.toFixed(0)}%)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed At</p>
                <p className="text-lg font-medium">
                  {candidate.completed_at
                    ? new Date(candidate.completed_at).toLocaleString()
                    : "In Progress"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions and Answers */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Test Results</h2>
          {questions.map((question: any, idx: number) => {
            const userAnswer = answers[idx];
            // Convert letter answer (A, B, C, D) to numeric index (0, 1, 2, 3) for comparison
            const correctAnswerIndex = question.correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
            const isCorrect = userAnswer === correctAnswerIndex;
            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      Question {idx + 1} of {questions.length}
                    </CardTitle>
                    {isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <CardDescription className="text-base text-foreground">
                    {question.question}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {question.options.map((option: string, optIdx: number) => {
                    const optionLetter = String.fromCharCode(65 + optIdx);
                    const isUserAnswer = userAnswer === optIdx; // Compare numeric index with numeric index
                    const isCorrectAnswer = question.correctAnswer === optionLetter;

                    return (
                      <div
                        key={optIdx}
                        className={`rounded-lg border p-3 ${
                          isCorrectAnswer
                            ? "bg-green-50 border-green-500"
                            : isUserAnswer
                              ? "bg-red-50 border-red-500"
                              : "bg-background"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{optionLetter}.</span>
                          <span>{option}</span>
                          {isCorrectAnswer && (
                            <span className="ml-auto text-xs font-medium text-green-700">
                              Correct Answer
                            </span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-auto text-xs font-medium text-red-700">
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

