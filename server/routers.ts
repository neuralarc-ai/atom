import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  jobs: router({
    list: publicProcedure.query(async () => {
      const { getAllJobs } = await import("./db");
      return await getAllJobs();
    }),
    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const { getJobById } = await import("./db");
      return await getJobById(input.id);
    }),
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          experience: z.string(),
          skills: z.array(z.string()),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { createJob } = await import("./db");
        await createJob({
          title: input.title,
          description: input.description,
          experience: input.experience,
          skills: JSON.stringify(input.skills),
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          experience: z.string().optional(),
          skills: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { updateJob } = await import("./db");
        const updateData: any = {};
        if (input.title) updateData.title = input.title;
        if (input.description) updateData.description = input.description;
        if (input.experience) updateData.experience = input.experience;
        if (input.skills) updateData.skills = JSON.stringify(input.skills);
        await updateJob(input.id, updateData);
        return { success: true };
      }),
    delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { deleteJob } = await import("./db");
      await deleteJob(input.id);
      return { success: true };
    }),
  }),

  tests: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getAllTests } = await import("./db");
      return await getAllTests();
    }),
    getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
      const { getTestById } = await import("./db");
      return await getTestById(input.id);
    }),
    getByJobId: protectedProcedure.input(z.object({ jobId: z.string() })).query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getTestsByJobId } = await import("./db");
      return await getTestsByJobId(input.jobId);
    }),
    generate: protectedProcedure
      .input(
        z.object({
          jobId: z.string(),
          complexity: z.enum(["low", "medium", "high"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { createTest, getJobById } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");

        // Get job details
        const job = await getJobById(input.jobId);
        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        // Generate questions using LLM
        const skillsArray = JSON.parse(job.skills);
        const prompt = `Generate 21 multiple-choice questions for a ${input.complexity} complexity test for the position of ${job.title}. 

Job Description: ${job.description}
Required Skills: ${skillsArray.join(", ")}
Experience Level: ${job.experience}

For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation

Return the response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Brief explanation"
  }
]

Make sure the questions are relevant to the job role and test the candidate's knowledge of the required skills.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert HR assessment designer. Generate high-quality technical questions." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "test_questions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                        },
                        correctAnswer: { type: "string" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctAnswer", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const parsedQuestions = JSON.parse(contentStr || "{}");

        // Create test
        const result = await createTest({
          jobId: input.jobId,
          complexity: input.complexity,
          questions: JSON.stringify(parsedQuestions.questions),
        });

        // Get the created test ID from the database
        const { getAllTests } = await import("./db");
        const tests = await getAllTests();
        const latestTest = tests[0]; // Most recent test
        
        return { success: true, testId: latestTest?.id || "" };
      }),
  }),

  candidates: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getAllCandidates } = await import("./db");
      return await getAllCandidates();
    }),
    getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getCandidateById } = await import("./db");
      return await getCandidateById(input.id);
    }),
    getByTestId: protectedProcedure.input(z.object({ testId: z.string() })).query(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const { getCandidatesByTestId } = await import("./db");
      return await getCandidatesByTestId(input.testId);
    }),
    start: publicProcedure
      .input(
        z.object({
          testId: z.string(),
          name: z.string(),
          email: z.string().email(),
        })
      )
      .mutation(async ({ input }) => {
        const { createCandidate, getTestById, getJobById } = await import("./db");
        const { invokeLLM } = await import("./_core/llm");

        // Get test and job details
        const test = await getTestById(input.testId);
        if (!test) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Test not found" });
        }

        const job = await getJobById(test.jobId);
        if (!job) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
        }

        // Generate fresh questions for this candidate
        const skillsArray = JSON.parse(job.skills);
        const prompt = `Generate 21 multiple-choice questions for a ${test.complexity} complexity test for the position of ${job.title}. 

Job Description: ${job.description}
Required Skills: ${skillsArray.join(", ")}
Experience Level: ${job.experience}

For each question, provide:
1. The question text
2. Four options
3. The correct answer (0, 1, 2, or 3 for option index)
4. A brief explanation

Return the response as a JSON array with this structure:
[
  {
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": 0,
    "explanation": "Brief explanation"
  }
]

Make sure the questions are relevant to the job role and test the candidate's knowledge of the required skills.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert HR assessment designer. Generate high-quality technical questions." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "test_questions",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                        },
                        correctAnswer: { type: "number" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctAnswer", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const parsedQuestions = JSON.parse(contentStr || "{}");

        // Create candidate with their unique questions
        const result = await createCandidate({
          testId: input.testId,
          name: input.name,
          email: input.email,
          questions: JSON.stringify(parsedQuestions.questions),
        });

        // Get the created candidate ID
        const { getAllCandidates } = await import("./db");
        const candidates = await getAllCandidates();
        const latestCandidate = candidates[0];
        
        return { success: true, candidateId: latestCandidate?.id || "" };
      }),
    submit: publicProcedure
      .input(
        z.object({
          candidateId: z.string(),
          answers: z.array(z.number()),
        })
      )
      .mutation(async ({ input }) => {
        const { updateCandidate, getCandidateById } = await import("./db");

        // Get candidate
        const candidate = await getCandidateById(input.candidateId);
        if (!candidate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Candidate not found" });
        }

        // Get candidate's unique questions
        const questions = JSON.parse(candidate.questions || "[]");
        if (questions.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No questions found for candidate" });
        }

        // Calculate score
        let score = 0;
        for (let i = 0; i < questions.length; i++) {
          if (input.answers[i] === questions[i].correctAnswer) {
            score++;
          }
        }

        // Calculate percentage
        const percentage = (score / questions.length) * 100;

        // Update candidate
        await updateCandidate(input.candidateId, {
          answers: JSON.stringify(input.answers),
          score: score.toString(),
          completedAt: new Date(),
        });

        return { 
          success: true, 
          score, 
          total: questions.length,
          percentage: Math.round(percentage),
          passed: percentage >= 85,
        };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { deleteCandidate } = await import("./db");
        await deleteCandidate(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
