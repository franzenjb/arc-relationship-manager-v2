# CONFIGURE SUPABASE AUTH SETTINGS

## IMMEDIATE ACTION REQUIRED

Go to the Supabase Dashboard and update these settings:

### 1. Authentication URL Configuration
**URL:** https://supabase.com/dashboard/project/okclryedqbghlhxzqyrw/auth/url-configuration

**Update these settings:**
- **Site URL:** `https://experience.arcgis.com/experience/2117527fa62f4c1eaf37f78d5459670e?org=arc-nhq-gis`
- **Redirect URLs:** Add these URLs (comma-separated):
  - `https://experience.arcgis.com/experience/2117527fa62f4c1eaf37f78d5459670e/auth/callback?org=arc-nhq-gis`
  - `https://arc-relationship-manager.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for development)

### 3. Email Template Configuration
**URL:** https://supabase.com/dashboard/project/okclryedqbghlhxzqyrw/auth/templates

Ensure the email templates use:
- **Confirmation URL:** `https://arc-relationship-manager.vercel.app/auth/callback?token_hash={{ .TokenHash }}&type=email`
- **Password Reset URL:** `https://arc-relationship-manager.vercel.app/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password`

## TESTING STEPS

1. Update Supabase settings above
2. Create a new account via signup form
3. Check email for confirmation link
4. Verify link goes to `/auth/callback` and redirects properly
5. Confirm user can access the application

## CURRENT STATUS
- ✅ Auth callback route created at `/auth/callback`
- ✅ Auth service updated with proper redirect URLs
- ✅ Environment variables configured
- ✅ Vercel deployment live at: https://arc-relationship-manager.vercel.app
- ✅ ArcGIS Experience Builder URL provided: https://experience.arcgis.com/experience/2117527fa62f4c1eaf37f78d5459670e?org=arc-nhq-gis
- ⏳ **NEXT:** Manual Supabase dashboard settings update required (see above URLs)