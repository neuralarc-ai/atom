import { Request, Response, Express } from "express";
import { z } from "zod";
import { getSupabase } from "../_core/supabase";
import { supabaseAuthService } from "../_core/supabase-auth";

/**
 * Simple REST API to replace tRPC functionality
 * Uses Supabase as database and Gemini for AI features
 */

// Helper function to authenticate requests
async function authenticateRequest(req: Request): Promise<any> {
  try {
    return await supabaseAuthService.authenticateRequest(req);
  } catch (error) {
    console.error("[Auth] Authentication failed in authenticateRequest:", error);
    return null;
  }
}

// Helper function to check admin access
function requireAdmin(user: any) {
  if (!user) {
    console.log("[Auth] User is null/undefined");
    throw new Error("Admin access required");
  }
  if (user.role !== "admin") {
    console.log("[Auth] User role is not admin:", user.role);
    throw new Error("Admin access required");
  }
  console.log("[Auth] Admin access granted for:", user.email);
}

/**
 * Register all REST API routes
 */
export function registerRestApiRoutes(app: Express) {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "REST API is running" });
  });

  // Auth routes
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  // Jobs API
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const supabase = getSupabase();
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
      
      if (error) {
        throw error;
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { title, description, experience, skills } = req.body;
      
      if (!title || !description || !experience || !skills) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title,
          description,
          experience,
          skills: JSON.stringify(skills),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  app.put("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { id } = req.params;
      const updateData: any = {};
      
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.experience) updateData.experience = req.body.experience;
      if (req.body.skills) updateData.skills = JSON.stringify(req.body.skills);

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ error: "Failed to update job" });
    }
  });

  app.delete("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { id } = req.params;
      const supabase = getSupabase();
      const { error } = await supabase.from("jobs").delete().eq("id", id);

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ error: "Failed to delete job" });
    }
  });

  // Tests API
  app.get("/api/tests", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const supabase = getSupabase();
      const { data, error } = await supabase.from("tests").select("*").order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  app.get("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const supabase = getSupabase();
      const { data, error } = await supabase.from("tests").select("*").eq("id", id).single();
      
      if (error) {
        throw error;
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching test:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  app.get("/api/tests/short-code/:shortCode", async (req: Request, res: Response) => {
    try {
      const { shortCode } = req.params;
      const supabase = getSupabase();
      const { data, error } = await supabase.from("tests").select("*").eq("short_code", shortCode).single();
      
      if (error) {
        throw error;
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching test by short code:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  app.delete("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { id } = req.params;
      const supabase = getSupabase();
      const { error } = await supabase.from("tests").delete().eq("id", id);

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting test:", error);
      res.status(500).json({ error: "Failed to delete test" });
    }
  });

  // Candidates API
  app.get("/api/candidates", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const supabase = getSupabase();
      const { data, error } = await supabase.from("candidates").select("*").order("started_at", { ascending: false });
      
      if (error) {
        console.error("Supabase error fetching candidates:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} candidates`);
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: "Failed to fetch candidates" });
    }
  });

  app.get("/api/candidates/:id", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { id } = req.params;
      const supabase = getSupabase();
      const { data, error } = await supabase.from("candidates").select("*").eq("id", id).single();
      
      if (error) {
        throw error;
      }
      
      res.json(data);
    } catch (error) {
      console.error("Error fetching candidate:", error);
      res.status(500).json({ error: "Failed to fetch candidate" });
    }
  });

  app.delete("/api/candidates/:id", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { id } = req.params;
      const supabase = getSupabase();
      const { error } = await supabase.from("candidates").delete().eq("id", id);

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting candidate:", error);
      res.status(500).json({ error: "Failed to delete candidate" });
    }
  });

  // Candidate test operations
  app.post("/api/candidates/start", async (req: Request, res: Response) => {
    try {
      const { testId, name, email } = req.body;
      
      if (!testId || !name || !email) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const supabase = getSupabase();
      
      // Check if candidate with this email has already attempted this test
      const { data: existingCandidate } = await supabase
        .from("candidates")
        .select("*")
        .eq("email", email)
        .eq("test_id", testId)
        .single();

      if (existingCandidate) {
        // Block if completed (no reappearance approved)
        if (existingCandidate.status === 'completed' && !existingCandidate.reappearance_approved_at) {
          return res.status(403).json({ error: "You have already completed this test." });
        }
        
        // Block if locked out (no reappearance approved)
        if ((existingCandidate.status === 'locked_out' || existingCandidate.status === 'reappearance_requested') && !existingCandidate.reappearance_approved_at) {
          return res.status(403).json({ error: "You have been locked out of this test. Your reappearance request is pending admin approval." });
        }
        
        // Allow if approved for reappearance - reset their test
        if (existingCandidate.reappearance_approved_at) {
          // Get test details to generate new questions
          const { data: test } = await supabase.from("tests").select("*").eq("id", testId).single();
          if (!test || !test.questions) {
            return res.status(404).json({ error: "Test not found or has no questions" });
          }
          
          // Parse and select 21 random questions
          const allQuestions = JSON.parse(test.questions);
          const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
          const selectedQuestions = shuffled.slice(0, 21);
          
          // Reset candidate for fresh attempt with new questions
          await supabase
            .from("candidates")
            .update({
              status: 'in_progress',
              started_at: new Date(),
              completed_at: null,
              score: null,
              answers: null,
              lockout_reason: null,
              questions: JSON.stringify(selectedQuestions),
              reappearance_approved_at: null, // Clear the approval flag
            })
            .eq("id", existingCandidate.id);
          
          return res.json({ candidateId: existingCandidate.id });
        }
        
        // If in progress, allow to continue with existing questions
        if (existingCandidate.status === 'in_progress') {
          return res.json({ candidateId: existingCandidate.id });
        }
        
        // If we reach here, something unexpected happened - block to be safe
        return res.status(403).json({ error: "Unable to start test. Please contact administrator." });
      }

      // Get test details
      const { data: test } = await supabase.from("tests").select("*").eq("id", testId).single();
      if (!test) {
        return res.status(404).json({ error: "Test not found" });
      }

      // Get the questions from the test (50-question pool)
      if (!test.questions) {
        return res.status(404).json({ error: "Questions not found for this test" });
      }

      // Parse the question pool (50 questions)
      const allQuestions = JSON.parse(test.questions);
      
      // Randomly select 21 questions from the pool
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, 21);

      // Create candidate with their unique set of 21 questions
      const { data: newCandidate, error } = await supabase
        .from("candidates")
        .insert({
          test_id: testId,
          name,
          email,
          questions: JSON.stringify(selectedQuestions),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({ success: true, candidateId: newCandidate.id });
    } catch (error) {
      console.error("Error starting candidate test:", error);
      res.status(500).json({ error: "Failed to start test" });
    }
  });

  app.post("/api/candidates/submit", async (req: Request, res: Response) => {
    try {
      const { candidateId, answers } = req.body;
      
      if (!candidateId || !answers) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const supabase = getSupabase();
      
      // Get candidate
      const { data: candidate, error: candidateError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (candidateError || !candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Get candidate's unique questions
      const questions = JSON.parse(candidate.questions || "[]");
      if (questions.length === 0) {
        return res.status(400).json({ error: "No questions found for candidate" });
      }

      // Calculate score
      let score = 0;
      for (let i = 0; i < questions.length; i++) {
        // Convert letter answer (A, B, C, D) to numeric index (0, 1, 2, 3)
        const correctAnswerIndex = questions[i].correctAnswer.charCodeAt(0) - 'A'.charCodeAt(0);
        if (answers[i] === correctAnswerIndex) {
          score++;
        }
      }

      // Calculate percentage
      const percentage = (score / questions.length) * 100;

      // Update candidate
      const { error: updateError } = await supabase
        .from("candidates")
        .update({
          answers: JSON.stringify(answers),
          score: score,
          total_questions: questions.length,
          status: "completed",
          completed_at: new Date(),
        })
        .eq("id", candidateId);

      if (updateError) {
        throw updateError;
      }

      res.json({ 
        success: true, 
        score, 
        total: questions.length,
        percentage: Math.round(percentage),
        passed: percentage >= 85,
      });
    } catch (error) {
      console.error("Error submitting candidate test:", error);
      res.status(500).json({ error: "Failed to submit test" });
    }
  });

  app.post("/api/candidates/lockout", async (req: Request, res: Response) => {
    try {
      const { candidateId, reason, answers } = req.body;
      
      if (!candidateId || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const supabase = getSupabase();
      
      const { error } = await supabase
        .from("candidates")
        .update({
          status: "locked_out",
          lockout_reason: reason,
          answers: answers ? JSON.stringify(answers) : null,
        })
        .eq("id", candidateId);

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error locking out candidate:", error);
      res.status(500).json({ error: "Failed to lockout candidate" });
    }
  });

  app.post("/api/candidates/request-reappearance", async (req: Request, res: Response) => {
    try {
      const { candidateId } = req.body;
      
      if (!candidateId) {
        return res.status(400).json({ error: "Missing candidate ID" });
      }

      const supabase = getSupabase();
      
      const { error } = await supabase
        .from("candidates")
        .update({
          status: "reappearance_requested",
          reappearance_requested_at: new Date(),
        })
        .eq("id", candidateId);

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error requesting reappearance:", error);
      res.status(500).json({ error: "Failed to request reappearance" });
    }
  });

  app.post("/api/candidates/approve-reappearance", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { candidateId } = req.body;
      
      if (!candidateId) {
        return res.status(400).json({ error: "Missing candidate ID" });
      }

      const supabase = getSupabase();
      
      const { error } = await supabase
        .from("candidates")
        .update({
          status: "in_progress",
          reappearance_approved_at: new Date(),
          reappearance_approved_by: user.id,
          lockout_reason: null,
        })
        .eq("id", candidateId);

      if (error) {
        throw error;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error approving reappearance:", error);
      res.status(500).json({ error: "Failed to approve reappearance" });
    }
  });

  // AI Features - Job Details Generation
  app.post("/api/ai/generate-job-details", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { title } = req.body;
      
      if (!title) {
        return res.status(400).json({ error: "Job title is required" });
      }

      const { generateWithGemini } = await import("../_core/gemini");

      const prompt = `You are an expert HR professional. Based on the job title "${title}", generate a detailed job posting.

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "description": "Detailed 2-3 paragraph job description here",
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "experience": "2-4 years"
}

Be specific and professional in your response.`;

      const response = await generateWithGemini({ 
        prompt,
        model: "gemini-2.5-pro",
      });

      // Clean up the response to extract JSON
      let jsonText = response.trim();
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      try {
        const jobDetails = JSON.parse(jsonText);
        res.json(jobDetails);
      } catch (error) {
        console.error("Failed to parse Gemini response as JSON:", response);
        res.status(500).json({ error: "Failed to generate job details. Please try again." });
      }
    } catch (error) {
      console.error("Error generating job details:", error);
      res.status(500).json({ error: "Failed to generate job details" });
    }
  });

  // AI Features - Test Generation
  app.post("/api/ai/generate-test", async (req: Request, res: Response) => {
    try {
      const user = await authenticateRequest(req);
      requireAdmin(user);

      const { jobId, complexity } = req.body;
      
      if (!jobId || !complexity) {
        return res.status(400).json({ error: "Job ID and complexity are required" });
      }

      const supabase = getSupabase();
      const { generateQuestionsWithGemini } = await import("../_core/gemini");

      // Get job details
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (jobError || !job) {
        return res.status(404).json({ error: "Job not found" });
      }

      // Generate questions using Gemini
      const skillsArray = Array.isArray(job.skills) ? job.skills : JSON.parse(job.skills);
      
      const questions = await generateQuestionsWithGemini({
        jobTitle: job.title,
        jobDescription: job.description,
        skills: skillsArray,
        complexity: complexity,
        count: 21,
      });
      
      try {
        // Convert correctAnswer from index (0-3) to letter (A-D) to match expected format
        const formattedQuestions = questions.map(q => ({
          question: q.question,
          options: q.options,
          correctAnswer: String.fromCharCode(65 + q.correctAnswer), // 0 -> "A", 1 -> "B", etc.
          explanation: q.explanation
        }));

        // Create test
        const { data: newTest, error: testError } = await supabase
          .from("tests")
          .insert({
            job_id: jobId,
            complexity: complexity,
            questions: JSON.stringify(formattedQuestions),
          })
          .select()
          .single();

        if (testError) {
          throw testError;
        }

        // Generate and store short code
        const { generateShortCode } = await import("../urlEncoder");
        const shortCode = generateShortCode(newTest.id);
        
        const { error: updateError } = await supabase
          .from("tests")
          .update({ short_code: shortCode })
          .eq("id", newTest.id);

        if (updateError) {
          console.warn("Failed to update short code:", updateError);
        }
        
        res.json({ success: true, testId: newTest.id, shortCode });
      } catch (error) {
        console.error("Error in test generation:", error);
        res.status(500).json({ error: "Failed to generate test questions. Please try again." });
      }
    } catch (error) {
      console.error("Error generating test:", error);
      res.status(500).json({ error: "Failed to generate test" });
    }
  });
}
