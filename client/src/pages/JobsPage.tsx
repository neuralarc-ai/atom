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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Briefcase, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function JobsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    experience: "",
    skills: "",
  });

  const utils = trpc.useUtils();
  const { data: jobs = [], isLoading } = trpc.jobs.list.useQuery();
  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
      toast.success("Job created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.jobs.update.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      setIsEditOpen(false);
      setEditingJob(null);
      resetForm();
      toast.success("Job updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Job deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", experience: "", skills: "" });
  };

  const handleCreate = () => {
    const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    createMutation.mutate({
      title: formData.title,
      description: formData.description,
      experience: formData.experience,
      skills,
    });
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    const skills = JSON.parse(job.skills);
    setFormData({
      title: job.title,
      description: job.description,
      experience: job.experience,
      skills: skills.join(", "),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    const skills = formData.skills.split(",").map((s) => s.trim()).filter(Boolean);
    updateMutation.mutate({
      id: editingJob.id,
      title: formData.title,
      description: formData.description,
      experience: formData.experience,
      skills,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Roles</h1>
            <p className="text-muted-foreground">Manage job positions and requirements</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No jobs yet</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first job role</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const skills = JSON.parse(job.skills);
              return (
                <Card key={job.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{job.title}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(job.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>{job.experience}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Job Role</DialogTitle>
            <DialogDescription>Add a new job position to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Senior Developer"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Job description and responsibilities"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="experience">Experience Range</Label>
              <Input
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 1-2 years"
              />
            </div>
            <div>
              <Label htmlFor="skills">Required Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., React, TypeScript, Node.js"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Job Role</DialogTitle>
            <DialogDescription>Update job position details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-experience">Experience Range</Label>
              <Input
                id="edit-experience"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-skills">Required Skills (comma-separated)</Label>
              <Input
                id="edit-skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

