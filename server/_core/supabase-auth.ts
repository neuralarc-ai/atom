import { Request, Response, Express } from "express";
import { getSupabase } from "./supabase";
import { getSessionCookieOptions } from "./cookies";

const COOKIE_NAME = "atom_session";

/**
 * Supabase Auth implementation for admin login
 * Uses Supabase Auth with email/password
 */

export class SupabaseAuthService {
  /**
   * Login with email and password using Supabase Auth
   */
  async login(email: string, password: string): Promise<{ success: boolean; session?: any; error?: string }> {
    try {
      console.log("[SupabaseAuth] Attempting login for:", email);
      const supabase = getSupabase();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[SupabaseAuth] Login error:", error);
        return { success: false, error: error.message };
      }

      if (!data.session) {
        console.error("[SupabaseAuth] No session created");
        return { success: false, error: "No session created" };
      }

      console.log("[SupabaseAuth] Login successful");
      return { success: true, session: data.session };
    } catch (error: any) {
      console.error("[SupabaseAuth] Login exception:", error);
      console.error("[SupabaseAuth] Error details:", error.message, error.stack);
      return { success: false, error: error.message || "Login failed" };
    }
  }

  /**
   * Register a new user with Supabase Auth
   */
  async register(email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        console.error("[SupabaseAuth] Register error:", error);
        return { success: false, error: error.message };
      }

      // Also create user in users table
      if (data.user) {
        await supabase.from("users").insert({
          id: data.user.id,
          email,
          name,
          role: "admin",
        });
      }

      return { success: true };
    } catch (error) {
      console.error("[SupabaseAuth] Register exception:", error);
      return { success: false, error: "Registration failed" };
    }
  }

  /**
   * Verify a session token
   */
  async verifySession(token: string): Promise<{ userId: string; email: string } | null> {
    try {
      const supabase = getSupabase();
      
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return null;
      }

      return {
        userId: data.user.id,
        email: data.user.email || "",
      };
    } catch (error) {
      console.warn("[SupabaseAuth] Session verification error:", error);
      return null;
    }
  }

  /**
   * Authenticate a request and return the user
   */
  async authenticateRequest(req: Request): Promise<any> {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    // Try to get token from Authorization header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    // Try to get token from cookie
    if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    if (!token) {
      console.log("[Auth] No token found in request");
      throw new Error("No authentication token provided");
    }

    console.log("[Auth] Attempting to authenticate with token");

    // Create a Supabase client with the user's access token
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";
    
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify the token with Supabase Auth
    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
      console.log("[Auth] Authentication failed:", error?.message || "No user");
      throw new Error("Invalid or expired session");
    }

    console.log("[Auth] Successfully authenticated user:", user.email);
    
    // Map Supabase user to expected User format
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email,
      email: user.email,
      role: "admin", // For now, all authenticated users are admins
      loginMethod: null,
      createdAt: user.created_at ? new Date(user.created_at) : null,
      lastSignedIn: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
    };
  }

  /**
   * Logout (invalidate session)
   */
  async logout(token: string): Promise<void> {
    try {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[SupabaseAuth] Logout error:", error);
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();

/**
 * Register Supabase Auth routes
 */
export function registerSupabaseAuthRoutes(app: Express) {
  // Login route
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      console.log("[Auth] Login route called");
      const { email, password } = req.body;

      if (!email || !password) {
        console.log("[Auth] Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }

      console.log("[Auth] Attempting login for:", email);
      const result = await supabaseAuthService.login(email, password);

      if (!result.success) {
        console.log("[Auth] Login failed:", result.error);
        return res.status(401).json({ error: result.error });
      }

      console.log("[Auth] Login successful, setting cookie");
      // Set session cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, result.session.access_token, { 
        ...cookieOptions, 
        maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      res.json({ 
        success: true,
        user: result.session.user,
      });
    } catch (error: any) {
      console.error("[Auth] Login route error:", error);
      console.error("[Auth] Error stack:", error?.stack);
      res.status(500).json({ 
        error: "Internal server error",
        message: error?.message || "Unknown error"
      });
    }
  });

  // Register route (for creating new admin users)
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }

      const result = await supabaseAuthService.register(email, password, name);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Register route error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Logout route
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const token = req.cookies?.[COOKIE_NAME];
      if (token) {
        await supabaseAuthService.logout(token);
      }

      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, cookieOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout route error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get current user route
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const user = await supabaseAuthService.authenticateRequest(req);
      res.json(user);
    } catch (error) {
      res.status(401).json({ error: "Unauthorized" });
    }
  });
}

