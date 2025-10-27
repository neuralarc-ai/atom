import DashboardLayout from "../components/DashboardLayout";
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
import { api } from "@/lib/api";
import { 
  Briefcase, 
  Edit, 
  Plus, 
  Trash2, 
  Wand2, 
  Code,
  Cloud,
  Palette,
  MessageSquare,
  Smartphone,
  Megaphone,
  Brain,
  Sparkles,
  Clock,
  Award,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { JobsPageSkeleton } from "@/components/skeletons/JobsPageSkeleton";

// Job role icon mapping
const getJobIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("front") || lowerTitle.includes("developer")) return Code;
  if (lowerTitle.includes("sales") || lowerTitle.includes("pre-sales")) return Megaphone;
  if (lowerTitle.includes("ai") || lowerTitle.includes("consultant")) return Brain;
  if (lowerTitle.includes("ux") || lowerTitle.includes("ui") || lowerTitle.includes("design")) return Palette;
  if (lowerTitle.includes("aws") || lowerTitle.includes("cloud")) return Cloud;
  if (lowerTitle.includes("python")) return Code;
  if (lowerTitle.includes("social") || lowerTitle.includes("media")) return MessageSquare;
  if (lowerTitle.includes("mobile")) return Smartphone;
  return Briefcase;
};

export default function JobsPage() {
  const queryClient = useQueryClient();
  
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.jobs.list(),
  });
  
  const createMutation = useMutation({
    mutationFn: (data: { title: string; description: string; skills: string[]; experience: string }) => 
      api.jobs.create(data),
    onSuccess: () => {
      toast.success("Job created successfully");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsCreateOpen(false);
      setNewJob({ title: "", description: "", skills: "", experience: "" });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      api.jobs.update(id, data),
    onSuccess: () => {
      toast.success("Job updated successfully");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsEditOpen(false);
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.jobs.delete(id),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateJobDetailsMutation = useMutation({
    mutationFn: (data: { title: string }) => api.ai.generateJobDetails(data),
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
      data: {
        title: editingJob.title,
        description: editingJob.description,
        experience: editingJob.experience,
        skills: editingJob.skills.split(",").map((s: string) => s.trim()),
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob({
      ...job,
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
    });
    setIsEditOpen(true);
  };

  // Show skeleton while loading
  if (isLoading) {
    return <JobsPageSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 bg-gradient-to-br from-[#FFF8F0] via-white to-[#F0F9F4] page-transition">
        {/* Header Section with Stats */}
        <div className="relative">
          {/* Decorative Background Elements */}
          <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-[#FF6347]/10 to-[#C4D82E]/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-gradient-to-tr from-[#A8D5BA]/20 to-[#C4D82E]/10 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6347] to-[#ff8570] flex items-center justify-center shadow-lg">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-[#FF6347] via-[#1B5E20] to-[#C4D82E] bg-clip-text text-transparent">
                    Job Roles
                  </h1>
                  <p className="text-lg text-[#1B5E20]/70 mt-1">Build your dream team with precision hiring</p>
                </div>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#FF6347] to-[#ff8570] text-white hover:shadow-2xl hover:scale-105 transition-all text-lg px-8 py-7 rounded-2xl shadow-xl">
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-[#1B5E20]">Create New Job Role</DialogTitle>
                  <DialogDescription className="text-[#1B5E20]/70">
                    Add a new job position with AI-powered details generation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-[#1B5E20] font-semibold text-lg">Job Title *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="e.g., Senior Full Stack Developer"
                        className="flex-1 border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-lg py-6"
                      />
                      <Button
                        onClick={handleGenerateDetails}
                        disabled={isGenerating || !newJob.title.trim()}
                        className="bg-gradient-to-r from-[#C4D82E] to-[#A8D5BA] text-[#1B5E20] hover:shadow-lg transition-all px-6 rounded-xl"
                      >
                        {isGenerating ? (
                          <>
                            <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-5 w-5 mr-2" />
                            AI Generate
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-[#1B5E20]/60 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Click AI Generate to auto-fill description, skills, and experience
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-[#1B5E20] font-semibold text-lg">Description</Label>
                    <Textarea
                      id="description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      placeholder="Job responsibilities and requirements..."
                      rows={5}
                      className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="skills" className="text-[#1B5E20] font-semibold text-lg">Required Skills *</Label>
                    <Input
                      id="skills"
                      value={newJob.skills}
                      onChange={(e) => setNewJob({ ...newJob, skills: e.target.value })}
                      placeholder="React, Node.js, TypeScript (comma-separated)"
                      className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-base py-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="experience" className="text-[#1B5E20] font-semibold text-lg">Experience Required *</Label>
                    <Input
                      id="experience"
                      value={newJob.experience}
                      onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                      placeholder="e.g., 3-5 years"
                      className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-base py-6"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="border-2 border-[#A8D5BA] text-[#1B5E20] hover:bg-[#A8D5BA]/10 rounded-xl px-6 py-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                    className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white hover:shadow-lg transition-all rounded-xl px-8 py-6"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Job"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-2 border-[#FF6347]/20 bg-gradient-to-br from-white to-[#FF6347]/5 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1B5E20]/70 mb-1">Total Positions</p>
                    <p className="text-4xl font-bold text-[#FF6347]">{jobs.length}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6347] to-[#ff8570] flex items-center justify-center shadow-lg">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#C4D82E]/20 bg-gradient-to-br from-white to-[#C4D82E]/5 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1B5E20]/70 mb-1">Active Hiring</p>
                    <p className="text-4xl font-bold text-[#1B5E20]">{jobs.length}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4D82E] to-[#D4E157] flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-7 w-7 text-[#1B5E20]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#A8D5BA]/20 bg-gradient-to-br from-white to-[#A8D5BA]/5 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#1B5E20]/70 mb-1">Total Skills</p>
                    <p className="text-4xl font-bold text-[#1B5E20]">
                      {jobs.reduce((acc, job) => acc + (Array.isArray(job.skills) ? job.skills.length : 0), 0)}
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A8D5BA] to-[#B2DFDB] flex items-center justify-center shadow-lg">
                    <Zap className="h-7 w-7 text-[#1B5E20]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#1B5E20] border-r-transparent"></div>
            <p className="mt-4 text-[#1B5E20]/70">Loading jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-2 border-dashed border-[#A8D5BA]/50 bg-gradient-to-br from-[#A8D5BA]/5 to-transparent">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6347]/20 to-[#C4D82E]/20 flex items-center justify-center mb-6">
                <Briefcase className="h-10 w-10 text-[#1B5E20]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1B5E20] mb-2">No jobs yet</h3>
              <p className="text-[#1B5E20]/60 mb-6">Create your first job role to get started</p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="bg-gradient-to-r from-[#FF6347] to-[#ff8570] text-white hover:shadow-lg transition-all rounded-xl px-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => {
              const colorSchemes = [
                { 
                  bg: "from-[#FF6347] to-[#ff8570]", 
                  text: "text-[#FF6347]", 
                  icon: "bg-[#FF6347]/10", 
                  border: "border-[#FF6347]/20",
                  cardBg: "from-white to-[#FF6347]/5",
                  glow: "shadow-[#FF6347]/20"
                },
                { 
                  bg: "from-[#1B5E20] to-[#2E7D32]", 
                  text: "text-[#1B5E20]", 
                  icon: "bg-[#1B5E20]/10", 
                  border: "border-[#1B5E20]/20",
                  cardBg: "from-white to-[#1B5E20]/5",
                  glow: "shadow-[#1B5E20]/20"
                },
                { 
                  bg: "from-[#C4D82E] to-[#D4E157]", 
                  text: "text-[#1B5E20]", 
                  icon: "bg-[#C4D82E]/20", 
                  border: "border-[#C4D82E]/30",
                  cardBg: "from-white to-[#C4D82E]/5",
                  glow: "shadow-[#C4D82E]/20"
                },
                { 
                  bg: "from-[#A8D5BA] to-[#B2DFDB]", 
                  text: "text-[#1B5E20]", 
                  icon: "bg-[#A8D5BA]/20", 
                  border: "border-[#A8D5BA]/30",
                  cardBg: "from-white to-[#A8D5BA]/5",
                  glow: "shadow-[#A8D5BA]/20"
                },
              ];
              const scheme = colorSchemes[index % colorSchemes.length];
              const JobIcon = getJobIcon(job.title);

              return (
                <Card
                  key={job.id}
                  className={`group relative overflow-hidden border-2 ${scheme.border} bg-gradient-to-br ${scheme.cardBg} hover:shadow-2xl hover:${scheme.glow} transition-all duration-500 rounded-3xl`}
                >
                  {/* Gradient Header with Floating Icon */}
                  <div className={`h-40 bg-gradient-to-br ${scheme.bg} relative overflow-hidden`}>
                    {/* Animated Background Circles */}
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-700" />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(job)}
                        className="bg-white/95 hover:bg-white text-[#1B5E20] rounded-xl shadow-xl backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(job.id)}
                        className="bg-white/95 hover:bg-white text-[#FF6347] rounded-xl shadow-xl backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6 -mt-12 relative">
                    {/* Floating Icon */}
                    <div
                      className={`w-24 h-24 rounded-3xl ${scheme.icon} flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border-4 border-white backdrop-blur-sm`}
                    >
                      <JobIcon className={`h-12 w-12 ${scheme.text}`} />
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-2xl leading-tight mb-4 text-[#1B5E20] line-clamp-2 min-h-[4rem] group-hover:text-[#FF6347] transition-colors">
                      {job.title}
                    </h3>

                    {/* Experience Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${scheme.icon} mb-4 border border-${scheme.border}`}>
                      <Clock className={`h-4 w-4 ${scheme.text}`} />
                      <span className={`text-sm font-semibold ${scheme.text}`}>{job.experience}</span>
                    </div>

                    {/* Description */}
                    <p className="text-[#1B5E20]/70 text-sm mb-5 line-clamp-3 min-h-[4rem] leading-relaxed">
                      {job.description || "No description provided"}
                    </p>

                    {/* Skills */}
                    <div className="mb-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Award className={`h-4 w-4 ${scheme.text}`} />
                        <span className="text-xs font-semibold text-[#1B5E20]/70 uppercase tracking-wide">Skills Required</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(job.skills) ? job.skills : []).slice(0, 3).map((skill: string, i: number) => (
                          <span
                            key={i}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scheme.icon} ${scheme.text} border ${scheme.border}`}
                          >
                            {skill}
                          </span>
                        ))}
                        {(Array.isArray(job.skills) ? job.skills : []).length > 3 && (
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${scheme.icon} ${scheme.text} border ${scheme.border}`}>
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="pt-4 border-t-2 border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-[#1B5E20]/60">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span className="font-semibold text-[#1B5E20]">{Array.isArray(job.skills) ? job.skills.length : 0}</span> skills
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(job)}
                        className={`${scheme.text} hover:${scheme.icon} rounded-xl font-semibold`}
                      >
                        View Details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-[#1B5E20]">Edit Job Role</DialogTitle>
              <DialogDescription className="text-[#1B5E20]/70">
                Update job position details
              </DialogDescription>
            </DialogHeader>
            {editingJob && (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label htmlFor="edit-title" className="text-[#1B5E20] font-semibold text-lg">Job Title *</Label>
                  <Input
                    id="edit-title"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-lg py-6"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="edit-description" className="text-[#1B5E20] font-semibold text-lg">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingJob.description}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    rows={5}
                    className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-base"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="edit-skills" className="text-[#1B5E20] font-semibold text-lg">Required Skills *</Label>
                  <Input
                    id="edit-skills"
                    value={editingJob.skills}
                    onChange={(e) => setEditingJob({ ...editingJob, skills: e.target.value })}
                    className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-base py-6"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="edit-experience" className="text-[#1B5E20] font-semibold text-lg">Experience Required *</Label>
                  <Input
                    id="edit-experience"
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="border-2 border-[#A8D5BA]/30 focus:border-[#1B5E20] rounded-xl text-base py-6"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="border-2 border-[#A8D5BA] text-[#1B5E20] hover:bg-[#A8D5BA]/10 rounded-xl px-6 py-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white hover:shadow-lg transition-all rounded-xl px-8 py-6"
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

