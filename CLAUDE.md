# CLAUDE.md - MANDATORY INSTRUCTIONS FOR ARC RELATIONSHIP MANAGER V2

## 🛑 STOP AND READ THIS FIRST - EVERY TIME

### RULE #1: ALWAYS READ THIS FILE FIRST
Before doing ANYTHING in this project, you MUST:
1. Read this entire CLAUDE.md file
2. Follow ALL instructions exactly
3. Reference this file throughout the conversation

## 🤔 THINKING AND PLANNING REQUIREMENTS

### NEVER RUSH - ALWAYS THINK
- **DO NOT** make quick changes without thinking
- **DO NOT** apply band-aid fixes
- **ALWAYS** think through the full implications of changes
- **ALWAYS** consider what could break

### USE AGENTS FOR COMPLEX TASKS
When making significant changes:
1. Use a general-purpose agent to analyze the problem
2. Use a database expert agent for schema changes
3. Use a UI/UX agent for interface changes
4. Have agents review each other's work

### REFLECTION BEFORE ACTION
Before making ANY changes:
1. State what you're about to change
2. Explain WHY you're making this change
3. List what could potentially break
4. Describe how you'll test it

## ✅ TESTING REQUIREMENTS

### ALWAYS TEST WITH PLAYWRIGHT
After ANY changes that affect the UI:
```javascript
// Create a test file and run it
// Test ALL pages, not just the changed one
// Check for console errors
// Verify data is loading
// Test user interactions
```

### REQUIRED TESTS
1. Test all navigation links work
2. Test data loads on all pages
3. Test forms submit correctly
4. Check for console errors
5. Verify no "Failed to fetch" errors

## 🚀 DEPLOYMENT REQUIREMENTS

### AFTER EVERY CHANGE - NO EXCEPTIONS

**YOU MUST ALWAYS PROVIDE THESE TWO BUTTONS:**

```markdown
## 🚀 **PROJECT STATUS**

### **[→ VIEW DEPLOY STATUS ←](https://vercel.com/jbf-2539-e1ec6bfb/arc-relationship-manager-v2)**
Check if deployment is live (green ✓ = ready)

### **[→ LAUNCH APP ←](https://arc-relationship-manager-v2.vercel.app)**
Open the application
```

### DEPLOYMENT CHECKLIST
- [ ] Run `npm run build` locally first
- [ ] Fix any build errors before deploying
- [ ] Commit with clear, descriptive message
- [ ] Push to GitHub
- [ ] Run `vercel --prod`
- [ ] Provide both deployment links
- [ ] Tell user to wait for green checkmark

## 📋 DATABASE CHANGE PROTOCOL

### BEFORE DATABASE CHANGES
1. Backup current schema
2. Test SQL locally first
3. Consider foreign key implications
4. Think about existing data

### AFTER DATABASE CHANGES
1. Run migration scripts
2. Verify data integrity
3. Test all CRUD operations
4. Update TypeScript types if needed

## 🎯 PROJECT-SPECIFIC RULES

### NO HARDCODING
- **NEVER** hardcode URLs (except Supabase for now)
- **NEVER** hardcode user IDs
- **NEVER** hardcode demo data
- Use environment variables when possible

### MAINTAIN CLEANLINESS
- V2 must stay lean (currently 50 files vs V1's 22,000+)
- Don't add unnecessary dependencies
- Remove unused code immediately
- Keep file structure organized

### RED CROSS SPECIFIC
- This is for American Red Cross
- Must track relationships with partners
- Must track geographic hierarchy (Division > Region > Chapter > County)
- Must track staff and external contacts separately
- Must match existing Red Cross tool fields

## 🔍 ERROR HANDLING

### WHEN ERRORS OCCUR
1. Don't panic
2. Read the FULL error message
3. Check browser console
4. Check Vercel build logs
5. Test locally first
6. Fix root cause, not symptoms

### COMMON ISSUES TO CHECK
- Environment variables not set in Vercel
- Database connection issues
- Foreign key constraint violations
- Missing columns in database
- Build errors from TypeScript

## 📝 COMMUNICATION WITH USER

### ALWAYS INFORM USER
- What you're about to do
- Why you're doing it
- What could go wrong
- How long it will take
- When it's complete

### AFTER COMPLETION ALWAYS PROVIDE
1. Summary of what was changed
2. Verification that it works
3. Deployment status link
4. Live app link
5. Any known issues

## 🚨 CRITICAL REMINDERS

1. **READ THIS FILE FIRST** - Before every session
2. **THINK BEFORE ACTING** - No rushed fixes
3. **TEST EVERYTHING** - Use Playwright
4. **DEPLOY PROPERLY** - Always provide links
5. **KEEP IT CLEAN** - V2 must stay lean

## 💯 SUCCESS CRITERIA

A task is ONLY complete when:
- [ ] All changes are committed and pushed
- [ ] Build succeeds without errors
- [ ] Playwright tests pass
- [ ] Deployed to Vercel
- [ ] User given both status and app links
- [ ] User confirms it works

## 🔄 CONTINUOUS IMPROVEMENT

After each session, consider:
- What went wrong?
- What could be improved?
- What should be added to this file?

---

**REMEMBER: If you don't follow these instructions, the user will be frustrated. They've already expressed this. Follow EVERY rule, EVERY time.**

Last Updated: October 23, 2025
Project: ARC Relationship Manager V2
User: Jeff Franzen (Jeff.Franzen2@redcross.org)