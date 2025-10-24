import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock, Eye, Trash2, Users } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function CandidatesPage() {
  const [, setLocation] = useLocation();
  const { data: candidates = [], isLoading, refetch } = trpc.candidates.list.useQuery();
  const deleteMutation = trpc.candidates.delete.useMutation({
    onSuccess: () => {
      toast.success("Candidate deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete candidate");
    },
  });

  const completedCandidates = candidates.filter((c) => c.completed_at);
  const inProgressCandidates = candidates.filter((c) => !c.completed_at);

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id });
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    const numScore = score;
    if (numScore >= 18) return "text-green-600 font-bold";
    if (numScore >= 15) return "text-lime-600 font-semibold";
    if (numScore >= 10) return "text-yellow-600 font-medium";
    return "text-red-600 font-medium";
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gradient mb-2">Candidates</h1>
            <p className="text-muted-foreground text-lg">
              {completedCandidates.length} completed • {inProgressCandidates.length} in progress
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <Card className="bento-card">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl font-medium mb-2">No candidates yet</p>
              <p className="text-muted-foreground text-center">
                Candidates will appear here once they start taking tests
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Completed Candidates */}
            {completedCandidates.length > 0 && (
              <Card className="bento-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Completed Tests ({completedCandidates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-accent/10 hover:bg-accent/20 transition-all group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full gradient-lime flex items-center justify-center text-white font-bold text-lg">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-base font-semibold">{candidate.name}</p>
                              <span className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                                {candidate.score || "0"}/21
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Started: {formatDate(candidate.started_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed: {formatDate(candidate.completed_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/admin/candidates/${candidate.id}`)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {candidate.name}'s test submission?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(candidate.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* In Progress Candidates */}
            {inProgressCandidates.length > 0 && (
              <Card className="bento-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Clock className="h-5 w-5 text-orange-600" />
                    In Progress ({inProgressCandidates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inProgressCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-accent/10 hover:bg-accent/20 transition-all group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full gradient-coral flex items-center justify-center text-white font-bold text-lg">
                            {candidate.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <p className="text-base font-semibold">{candidate.name}</p>
                              <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                                In Progress
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              Started: {formatDate(candidate.startedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Candidate</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {candidate.name}'s test session?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(candidate.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
