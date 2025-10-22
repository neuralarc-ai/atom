import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Briefcase, Edit, Plus, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function JobsPage() {
  const { data: jobs = [], isLoading, refetch } = trpc.jobs.list.useQuery();
  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job created successfully");
      refetch();
      setIsCreateOpen(false);
      setNewJob({ title: "", description: "", skills: "", experience: "" });
    },
  });
  const updateMutation = trpc.jobs.update.useMutation({
    onSuccess: () => {
      toast.success("Job updated successfully");
      refetch();
      setIsEditOpen(false);
    },
  });
  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      toast.success("Job deleted successfully");
      refetch();
    },
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateJobDetailsMutation = trpc.jobs.generateJobDetails.useMutation({
    onSuccess: (data) => {
      setNewJob({
        ...newJob,
        description: data.description,
        skills: data.skills.join(", "),
        experience: data.experience,
      });
      setIsGenerating(false);
      toast.success("Job details generated successfully!");
    },
    onError: () => {
      setIsGenerating(false);
      toast.error("Failed to generate job details");
    },
  });

  const handleGenerateDetails = () => {
    if (!newJob.title.trim()) {
      toast.error("Please enter a job title first");
      return;
    }
    setIsGenerating(true);
    generateJobDetailsMutation.mutate({ title: newJob.title });
  };
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    skills: "",
    experience: "",
  });

  const handleCreate = () => {
    if (!newJob.title || !newJob.skills || !newJob.experience) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      ...newJob,
      skills: newJob.skills.split(",").map(s => s.trim()),
    });
  };

  const handleUpdate = () => {
    if (!editingJob) return;
    updateMutation.mutate({
      id: editingJob.id,
      title: editingJob.title,
      description: editingJob.description,
      experience: editingJob.experience,
      skills: editingJob.skills.split(",").map((s: string) => s.trim()),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        <div className="flex items-center justify-between">
          <div className="relative">
            <div className="absolute inset-0 gradient-coral opacity-10 rounded-3xl blur-3xl" />
            <div className="relative">
              <h1 className="text-5xl font-bold tracking-tight text-gradient mb-3">Jobs</h1>
              <p className="text-muted-foreground text-xl">Manage job roles and requirements</p>
            </div>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 gradient-coral text-white shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-5 w-5" />
                Add Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Job</DialogTitle>
                <DialogDescription>Add a new job role to the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Job Title *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateDetails}
                      disabled={isGenerating || !newJob.title.trim()}
                      className="gap-2"
                    >
                      <Wand2 className="h-4 w-4" />
                      {isGenerating ? "Generating..." : "Auto-generate"}
                    </Button>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., Senior Python Developer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Enter a title and click Auto-generate to create description and skills using AI</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Job description and responsibilities"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills *</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Python, Django, REST APIs"
                    value={newJob.skills}
                    onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Required *</Label>
                  <Input
                    id="experience"
                    placeholder="e.g., 3-5 years"
                    value={newJob.experience}
                    onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="gradient-coral text-white"
                >
                  {createMutation.isPending ? "Creating..." : "Create Job"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="bento-card border-0 shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Briefcase className="h-20 w-20 text-muted-foreground/30 mb-4" />
              <p className="text-xl font-medium mb-2">No jobs yet</p>
              <p className="text-muted-foreground text-center mb-6">
                Create your first job role to get started
              </p>
              <Button onClick={() => setIsCreateOpen(true)} className="gradient-coral text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, idx) => {
              const gradients = ["gradient-coral", "gradient-lime", "gradient-mint"];
              const colors = ["#FF6347", "#C4D82E", "#A8D5BA"];
              const gradient = gradients[idx % 3];
              const color = colors[idx % 3];

              return (
                <Card
                  key={job.id}
                  className="bento-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
                >
                  <div className={`h-3 ${gradient}`} />
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold mb-2 group-hover:text-[#FF6347] transition-colors">
                          {job.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {job.description || "No description provided"}
                        </p>
                      </div>
                      <div className={`p-3 rounded-2xl ${gradient} shadow-md flex-shrink-0`}>
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.split(",").map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${color}20`,
                                color: color,
                              }}
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Experience
                        </p>
                        <p className="text-sm font-medium">{job.experience}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => {
                          setEditingJob(job);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(job.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Edit Job</DialogTitle>
              <DialogDescription>Update job role details</DialogDescription>
            </DialogHeader>
            {editingJob && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title</Label>
                  <Input
                    id="edit-title"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingJob.description}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-skills">Required Skills</Label>
                  <Input
                    id="edit-skills"
                    value={editingJob.skills}
                    onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-experience">Experience Required</Label>
                  <Input
                    id="edit-experience"
                    value={editingJob.experience}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, experience: e.target.value })
                    }
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="gradient-coral text-white"
              >
                {updateMutation.isPending ? "Updating..." : "Update Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
