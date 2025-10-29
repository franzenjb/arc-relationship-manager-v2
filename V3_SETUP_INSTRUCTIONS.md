# V3 SUPABASE & VERCEL SETUP - FINAL STEPS

## ✅ CREDENTIALS RECEIVED

**V3 Supabase Project:** https://cagjqydzsqojprdfwvnd.supabase.co
- ✅ Anon Key: Received
- ✅ Service Role Key: Received
- ✅ Database Password: Redcross2025!

---

## 🔧 STEP 1: Deploy Database Schema (2 minutes)

### **You need to do this via Supabase Dashboard:**

1. **Open Supabase SQL Editor:**
   - Visit: https://cagjqydzsqojprdfwvnd.supabase.co/project/cagjqydzsqojprdfwvnd/sql
   - Or: Supabase Dashboard → Your V3 Project → SQL Editor

2. **Create New Query:**
   - Click "New Query" button

3. **Copy Schema:**
   - Open file: `/home/user/arc-relationship-manager-v2/database/schema.sql`
   - Copy ALL contents (454 lines)

4. **Paste and Run:**
   - Paste into SQL Editor
   - Click "Run" (bottom right)
   - Wait for completion (~10 seconds)

5. **Verify Success:**
   Run this verification query:
   ```sql
   SELECT tablename FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

   **Expected tables:**
   - activity_log
   - attachments
   - chapters
   - counties
   - meetings
   - organizations
   - people
   - regions
   - user_profiles

---

## 🚀 STEP 2: Create Vercel V3 Project (3 minutes)

### **Option A: Via Vercel Dashboard (Recommended)**

1. **Go to Vercel:**
   - Visit: https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Repository:**
   - Find: `franzenjb/arc-relationship-manager-v2` (yes, same repo as V2!)
   - Click "Import"

3. **Configure Project:**
   ```
   Project Name: arc-relationship-manager-v3
   Framework Preset: Next.js
   Root Directory: ./ (leave default)
   Build Command: npm run build (leave default)
   Output Directory: .next (leave default)
   Install Command: npm install (leave default)
   ```

4. **Add Environment Variables:**

   Click "Environment Variables" and add these **5 variables**:

   **Variable 1:**
   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://cagjqydzsqojprdfwvnd.supabase.co
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 2:**
   ```
   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZ2pxeWR6c3FvanByZGZ3dm5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NTk4MTEsImV4cCI6MjA3NzMzNTgxMX0.KG8DKj_G9QOoFPUHsm2BzYFbF2U2dUsXIbEcR-neWNY
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 3:**
   ```
   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZ2pxeWR6c3FvanByZGZ3dm5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc1OTgxMSwiZXhwIjoyMDc3MzM1ODExfQ.utRMq3JQUEG2vaBdeOtIiBD2NcZK7u1KG9ulg-YMQIE
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 4:**
   ```
   Key: NEXT_PUBLIC_APP_VERSION
   Value: 3.0.0
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

   **Variable 5:**
   ```
   Key: NEXT_PUBLIC_AUTH_ENABLED
   Value: true
   Environments: ☑ Production ☑ Preview ☑ Development
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

---

### **Option B: Via Vercel CLI (If You Prefer)**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Go to project directory
cd /home/user/arc-relationship-manager-v2

# Create new project
vercel --name arc-relationship-manager-v3

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://cagjqydzsqojprdfwvnd.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste the anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste the service key

vercel env add NEXT_PUBLIC_APP_VERSION production
# Paste: 3.0.0

vercel env add NEXT_PUBLIC_AUTH_ENABLED production
# Paste: true

# Deploy to production
vercel --prod
```

---

## ✅ STEP 3: Verify Everything Works (2 minutes)

### **Check V3 Deployment:**

1. **V3 URL:**
   - https://arc-relationship-manager-v3.vercel.app
   - Or check Vercel dashboard for actual URL

2. **Expected Behavior:**
   - ✅ Site loads successfully
   - ✅ Same UI as V2
   - ✅ No data (empty database)
   - ✅ All pages accessible
   - ✅ No console errors

### **Check V2 Still Works:**

1. **V2 URL:**
   - https://arc-relationship-manager-v2.vercel.app

2. **Expected Behavior:**
   - ✅ Site loads successfully
   - ✅ All existing data visible
   - ✅ Nothing changed
   - ✅ Completely independent from V3

---

## 🎯 SUCCESS CRITERIA

You'll know everything worked when:

- [ ] V3 Supabase has all tables (9 tables)
- [ ] V3 Vercel project deployed successfully
- [ ] V3 URL works: `arc-relationship-manager-v3.vercel.app`
- [ ] V2 URL still works: `arc-relationship-manager-v2.vercel.app`
- [ ] Both are completely independent

---

## 📊 WHAT YOU NOW HAVE

```
┌─────────────────────────────────┐
│  GitHub: arc-relationship-mgr-v2│
│     (Single Repository)          │
└──────────┬────────────┬──────────┘
           │            │
           ▼            ▼
    ┌──────────┐  ┌──────────┐
    │ Vercel V2│  │ Vercel V3│
    │ (Demo)   │  │ (Auth)   │
    └────┬─────┘  └────┬─────┘
         │             │
         ▼             ▼
    ┌──────────┐  ┌──────────┐
    │Supabase  │  │Supabase  │
    │V2 (yqu..)│  │V3 (cag..)│
    │No Auth   │  │With Auth │
    └──────────┘  └──────────┘
```

**Two independent systems from same codebase!**

---

## 🚀 NEXT: Implement Authentication (Phase 1)

Once infrastructure is verified, we'll start Phase 1:

### **Phase 1: Auth Pages (2-3 hours)**

Will create:
- `/app/auth/login/page.tsx` - Login form
- `/app/auth/signup/page.tsx` - Signup form
- `/app/auth/callback/route.ts` - Auth callback handler
- Login/Logout buttons in navbar

**Testing:**
- Create test user account
- Log in and out
- Verify auth works
- **No data filtering yet** - optional login only

---

## ❓ TROUBLESHOOTING

### **If Supabase schema fails:**
- Check you're in correct V3 project
- Verify PostGIS extension is enabled
- Try running schema in smaller chunks
- Check for any existing tables that conflict

### **If Vercel deploy fails:**
- Verify all 5 environment variables are set
- Check they're set for "Production" environment
- Verify no typos in variable names
- Check build logs for specific errors

### **If V3 loads but doesn't connect to database:**
- Verify environment variables in Vercel dashboard
- Check Supabase URL is correct (cagjqydzsqojprdfwvnd)
- Verify anon key is correct
- Check browser console for errors

---

## 📞 READY FOR NEXT STEPS?

Once Steps 1-2 are complete, let me know and we'll:

1. ✅ Verify both V2 and V3 work
2. ✅ Start Phase 1 (auth pages)
3. ✅ Create test user accounts
4. ✅ Test login/logout flow
5. ✅ Move toward production auth

---

**Status:** Infrastructure setup instructions ready
**Your Action:** Complete Steps 1-2 above (5 minutes total)
**Then:** Report back and we'll implement auth together!

---

**Created:** October 29, 2025
**Supabase V3:** cagjqydzsqojprdfwvnd
**Next Phase:** Authentication implementation
