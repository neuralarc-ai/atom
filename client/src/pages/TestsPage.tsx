import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ClipboardList, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function TestsPage() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: jobs = [] } = trpc.jobs.list.useQuery();
  const { data: tests = [], isLoading } = trpc.tests.list.useQuery();

  const generateMutation = trpc.tests.generate.useMutation({
    onSuccess: (data) => {
      utils.tests.list.invalidate();
      setIsGenerateOpen(false);
      toast.success("Test generated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.tests.delete.useMutation({
    onSuccess: () => {
      utils.tests.list.invalidate();
      setDeleteDialogOpen(false);
      setTestToDelete(null);
      toast.success("Test deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleGenerate = () => {
    if (!selectedJobId) {
      toast.error("Please select a job");
      return;
    }
    generateMutation.mutate({ jobId: selectedJobId, complexity });
  };

  const copyTestLink = (testId: string) => {
    const link = `${window.location.origin}/test/${testId}`;
    navigator.clipboard.writeText(link);
    toast.success("Test link copied to clipboard");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tests</h1>
            <p className="text-muted-foreground">Generate and manage assessment tests</p>
          </div>
          <Button onClick={() => setIsGenerateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Test
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading tests...</p>
        ) : tests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No tests generated yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first assessment test
              </p>
              <Button onClick={() => setIsGenerateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => {
              const job = jobs.find((j) => j.id === test.jobId);
              const questions = JSON.parse(test.questions);
              return (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{job?.title || "Unknown Job"}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          test.complexity === "high"
                            ? "bg-red-100 text-red-800"
                            : test.complexity === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {test.complexity}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {new Date(test.createdAt!).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {questions.length} questions • 20 minutes
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => copyTestLink(test.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Test Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTestToDelete(test.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Dialog */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Assessment Test</DialogTitle>
            <DialogDescription>
              Create a new test with AI-generated questions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="job">Job Role</Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger id="job">
                  <SelectValue placeholder="Select a job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="complexity">Complexity Level</Label>
              <Select
                value={complexity}
                onValueChange={(value: any) => setComplexity(value)}
              >
                <SelectTrigger id="complexity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div 
              className="rounded-2xl border-2 p-6 text-sm"
              style={{
                background: 'linear-gradient(to bottom right, rgba(168, 213, 186, 0.2), rgba(196, 216, 46, 0.1))',
                borderColor: 'rgba(168, 213, 186, 0.3)'
              }}
            >
              <p className="font-bold text-lg mb-3" style={{ color: '#1B5E20' }}>Test Details:</p>
              <ul className="space-y-2" style={{ color: 'rgba(27, 94, 32, 0.8)' }}>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1B5E20' }}></span>
                  21 randomized questions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1B5E20' }}></span>
                  20-minute time limit
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1B5E20' }}></span>
                  Auto-submission on timeout
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1B5E20' }}></span>
                  Real-time progress tracking
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? "Generating..." : "Generate Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this test? This action cannot be undone and will remove all associated data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => testToDelete && deleteMutation.mutate({ id: testToDelete })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

