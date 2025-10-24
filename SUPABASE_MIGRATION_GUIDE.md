# Supabase Migration Guide

This document explains how to complete the migration from MySQL/OAuth to Supabase/Supabase Auth.

## ✅ What's Already Done

1. **Database Schema Created** in your Supabase project (zkvlwkojgrxazizlhuca)
   - Users table (integrated with Supabase Auth)
   - Jobs table
   - Tests table
   - Candidates table
   - All indexes and triggers

2. **Server-Side Code Created**
   - `server/_core/supabase.ts` - Supabase client configuration
   - `server/_core/supabase-auth.ts` - Supabase Auth implementation
   - `server/db-supabase.ts` - Database operations using Supabase
   - `server/_core/context-supabase.ts` - Context for tRPC using Supabase Auth
   - `server/_core/index-supabase.ts` - Server entry point using Supabase
   - `server/_core/gemini.ts` - Gemini AI integration

3. **Routers Updated**
   - `server/routers.ts` now imports from `db-supabase` instead of `db`

## 🔧 What You Need to Do

### Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project "Neuron" (zkvlwkojgrxazizlhuca)
3. Go to **Settings** → **API**
4. Copy the **service_role** key (secret key)

### Step 2: Update Environment Variables

Create a `.env` file in the project root with:

```env
# Supabase Configuration
SUPABASE_URL=https://zkvlwkojgrxazizlhuca.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprdmx3a29qZ3J4YXppemxodWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyOTYyMzUsImV4cCI6MjA3Njg3MjIzNX0.dxJHZSGCHF6lketz0ejgP2MLcm_nGczVvzf62Jj2On0
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Gemini AI (for question generation)
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: OpenAI (fallback)
OPENAI_API_KEY=your-openai-api-key-here
```

### Step 3: Update package.json Scripts

Replace the `dev` and `build` scripts:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index-supabase.ts",
    "build": "vite build && esbuild server/_core/index-supabase.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### Step 4: Create Your First Admin User

Use Supabase Auth to create an admin user:

1. Go to Supabase dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `admin@atom.ai` (or your preferred email)
   - Password: Create a strong password
   - User Metadata: `{"name": "Admin User"}`
4. Click **Create user**

The trigger we created will automatically add this user to the `users` table with `role='admin'`.

### Step 5: Update Frontend Authentication

The frontend needs to be updated to use Supabase Auth. Key files to update:

1. **client/src/lib/supabase.ts** (create new file):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zkvlwkojgrxazizlhuca.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

2. **Update Login Component** to use Supabase Auth instead of OAuth

3. **Add to .env**:
```env
VITE_SUPABASE_URL=https://zkvlwkojgrxazizlhuca.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 6: Test the Migration

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Try to log in with your admin credentials

3. Test creating a job, generating a test, and running a candidate test

## 🎯 Benefits of Supabase Migration

- ✅ **No OAuth complexity** - Simple email/password authentication
- ✅ **Built-in user management** - Supabase Auth handles everything
- ✅ **PostgreSQL power** - Better performance and features than MySQL
- ✅ **Real-time capabilities** - Can add real-time features later
- ✅ **Row Level Security** - Can add fine-grained permissions
- ✅ **No Manus dependencies** - Fully standalone application

## 🔄 Rollback Plan

If you need to rollback to the MySQL/OAuth version:

1. Change package.json scripts back to use `server/_core/index.ts`
2. Revert `server/routers.ts` from the backup: `server/routers.mysql-backup.ts`
3. Use the old `.env` with `DATABASE_URL` and OAuth settings

## 📝 Notes

- The old MySQL database code is preserved in `server/db.ts`
- The old OAuth code is preserved in `server/_core/oauth.ts`
- All backups are in `server/routers.mysql-backup.ts`
- The Supabase schema supports all existing features

## 🚀 Next Steps After Migration

1. Add Row Level Security (RLS) policies for better security
2. Set up Supabase Edge Functions for serverless operations
3. Enable real-time subscriptions for live updates
4. Add Supabase Storage for file uploads
5. Set up automated backups

## ❓ Troubleshooting

**Issue**: "Supabase configuration missing"
- **Solution**: Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are in your `.env`

**Issue**: "User not found after login"
- **Solution**: Check that the trigger `on_auth_user_created` is working. Manually insert the user into the `users` table if needed.

**Issue**: "Cannot connect to database"
- **Solution**: Verify your Supabase project is active and the service role key is correct

## 📞 Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Check server logs for error messages
3. Verify all environment variables are set correctly

