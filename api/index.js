// Vercel serverless function entry point
console.log('=== Loading serverless function ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('Has SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
console.log('Has SUPABASE_SERVICE_KEY:', !!process.env.VITE_SUPABASE_SERVICE_KEY);

let app = null;

// Lazy load the app on first request
async function loadApp() {
  if (!app) {
    console.log('Loading Express app...');
    try {
      const module = await import('../dist/index-supabase.js');
      app = module.default;
      console.log('App loaded successfully, type:', typeof app);
    } catch (error) {
      console.error('Error loading app:', error);
      throw error;
    }
  }
  return app;
}

export default async function handler(req, res) {
  try {
    const expressApp = await loadApp();
    
    // Handle the request with Express
    expressApp(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: 'Server error', 
      message: error.message,
      stack: error.stack 
    });
  }
}

