# Atom HR Portal - Supabase Migration Guide

This guide will help you migrate from the Manus-hosted MySQL database to Supabase PostgreSQL and remove all OAuth dependencies.

## Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Node.js**: Version 18 or higher
3. **pnpm**: Package manager

## Step 1: Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in:
   - **Project Name**: atom-hr-portal
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
4. Wait for project creation (2-3 minutes)

## Step 2: Get Supabase Connection Details

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Find the **Connection string** section
3. Copy the **Connection pooling** string (Transaction mode)
4. It should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

## Step 3: Run the Schema Migration

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL Editor
5. Click **Run** to execute the schema

This will create:
- ✅ Users table (with password authentication)
- ✅ Jobs table
- ✅ Tests table
- ✅ Candidates table
- ✅ All necessary indexes
- ✅ Default admin user (email: admin@atom.ai, password: admin123)

## Step 4: Update Environment Variables

Create a `.env` file in the project root with:

```env
# Supabase Database
DATABASE_URL="your-supabase-connection-string-here"

# JWT Secret (generate a random string)
JWT_SECRET="your-random-secret-key-here"

# Gemini API (optional - for AI features)
GEMINI_API_KEY="your-gemini-api-key-here"

# App Configuration
VITE_APP_TITLE="Atom HR Portal"
VITE_APP_LOGO="/logo.png"
```

### How to Generate JWT_SECRET:

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### How to Get Gemini API Key:

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key and add it to `.env`

## Step 5: Install Dependencies

```bash
cd atom-hr-portal
pnpm install
pnpm add bcryptjs @types/bcryptjs @google/generative-ai
pnpm add drizzle-orm@latest
pnpm add postgres
```

## Step 6: Update Database Configuration

The project has been updated to use PostgreSQL instead of MySQL. The new schema is in `drizzle/schema-postgres.ts`.

## Step 7: Change Default Admin Password

**IMPORTANT**: The default admin password is `admin123`. Change it immediately!

1. Start the application: `pnpm dev`
2. Go to http://localhost:3000
3. Login with:
   - Email: `admin@atom.ai`
   - Password: `admin123`
4. Go to Settings → Change Password
5. Set a strong new password

Or run this SQL in Supabase SQL Editor:

```sql
-- Generate a bcrypt hash for your new password at: https://bcrypt-generator.com/
UPDATE users 
SET password_hash = 'your-bcrypt-hash-here' 
WHERE email = 'admin@atom.ai';
```

## Step 8: Test the Application

```bash
pnpm dev
```

Visit http://localhost:3000 and:
1. ✅ Login with admin credentials
2. ✅ Create a job role
3. ✅ Generate a test
4. ✅ Test the candidate flow

## Step 9: Deploy to Production

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables from `.env`
5. Deploy!

### Option B: Netlify

1. Go to https://netlify.com
2. Connect your GitHub repository
3. Add environment variables
4. Deploy!

### Option C: Your Own Server

```bash
pnpm build
pnpm start
```

## What's Been Removed

- ❌ OAuth authentication (replaced with email/password)
- ❌ Manus SDK dependencies
- ❌ Manus-specific environment variables
- ❌ OAuth callback routes

## What's Been Added

- ✅ Email/password authentication
- ✅ Supabase PostgreSQL database
- ✅ Gemini AI API support
- ✅ Standalone deployment capability
- ✅ bcrypt password hashing
- ✅ JWT session management

## Troubleshooting

### Database Connection Issues

If you get "database not available" errors:
1. Check your `DATABASE_URL` is correct
2. Ensure Supabase project is running
3. Verify your IP is allowed (Supabase → Settings → Database → Connection pooling)

### Authentication Issues

If login doesn't work:
1. Check `JWT_SECRET` is set
2. Clear browser cookies
3. Verify admin user exists in database

### AI Features Not Working

If test generation fails:
1. Check `GEMINI_API_KEY` is set
2. Verify API key is valid
3. Check Gemini API quota

## Support

For issues:
1. Check the console logs
2. Verify all environment variables are set
3. Ensure database schema is created
4. Check Supabase project status

## Migration Checklist

- [ ] Created Supabase project
- [ ] Ran schema migration SQL
- [ ] Updated `.env` with DATABASE_URL
- [ ] Generated and set JWT_SECRET
- [ ] Added GEMINI_API_KEY (optional)
- [ ] Installed dependencies
- [ ] Changed default admin password
- [ ] Tested login
- [ ] Tested job creation
- [ ] Tested test generation
- [ ] Tested candidate flow
- [ ] Deployed to production

## Next Steps

Once everything is working:
1. Create additional admin users if needed
2. Configure email notifications (optional)
3. Set up backups in Supabase
4. Monitor usage and performance
5. Customize branding and styling

Congratulations! Your Atom HR Portal is now running standalone with Supabase! 🎉

