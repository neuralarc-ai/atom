import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { registerSupabaseAuthRoutes } from "./supabase-auth";
import { registerRestApiRoutes } from "../api/rest";

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

console.log('[Server] Initializing Express app...');
console.log('[Server] Vercel environment:', process.env.VERCEL);
console.log('[Server] Node env:', process.env.NODE_ENV);
console.log('[Server] All environment variables:', Object.keys(process.env));
console.log('[Server] Has SUPABASE env vars:', {
  URL: !!process.env.VITE_SUPABASE_URL,
  SERVICE_KEY: !!process.env.VITE_SUPABASE_SERVICE_KEY,
  ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY
});

// Configure body parser with larger size limit for file uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Configure cookie parser
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Diagnostic endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  const allEnv = Object.keys(process.env);
  const supabaseVars = allEnv.filter(k => k.includes('SUPABASE'));
  res.json({
    allEnvCount: allEnv.length,
    supabaseVars: supabaseVars.reduce((acc, key) => {
      const value = process.env[key];
      acc[key] = value ? `${value.substring(0, 20)}...` : 'missing';
      return acc;
    }, {} as Record<string, string>),
    raw: {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
      VITE_SUPABASE_SERVICE_KEY: !!process.env.VITE_SUPABASE_SERVICE_KEY,
    }
  });
});

// Supabase Auth routes under /api/auth/*
try {
  console.log('[Server] Registering Supabase auth routes...');
  registerSupabaseAuthRoutes(app);
  console.log('[Server] Supabase auth routes registered successfully');
} catch (error) {
  console.error('[Server] Error registering Supabase auth routes:', error);
}

// REST API routes
try {
  console.log('[Server] Registering REST API routes...');
  registerRestApiRoutes(app);
  console.log('[Server] REST API routes registered successfully');
} catch (error) {
  console.error('[Server] Error registering REST API routes:', error);
}

// Serve static files in production (for Vercel and other production environments)
// This must be registered BEFORE error handling middleware
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "..", "..", "dist", "public");
  
  console.log('[Server] Setting up static file serving from:', distPath);
  
  // Serve static files with a prefix to avoid conflicts with API routes
  app.use(express.static(distPath));
}

// Add error handling middleware (must be after routes, before catch-all)
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[Server] Express error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Catch-all handler for SPA routing - must be absolutely last
if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "..", "..", "dist", "public");
  
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

console.log('[Server] Express app initialized successfully');

// Export the app for Vercel
export default app;

// Start local server if not in Vercel environment
async function startServer() {
  const server = createServer(app);
  
  // Serve static files from dist/public
  // NOTE: For local development, vite should be run separately
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distPath = path.resolve(__dirname, "..", "..", "dist", "public");
  
  app.use(express.static(distPath));
  
  // Fallback to index.html for SPA routing
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

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

