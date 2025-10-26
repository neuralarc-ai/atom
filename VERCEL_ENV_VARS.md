# Vercel Environment Variables Setup

This document lists all required environment variables for deploying to Vercel.

## Required Environment Variables

You must set the following environment variables in your Vercel project settings:

### Supabase Configuration

1. **VITE_SUPABASE_URL** - Your Supabase project URL
   - Find this in your Supabase dashboard under Project Settings > API
   - Example: `https://xxxxx.supabase.co`

2. **VITE_SUPABASE_SERVICE_KEY** - Your Supabase service role key
   - Find this in your Supabase dashboard under Project Settings > API
   - ⚠️ **Important**: This is a service role key with admin privileges
   - Keep it secret - never commit to version control
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **VITE_SUPABASE_ANON_KEY** - Your Supabase anonymous key
   - Find this in your Supabase dashboard under Project Settings > API
   - This is used for client-side authentication
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Setting Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Click **Add New**
   - Enter the name (e.g., `VITE_SUPABASE_URL`)
   - Enter the value
   - Select the environments where it should be available (Production, Preview, Development)
   - Click **Save**

## After Setting Variables

1. **Redeploy** your application for the changes to take effect
2. Check the deployment logs to verify the environment variables are loaded correctly

## Troubleshooting

### Error: "Supabase configuration missing"

This error means the environment variables are not set or not accessible. Check:

1. ✅ Variables are set in Vercel dashboard
2. ✅ Variables are added to the correct environments
3. ✅ You've redeployed after adding variables
4. ✅ Variable names are spelled correctly (case-sensitive)

### How to Verify

Check the serverless function logs in Vercel:
1. Go to your deployment
2. Click on the function logs
3. Look for `[Supabase]` log messages
4. You should see:
   - `[Supabase] Checking configuration...`
   - `[Supabase] Has URL: true`
   - `[Supabase] Has Service Key: true`

### Local Development

For local development, create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_SERVICE_KEY=your_service_role_key_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note**: The `.env` file is gitignored and won't be committed to version control.

