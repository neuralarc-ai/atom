import { createJob } from "../server/db";

const seedJobs = [
  {
    title: "Mobile Developer",
    description: "Develop mobile applications for iOS and Android platforms using modern frameworks and best practices.",
    experience: "1-2 years",
    skills: JSON.stringify(["React Native", "Flutter", "Swift", "Kotlin", "Mobile UI/UX"]),
  },
  {
    title: "Python Developer",
    description: "Backend development using Python frameworks, building scalable APIs and microservices.",
    experience: "1-2 years",
    skills: JSON.stringify(["Python", "Django", "Flask", "FastAPI", "PostgreSQL", "REST APIs"]),
  },
  {
    title: "AWS Expert",
    description: "Cloud infrastructure and DevOps specialist managing AWS services and deployments.",
    experience: "1-2 years",
    skills: JSON.stringify(["AWS", "EC2", "S3", "Lambda", "CloudFormation", "Docker", "Kubernetes"]),
  },
  {
    title: "Social Media Manager",
    description: "Manage social media presence and campaigns across multiple platforms to drive engagement.",
    experience: "1-2 years",
    skills: JSON.stringify(["Content Creation", "Analytics", "Social Media Strategy", "Community Management"]),
  },
  {
    title: "UX/UI Designer",
    description: "Design user interfaces and experiences for web and mobile applications with focus on usability.",
    experience: "1-2 years",
    skills: JSON.stringify(["Figma", "Adobe XD", "Prototyping", "User Research", "Wireframing"]),
  },
  {
    title: "Pre-Sales Specialist",
    description: "Technical sales and client engagement, presenting solutions and supporting the sales process.",
    experience: "1-2 years",
    skills: JSON.stringify(["Sales", "Technical Presentation", "Client Relations", "Solution Architecture"]),
  },
  {
    title: "AI Consultant",
    description: "AI strategy and implementation consulting, helping clients leverage machine learning and AI technologies.",
    experience: "1-2 years",
    skills: JSON.stringify(["Machine Learning", "AI Strategy", "Data Science", "Python", "TensorFlow", "PyTorch"]),
  },
];

async function seed() {
  console.log("Starting seed process...");
  
  for (const job of seedJobs) {
    try {
      await createJob(job);
      console.log(`✓ Created job: ${job.title}`);
    } catch (error) {
      console.error(`✗ Failed to create job: ${job.title}`, error);
    }
  }
  
  console.log("Seed process completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

