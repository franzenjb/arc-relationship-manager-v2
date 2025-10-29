# V3 DEPLOYMENT STRATEGY - SMARTER APPROACH

## 🎯 **THE WINNING STRATEGY**

**One Repository, Two Deployments, Complete Separation**

```
arc-relationship-manager-v2 (GitHub repo)
    ↓
    ├─→ Vercel Project #1: arc-relationship-manager-v2
    │   └─ Environment: V2 Supabase (no auth)
    │   └─ URL: arc-relationship-manager-v2.vercel.app
    │   └─ Purpose: PUBLIC DEMO
    │
    └─→ Vercel Project #2: arc-relationship-manager-v3
        └─ Environment: V3 Supabase (with auth)
        └─ URL: arc-relationship-manager-v3.vercel.app
        └─ Purpose: PRODUCTION WITH AUTH
```

## ✅ **WHY THIS IS BRILLIANT**

1. **No New GitHub Repo Needed** - Use existing repo
2. **Complete Isolation** - Different Vercel projects = different configs
3. **Different Databases** - V2 uses one Supabase, V3 uses another
4. **Same Codebase** - Easy to sync improvements
5. **Zero Risk to V2** - V2 deployment untouched
6. **Simple Maintenance** - One place to update code

## 🚀 **IMPLEMENTATION STEPS**

### **STEP 1: Create V3 Supabase Project** ⏱️ 5 minutes

1. Go to: https://supabase.com/dashboard
2. Click "New Project"
3. Settings:
   ```
   Name: ARC Relationship Manager V3 - Auth
   Database Password: [Generate secure password - SAVE THIS]
   Region: East US (or same as V2)
   Plan: Free (upgrade to Pro when ready: $25/month)
   ```
4. Click "Create Project" (takes 2-3 minutes to provision)

5. **Get V3 Credentials:**
   - Click "Settings" → "API"
   - Copy these values:
     ```
     Project URL: https://[new-id].supabase.co
     anon/public key: eyJh... [long string]
     service_role key: eyJh... [another long string]
     ```
   - **SAVE THESE** - you'll need them for Vercel

### **STEP 2: Setup V3 Database** ⏱️ 3 minutes

1. In V3 Supabase project, click "SQL Editor"
2. Click "New Query"
3. Copy the entire contents of: `/home/user/arc-relationship-manager-v2/database/schema.sql`
4. Paste into SQL Editor
5. Click "Run" (bottom right)
6. Should see: "Success. No rows returned"

**Verify it worked:**
```sql
-- Run this query to verify tables created:
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should see:
-- activity_log
-- attachments
-- chapters
-- counties
-- meetings
-- organizations
-- people
-- regions
-- user_profiles
```

### **STEP 3: Create V3 Vercel Project** ⏱️ 5 minutes

1. Go to: https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select: `franzenjb/arc-relationship-manager-v2` (yes, the V2 repo!)
4. **PROJECT SETTINGS:**
   ```
   Project Name: arc-relationship-manager-v3
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

5. **ENVIRONMENT VARIABLES:** (Click "Environment Variables")

   Add these variables (use V3 Supabase values from Step 1):

   ```env
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://[v3-project-id].supabase.co
   Environment: Production, Preview, Development

   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJh... [V3 anon key from Step 1]
   Environment: Production, Preview, Development

   Name: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJh... [V3 service key from Step 1]
   Environment: Production, Preview, Development

   Name: NEXT_PUBLIC_APP_VERSION
   Value: 3.0.0
   Environment: Production, Preview, Development

   Name: NEXT_PUBLIC_AUTH_ENABLED
   Value: true
   Environment: Production, Preview, Development
   ```

6. Click "Deploy"

### **STEP 4: Verify V3 Deployment** ⏱️ 2 minutes

1. Wait for deployment to complete (2-3 minutes)
2. Visit: `https://arc-relationship-manager-v3.vercel.app`
3. **Should see:**
   - Same UI as V2
   - No data (empty database)
   - Everything functional

4. **Verify V2 Still Works:**
   - Visit: `https://arc-relationship-manager-v2.vercel.app`
   - Should still work exactly as before
   - Uses V2 Supabase
   - Completely independent

## 📊 **WHAT YOU NOW HAVE**

| Feature | V2 (Demo) | V3 (Production) |
|---------|-----------|-----------------|
| **GitHub Repo** | arc-relationship-manager-v2 | arc-relationship-manager-v2 (same!) |
| **Vercel Project** | arc-relationship-manager-v2 | arc-relationship-manager-v3 (NEW) |
| **Vercel URL** | `-v2.vercel.app` | `-v3.vercel.app` (NEW) |
| **Supabase Project** | V2 (yqucpr...) | V3 (NEW project) |
| **Database** | V2 data | V3 data (separate) |
| **Auth** | ❌ Disabled | ✅ Ready (not enabled yet) |
| **Purpose** | Public demo | Production (setup complete) |

## 🎯 **NEXT PHASES - IMPLEMENTING AUTH**

Now that V3 infrastructure is ready, we can implement auth in phases:

### **Phase 0: Verify Setup** ✅ (Complete once deployed)
- V3 deploys successfully
- V3 uses new Supabase project
- V2 completely unaffected
- Both work side-by-side

### **Phase 1: Add Auth Pages** (Next)
- Create `/app/auth/login/page.tsx`
- Create `/app/auth/signup/page.tsx`
- Create `/app/auth/callback/route.ts`
- Test signup/login works
- **NO RLS yet** - all data visible

### **Phase 2: Audit Trails** (After Phase 1)
- Update lib files to use `auth.uid()`
- Track real users in activity_log
- Test audit trail works

### **Phase 3: Enforce Login** (After Phase 2)
- Add middleware.ts
- Redirect to login if not authenticated
- Test cannot access without login

### **Phase 4: Region Assignment** (After Phase 3)
- Add region assignment UI for admins
- Assign users to regions
- **NO filtering yet** - just tracking

### **Phase 5: Enable RLS** (Final - Carefully)
- Enable RLS on organizations table
- Test Florida user sees only Florida
- Enable RLS on other tables
- Full testing

## 🔧 **MAKING CHANGES TO V3**

### **Updating V3 Code:**

1. Make changes in the repo (on any branch)
2. Push to GitHub
3. Vercel auto-deploys BOTH projects:
   - V2 with V2 environment variables
   - V3 with V3 environment variables
4. Both update independently

### **Different Behavior via Environment:**

```typescript
// In your code, check which version:
const isV3 = process.env.NEXT_PUBLIC_APP_VERSION === '3.0.0'
const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true'

// Show different UI:
if (authEnabled) {
  return <AuthenticatedLayout />
} else {
  return <PublicDemoLayout />
}
```

## 📦 **IMPORTING V2 DATA TO V3** (Optional)

If you want V3 to start with V2's data:

1. **Export from V2 Supabase:**
   ```sql
   -- In V2 Supabase SQL Editor
   COPY organizations TO '/tmp/v2-orgs.csv' CSV HEADER;
   COPY people TO '/tmp/v2-people.csv' CSV HEADER;
   COPY meetings TO '/tmp/v2-meetings.csv' CSV HEADER;
   ```

2. **Import to V3 Supabase:**
   - Table Editor → Select table → "Insert" → "Import CSV"
   - Or use SQL: `COPY organizations FROM '/path/to/csv' CSV HEADER;`

3. **Assign Regions:**
   ```sql
   -- Assign organizations to regions based on state
   UPDATE organizations
   SET region_id = (SELECT id FROM regions WHERE code = 'FLORIDA')
   WHERE state = 'FL';

   UPDATE organizations
   SET region_id = (SELECT id FROM regions WHERE code = 'NEBRASKA_IOWA')
   WHERE state IN ('NE', 'IA');
   ```

## 🎓 **USING V2 AND V3 TOGETHER**

### **V2 Use Cases:**
- Training new staff
- Executive demos
- Testing new features safely
- Screenshots/documentation
- Public marketing

### **V3 Use Cases:**
- Daily operations
- Real partner data
- Tracking actual meetings
- User-specific views
- Audit compliance

## ✅ **VERIFICATION CHECKLIST**

After completing Steps 1-4:

- [ ] V3 Supabase project created
- [ ] V3 database schema deployed
- [ ] V3 Vercel project created
- [ ] V3 environment variables set
- [ ] V3 deploys successfully
- [ ] V3 URL works: `https://arc-relationship-manager-v3.vercel.app`
- [ ] V2 still works: `https://arc-relationship-manager-v2.vercel.app`
- [ ] V2 and V3 are independent
- [ ] Both use same code, different databases

## 🚨 **CRITICAL REMINDERS**

1. **V2 Vercel Project** - DON'T TOUCH
   - Leave V2 environment variables alone
   - V2 deployment settings unchanged
   - V2 continues to work as demo

2. **V3 Vercel Project** - Brand new
   - Fresh deployment
   - Fresh database
   - Fresh environment variables
   - Ready for auth implementation

3. **Same Codebase**
   - Both deploy from same GitHub repo
   - Code improvements benefit both
   - Environment variables make them different

## 📞 **SUPPORT**

If something goes wrong:

1. **V3 deploy fails:**
   - Check environment variables in Vercel
   - Verify Supabase URL is correct
   - Check build logs in Vercel

2. **V2 affected:**
   - Check V2 Vercel project settings unchanged
   - V2 should be completely independent
   - Rollback if needed

3. **Database issues:**
   - V2 Supabase: yqucprgxgdnowjnzrtoz.supabase.co
   - V3 Supabase: [your new project].supabase.co
   - They are completely separate

---

**Status:** Ready to execute Steps 1-4
**Time Required:** ~15 minutes total
**Risk:** Zero risk to V2
**Next Action:** Create V3 Supabase project

---

**Created:** October 29, 2025
**For:** Jeff Franzen - American Red Cross
**Version:** V3 Deployment Strategy v1.0
