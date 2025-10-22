import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useRoute } from "wouter";

export default function TestPage() {
  const [, params] = useRoute("/test/:testId");
  const testId = params?.testId || "";

  const [step, setStep] = useState<"info" | "test" | "complete">("info");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds

  const { data: test } = trpc.tests.getById.useQuery({ id: testId });
  const startMutation = trpc.candidates.start.useMutation({
    onSuccess: (data) => {
      setCandidateId(data.candidateId);
      setStep("test");
    },
  });
  const submitMutation = trpc.candidates.submit.useMutation({
    onSuccess: () => {
      setStep("complete");
    },
  });

  const questions = test ? JSON.parse(test.questions) : [];

  // Timer effect
  useEffect(() => {
    if (step !== "test" || timeLeft <= 0) return;

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
  }, [step, timeLeft]);

  // Prevent navigation during test
  useEffect(() => {
    if (step !== "test") return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [step]);

  const handleStart = () => {
    if (!name || !email) return;
    startMutation.mutate({ testId, name, email });
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
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
    submitMutation.mutate({ candidateId, answers });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading test...</p>
      </div>
    );
  }

  if (step === "info") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{APP_TITLE}</CardTitle>
            <CardDescription>Please enter your details to begin the test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p className="font-medium">Test Information:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {questions.length} questions</li>
                <li>• 20-minute time limit</li>
                <li>• Cannot pause or refresh</li>
                <li>• Auto-submit on timeout</li>
              </ul>
            </div>
            <Button
              className="w-full"
              onClick={handleStart}
              disabled={!name || !email || startMutation.isPending}
            >
              {startMutation.isPending ? "Starting..." : "Start Test"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
            <p className="text-center text-muted-foreground">
              Thank you for completing the test. Our team will get back to you shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-2 text-lg font-bold">
              <Clock className="h-5 w-5" />
              <span className={timeLeft < 60 ? "text-destructive" : ""}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer}>
              {currentQ.options.map((option: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent cursor-pointer"
                >
                  <RadioGroupItem value={String.fromCharCode(65 + idx)} id={`option-${idx}`} />
                  <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Test"}
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

