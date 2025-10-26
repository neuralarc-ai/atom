// Vercel serverless function entry point
console.log('=== Loading serverless function ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('Has SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
console.log('Has SUPABASE_SERVICE_KEY:', !!process.env.VITE_SUPABASE_SERVICE_KEY);

let app;
try {
  const module = await import('../dist/index-supabase.js');
  app = module.default;
  console.log('App loaded successfully, type:', typeof app);
} catch (error) {
  console.error('Error loading app:', error);
  throw error;
}

export default app;

