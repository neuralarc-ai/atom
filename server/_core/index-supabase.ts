import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import cookieParser from "cookie-parser";
import { registerSupabaseAuthRoutes } from "./supabase-auth";
import { registerRestApiRoutes } from "../api/rest";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Create the Express app
const app = express();

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure cookie parser
app.use(cookieParser());

// Supabase Auth routes under /api/auth/*
registerSupabaseAuthRoutes(app);

// REST API routes
registerRestApiRoutes(app);

// Serve static files in production/Vercel
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  try {
    serveStatic(app);
  } catch (error) {
    console.error('Error serving static files:', error);
    // Don't crash the app if static files can't be served
  }
}

// Export the app for Vercel
export default app;

// Start local server if not in Vercel environment
async function startServer() {
  const server = createServer(app);
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Using Supabase for database and authentication`);
    console.log(`REST API available at http://localhost:${port}/api/`);
  });
}

// Only start server if not in Vercel
if (!process.env.VERCEL) {
  startServer().catch(console.error);
}

