import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function TestPage() {
  const { testId } = useParams();
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutReason, setLockoutReason] = useState<string>("");
  const [showRequestSuccess, setShowRequestSuccess] = useState(false);
  const [existingCandidateStatus, setExistingCandidateStatus] = useState<{
    status: string;
    candidateId: string;
    lockoutReason?: string;
  } | null>(null);

  const { data: test } = useQuery<{ id: string; job_id: string; questions: string; complexity: 'low' | 'medium' | 'high'; short_code: string; created_at: string }>({
    queryKey: ['tests', testId],
    queryFn: () => api.tests.getById(testId || ""),
    enabled: !!testId,
  });
  const { data: candidate, isLoading: isLoadingCandidate, isError: isCandidateError, error: candidateError } = useQuery<{ id: string; test_id: string; name: string; email: string; questions: string; status: string; answers: string | null; score: number | null; total_questions: number | null; lockout_reason: string | null; reappearance_approved_at: string | null; created_at: string; started_at: string | null; completed_at: string | null }>({
    queryKey: ['candidates', candidateId],
    queryFn: () => api.candidates.getPublic(candidateId || ""),
    enabled: !!candidateId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always fetch fresh data
    retry: 2, // Retry up to 2 times on failure
  });

  const startMutation = useMutation({
    mutationFn: ({ testId, name, email }: { testId: string; name: string; email: string }) =>
      api.candidates.start({ testId, name, email }),
    onSuccess: (data: { candidateId: string }) => {
      setCandidateId(data.candidateId);
      setHasStarted(true);
      // Set time based on test complexity
      if (test) {
        const duration = (test.complexity === 'low') ? 20 * 60 : 45 * 60;
        setTimeLeft(duration);
      }
      // Clear existing candidate status on successful start
      setExistingCandidateStatus(null);
    },
    onError: (error: any) => {
      console.error("Test start error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      
      // If it's a lockout error with status info, store it
      if (error.data?.status && error.data?.candidateId) {
        setExistingCandidateStatus({
          status: error.data.status,
          candidateId: error.data.candidateId,
        });
      } else if (error.response?.data) {
        // Handle API error response
        const errorMsg = error.response.data.error || error.message || "Failed to start test. Please try again.";
        alert(errorMsg);
      } else {
        alert(`Failed to start test: ${error.message || "Unknown error occurred"}`);
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: ({ candidateId, answers }: { candidateId: string; answers: number[] }) =>
      api.candidates.submit({ candidateId, answers }),
    onSuccess: (data: { success: boolean; score: number; total: number; percentage: number; passed: boolean }) => {
      setResult(data);
      setIsSubmitting(false);
    },
  });

  const lockoutMutation = useMutation({
    mutationFn: ({ candidateId, reason, answers }: { candidateId: string; reason: string; answers: number[] }) =>
      api.candidates.lockout({ candidateId, reason, answers }),
    onSuccess: () => {
      // Lockout successful, show lockout screen
    },
  });

  const requestReappearanceMutation = useMutation({
    mutationFn: ({ candidateId }: { candidateId: string }) =>
      api.candidates.requestReappearance({ candidateId }),
    onSuccess: () => {
      setShowRequestSuccess(true);
      // Update status to reappearance_requested
      if (existingCandidateStatus) {
        setExistingCandidateStatus({
          ...existingCandidateStatus,
          status: 'reappearance_requested',
        });
      }
    },
  });

  // Check for existing candidate status when email changes
  useEffect(() => {
    const checkCandidateStatus = async () => {
      if (!email || !testId) return;

      try {
        const response = await api.candidates.checkStatus({ testId, email }) as { exists: boolean; candidate?: { id: string; status: string; lockout_reason?: string; reappearance_approved_at?: string | null } };
        if (response.exists && response.candidate) {
          const candidate = response.candidate;
          // Only show alert for locked out or reappearance requested (not for completed or in_progress)
          if ((candidate.status === 'locked_out' || candidate.status === 'reappearance_requested') && !candidate.reappearance_approved_at) {
            setExistingCandidateStatus({
              status: candidate.status,
              candidateId: candidate.id,
              lockoutReason: candidate.lockout_reason,
            });
          } else if (candidate.status === 'completed' && !candidate.reappearance_approved_at) {
            setExistingCandidateStatus({
              status: 'completed',
              candidateId: candidate.id,
            });
          }
        }
      } catch (error) {
        // Ignore errors - candidate might not exist
        console.log("No existing candidate found");
      }
    };

    checkCandidateStatus();
  }, [email, testId]);

  useEffect(() => {
    if (!hasStarted || result || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, result, timeLeft]);

  useEffect(() => {
    // Only activate lockout detection if test has started, candidate data is loaded, and questions are ready
    const questionsReady = candidate?.questions ? JSON.parse(candidate.questions).length > 0 : false;
    if (!hasStarted || result || isLocked || !candidateId || !questionsReady) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !isLocked) {
        setIsLocked(true);
        setLockoutReason("You switched tabs or minimized the browser window");
        // Submit with locked_out status
        if (candidateId) {
          lockoutMutation.mutate({ 
            candidateId, 
            reason: "tab_switch",
            answers 
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasStarted, result, isLocked, candidateId, candidate]);

  const questions = candidate?.questions ? JSON.parse(candidate.questions) : [];

  const handleStart = () => {
    if (!name || !email) {
      alert("Please fill in all fields");
      return;
    }

    // Start the test immediately
    startMutation.mutate({ testId: testId || "", name, email });
  };

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    submitMutation.mutate({ candidateId: candidateId || "", answers });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;


  // Keyboard navigation
  useEffect(() => {
    if (!hasStarted || isLocked || result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const questions = candidate?.questions ? JSON.parse(candidate.questions) : [];
      
      // Arrow Left - Previous question
      if (e.key === 'ArrowLeft' && currentQuestion > 0) {
        e.preventDefault();
        setCurrentQuestion(currentQuestion - 1);
      }
      // Arrow Right - Next question
      else if (e.key === 'ArrowRight' && currentQuestion < questions.length - 1) {
        e.preventDefault();
        setCurrentQuestion(currentQuestion + 1);
      }
      // Enter - Submit if on last question and all answered
      else if (e.key === 'Enter' && currentQuestion === questions.length - 1) {
        if (answers.filter(a => a !== undefined).length === questions.length) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isLocked, result, currentQuestion, answers, candidate]);

  // Show lockout screen if locked
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl space-y-4">
            {/* Success Notification */}
            {showRequestSuccess && (
              <Card className="border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg animate-in slide-in-from-top">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-500">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-green-900">Request Submitted Successfully!</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Your reappearance request has been sent to the admin. You will be notified once it's reviewed.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lockout Card */}
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-red-600" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-red-600 mb-3">Test Locked</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    Your test has been terminated
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
                  <p className="text-lg text-red-700 font-medium mb-4">
                    Reason: {lockoutReason}
                  </p>
                  <p className="text-base text-muted-foreground">
                    You violated the test rules by switching tabs, minimizing the browser, or changing focus during the assessment.
                  </p>
                </div>
                <div className="pt-6 border-t space-y-4">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    If you believe this was a mistake or you had a technical issue, you can request to retake the test.
                    An admin will review your request.
                  </p>
                  <Button
                    onClick={() => requestReappearanceMutation.mutate({ candidateId: candidateId || "" })}
                    disabled={requestReappearanceMutation.isPending}
                    className="gradient-coral text-white"
                  >
                    {requestReappearanceMutation.isPending ? "Requesting..." : "Request Reappearance"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-0 shadow-2xl">
          <CardContent className="p-12">
            {result.passed ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full gradient-lime flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gradient mb-3">Congratulations!</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    You have successfully passed the assessment
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                  <div className="text-6xl font-bold text-green-600 mb-2">
                    {result.percentage}%
                  </div>
                  <p className="text-lg text-green-700 font-medium">
                    {result.score} out of {result.total} correct
                  </p>
                </div>
                <div className="pt-6 border-t">
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Thank you for taking the time to complete this assessment. Your performance has been
                    recorded and our team at <span className="font-semibold text-[#FF6347]">Neural Arc Inc</span> will
                    review your results. We will be in touch with you shortly regarding the next steps.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Visit us at <a href="https://neuralarc.ai" className="text-[#FF6347] hover:underline font-medium">neuralarc.ai</a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto rounded-full gradient-coral flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gradient mb-3">Thank You</h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    We appreciate you taking the assessment
                  </p>
                </div>
                <div className="p-8 rounded-3xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
                  <div className="text-6xl font-bold text-orange-600 mb-2">
                    {result.percentage}%
                  </div>
                  <p className="text-lg text-orange-700 font-medium">
                    {result.score} out of {result.total} correct
                  </p>
                </div>
                <div className="pt-6 border-t">
                  <p className="text-lg font-medium text-muted-foreground mb-4">
                    Better luck next time. You did not make it this time.
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    While your score did not meet the passing threshold, we encourage you to continue
                    developing your skills. Thank you for your interest in this opportunity from{" "}
                    <span className="font-semibold text-[#FF6347]">Neural Arc Inc</span>. We wish you
                    success in your future endeavors.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Visit us at <a href="https://neuralarc.ai" className="text-[#FF6347] hover:underline font-medium">neuralarc.ai</a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Show loading state while candidate data is being fetched after starting test
  if (hasStarted && isLoadingCandidate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-300 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="animate-spin h-6 w-6 border-3 border-lime-600 border-t-transparent rounded-full" />
                <span className="font-bold text-lg text-lime-900">Preparing Your Test...</span>
              </div>
              <p className="text-sm text-lime-800">
                We are loading your questions. Please wait a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state if candidate data failed to load
  if (hasStarted && isCandidateError) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-600 mb-3">Failed to Load Test</h1>
                <p className="text-muted-foreground mb-4">
                  We encountered an error while loading your test questions.
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Error: {candidateError?.message || "Unknown error"}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  className="gradient-coral text-white"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasStarted && questions.length > 0) {
    const question = questions[currentQuestion];
    const isAnswered = answers[currentQuestion] !== undefined;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9]">
        <div className="bg-white/80 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#grad-header-logo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="url(#grad-header-logo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="url(#grad-header-logo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <defs>
                    <linearGradient id="grad-header-logo" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF6347"/>
                      <stop offset="1" stopColor="#C4D82E"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <h1 className="text-xl font-bold">Atom</h1>
                  <p className="text-sm text-muted-foreground">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="font-mono text-lg font-bold text-orange-600">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-0 shadow-xl mb-6">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-full gradient-lime flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold leading-relaxed">{question.question}</h2>
                </div>
              </div>

              <div className="space-y-4">
                {question.options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-6 rounded-2xl text-left transition-all duration-200 border-2 ${
                      answers[currentQuestion] === index
                        ? "border-[#FF6347] bg-gradient-to-r from-orange-50 to-red-50 shadow-lg scale-[1.02]"
                        : "border-gray-200 bg-white hover:border-[#C4D82E] hover:bg-gradient-to-r hover:from-lime-50 hover:to-yellow-50 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          answers[currentQuestion] === index
                            ? "gradient-coral text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {answers[currentQuestion] === index ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-current" />
                        )}
                      </div>
                      <span className="text-lg font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-8"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>
                {answers.filter((a) => a !== undefined).length} of {questions.length} answered
              </span>
            </div>

            {currentQuestion === questions.length - 1 ? (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 gradient-coral text-white"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!isAnswered}
                className="px-8 gradient-lime text-white"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5EE] via-[#F5F5DC] to-[#E8F5E9] flex flex-col items-center justify-center p-4">
      <Card className={`w-full max-w-md border-0 shadow-2xl ${startMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <svg className="w-20 h-20 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#grad-test-logo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="url(#grad-test-logo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="url(#grad-test-logo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="grad-test-logo" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FF6347"/>
                  <stop offset="1" stopColor="#C4D82E"/>
                </linearGradient>
              </defs>
            </svg>
            <h1 className="text-3xl font-bold text-gradient mb-2">Atom</h1>
            <p className="text-muted-foreground">Assessment Test</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                disabled={startMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                disabled={startMutation.isPending}
              />
            </div>



            <div className="p-6 rounded-2xl bg-gradient-to-r from-mint-50 to-green-50 border-2 border-[#A8D5BA]">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#A8D5BA]" />
                Test Information
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA]" />
                  21 questions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA]" />
                  {test?.complexity === 'low' ? '20' : '45'} minute time limit
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA]" />
                  Cannot pause or refresh
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA]" />
                  Auto-submit on timeout
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300">
                <h3 className="font-bold text-lg mb-3 text-orange-900 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Important Warning
                </h3>
                <ul className="space-y-2 text-sm text-orange-800">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                    <span>Do NOT minimize the browser window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                    <span>Do NOT close or refresh the page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                    <span>Do NOT switch tabs or change browser focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 flex-shrink-0" />
                    <span className="font-semibold">Your test will be AUTOMATICALLY TERMINATED if you violate any of these rules</span>
                  </li>
                </ul>
              </div>
              
              {startMutation.isPending ? (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-lime-50 to-green-50 border-2 border-lime-300 text-center">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="animate-spin h-6 w-6 border-3 border-lime-600 border-t-transparent rounded-full" />
                    <span className="font-bold text-lg text-lime-900">Preparing Your Test...</span>
                  </div>
                  <p className="text-sm text-lime-800">
                    We are generating personalized questions for you. This may take a few moments.
                  </p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full h-12 gradient-coral text-white text-lg"
                  onClick={handleStart}
                  disabled={!name || !email || startMutation.isPending}
                >
                  I Understand, Start Test
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
