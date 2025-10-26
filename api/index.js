// Vercel serverless function entry point
import app from '../dist/index-supabase.js';

console.log('Loading serverless function...');
console.log('App type:', typeof app);

export default app;

