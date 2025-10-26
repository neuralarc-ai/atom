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
import { api } from "@/lib/api";
import { ClipboardList, Copy, Plus, Trash2, FileText, Clock, Target, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { generateShortTestUrl } from "@/lib/urlEncoder";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TestsPageSkeleton } from "@/components/skeletons/TestsPageSkeleton";

export default function TestsPage() {
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [complexity, setComplexity] = useState<"low" | "medium" | "high">("medium");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.jobs.list(),
  });
  const { data: tests = [], isLoading } = useQuery({
    queryKey: ['tests'],
    queryFn: () => api.tests.list(),
  });

  const generateMutation = useMutation({
    mutationFn: ({ jobId, complexity }: { jobId: string; complexity: "low" | "medium" | "high" }) => 
      api.tests.generate({ jobId, complexity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      setIsGenerateOpen(false);
      toast.success("Test generated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => api.tests.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      setDeleteDialogOpen(false);
      setTestToDelete(null);
      toast.success("Test deleted successfully");
    },
    onError: (error: any) => {
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
    const link = generateShortTestUrl(testId);
    navigator.clipboard.writeText(link);
    toast.success("Short test link copied to clipboard");
  };

  // Color mapping for complexity levels
  const complexityColors = {
    low: { bg: "#C4D82E", text: "#1B5E20", label: "Easy" },
    medium: { bg: "#FF6347", text: "#FFFFFF", label: "Medium" },
    high: { bg: "#1B5E20", text: "#FFFFFF", label: "Hard" }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <TestsPageSkeleton />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 page-transition">
        {/* Header Section with Gradient */}
        <div 
          className="relative overflow-hidden rounded-3xl p-8"
          style={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #A8D5BA 100%)'
          }}
        >
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm"
                style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
              >
                <FileText className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">Assessment Tests</h1>
                <p className="text-white/90 text-lg">AI-powered candidate evaluation</p>
              </div>
            </div>
            <Button 
              onClick={() => setIsGenerateOpen(true)}
              className="bg-white text-[#1B5E20] hover:bg-white/90 font-semibold px-6 py-6 text-lg rounded-xl shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Test
            </Button>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        </div>

        {/* Stats Bar */}
        {tests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 99, 71, 0.1) 0%, rgba(255, 99, 71, 0.05) 100%)',
                border: '2px solid rgba(255, 99, 71, 0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#FF6347' }}>Total Tests</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#FF6347' }}>{tests.length}</p>
                </div>
                <FileText className="h-10 w-10" style={{ color: '#FF6347', opacity: 0.5 }} />
              </div>
            </div>
            
            <div 
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.1) 0%, rgba(27, 94, 32, 0.05) 100%)',
                border: '2px solid rgba(27, 94, 32, 0.2)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1B5E20' }}>Active Jobs</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#1B5E20' }}>{jobs.length}</p>
                </div>
                <Target className="h-10 w-10" style={{ color: '#1B5E20', opacity: 0.5 }} />
              </div>
            </div>
            
            <div 
              className="p-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(196, 216, 46, 0.1) 0%, rgba(196, 216, 46, 0.05) 100%)',
                border: '2px solid rgba(196, 216, 46, 0.3)'
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1B5E20' }}>Avg. Duration</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#1B5E20' }}>
                    {tests.length > 0 
                      ? Math.round(tests.reduce((sum, t) => sum + (t.complexity === 'low' ? 20 : 45), 0) / tests.length)
                      : 0} min
                  </p>
                </div>
                <Clock className="h-10 w-10" style={{ color: '#C4D82E', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        )}

        {/* Tests Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#1B5E20' }}></div>
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          </div>
        ) : tests.length === 0 ? (
          <div 
            className="rounded-3xl p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 213, 186, 0.1) 0%, rgba(196, 216, 46, 0.05) 100%)',
              border: '2px dashed rgba(168, 213, 186, 0.3)'
            }}
          >
            <div 
              className="inline-flex p-6 rounded-full mb-6"
              style={{ backgroundColor: 'rgba(168, 213, 186, 0.2)' }}
            >
              <ClipboardList className="h-16 w-16" style={{ color: '#1B5E20' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#1B5E20' }}>No tests generated yet</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Create your first AI-powered assessment test
            </p>
            <Button 
              onClick={() => setIsGenerateOpen(true)}
              className="px-8 py-6 text-lg rounded-xl font-semibold"
              style={{ backgroundColor: '#FF6347' }}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Test
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => {
              const job = jobs.find((j) => j.id === test.job_id);
              const questions = JSON.parse(test.questions);
              const colorScheme = complexityColors[test.complexity];
              
              return (
                <div
                  key={test.id}
                  className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'white',
                    border: '2px solid rgba(168, 213, 186, 0.2)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {/* Gradient Header */}
                  <div 
                    className="h-32 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${colorScheme.bg} 0%, ${colorScheme.bg}dd 100%)`
                    }}
                  >
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-6 translate-y-6"></div>
                    </div>
                    
                    {/* Floating Icon */}
                    <div 
                      className="absolute -bottom-6 left-6 p-4 rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: 'white' }}
                    >
                      <FileText className="h-8 w-8" style={{ color: colorScheme.bg }} />
                    </div>
                    
                    {/* Complexity Badge */}
                    <div className="absolute top-4 right-4">
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: colorScheme.text,
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        {colorScheme.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 pt-10">
                    <h3 className="font-bold text-lg mb-2 truncate" style={{ color: '#1B5E20' }}>
                      {job?.title || "Unknown Job"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Created {new Date(test.created_at).toLocaleDateString()}
                    </p>
                    
                    {/* Test Info */}
                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" style={{ color: '#1B5E20' }} />
                        <span className="font-medium">{questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" style={{ color: '#1B5E20' }} />
                        <span className="font-medium">{test.complexity === 'low' ? '20' : '45'} min</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-lg font-medium"
                        onClick={() => copyTestLink(test.id)}
                        style={{ 
                          borderColor: colorScheme.bg,
                          color: colorScheme.bg
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => {
                          setTestToDelete(test.id);
                          setDeleteDialogOpen(true);
                        }}
                        style={{ borderColor: '#FF6347', color: '#FF6347' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Generate Dialog - Redesigned */}
      <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(168, 213, 186, 0.2)' }}
              >
                <Sparkles className="h-6 w-6" style={{ color: '#1B5E20' }} />
              </div>
              <div>
                <DialogTitle className="text-2xl">Generate Assessment Test</DialogTitle>
                <DialogDescription className="text-base">
                  Create AI-powered questions tailored to your job role
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Job Selection */}
            <div className="space-y-2">
              <Label htmlFor="job" className="text-base font-semibold" style={{ color: '#1B5E20' }}>
                Job Role
              </Label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger 
                  id="job" 
                  className="h-12 rounded-xl text-base"
                  style={{ borderColor: 'rgba(168, 213, 186, 0.3)' }}
                >
                  <SelectValue placeholder="Select a job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id} className="text-base py-3">
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Complexity Selection */}
            <div className="space-y-2">
              <Label htmlFor="complexity" className="text-base font-semibold" style={{ color: '#1B5E20' }}>
                Difficulty Level
              </Label>
              <Select
                value={complexity}
                onValueChange={(value: any) => setComplexity(value)}
              >
                <SelectTrigger 
                  id="complexity" 
                  className="h-12 rounded-xl text-base"
                  style={{ borderColor: 'rgba(168, 213, 186, 0.3)' }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-base py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#C4D82E' }}></div>
                      Easy - Basic concepts and fundamentals
                    </div>
                  </SelectItem>
                  <SelectItem value="medium" className="text-base py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF6347' }}></div>
                      Medium - Intermediate knowledge required
                    </div>
                  </SelectItem>
                  <SelectItem value="high" className="text-base py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#1B5E20' }}></div>
                      Hard - Advanced expertise needed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Details Card */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 213, 186, 0.15) 0%, rgba(196, 216, 46, 0.1) 100%)',
                border: '2px solid rgba(168, 213, 186, 0.3)'
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5" style={{ color: '#1B5E20' }} />
                <h4 className="font-bold text-lg" style={{ color: '#1B5E20' }}>Test Configuration</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <FileText className="h-5 w-5 mb-2" style={{ color: '#1B5E20' }} />
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B5E20' }}>21</p>
                </div>
                
                <div 
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <Clock className="h-5 w-5 mb-2" style={{ color: '#1B5E20' }} />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold" style={{ color: '#1B5E20' }}>{complexity === 'low' ? '20' : '45'} min</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1B5E20' }}></div>
                  <p className="text-sm" style={{ color: 'rgba(27, 94, 32, 0.8)' }}>
                    Questions are randomized for each attempt
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1B5E20' }}></div>
                  <p className="text-sm" style={{ color: 'rgba(27, 94, 32, 0.8)' }}>
                    Auto-submission when time expires
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#1B5E20' }}></div>
                  <p className="text-sm" style={{ color: 'rgba(27, 94, 32, 0.8)' }}>
                    Real-time progress tracking enabled
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsGenerateOpen(false)}
              className="rounded-xl px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={generateMutation.isPending}
              className="rounded-xl px-6 font-semibold"
              style={{ backgroundColor: '#FF6347' }}
            >
              {generateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Test
                </>
              )}
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

