# American Red Cross Relationship Manager

A comprehensive system for managing partnerships, relationships, and interactions with external organizations, government agencies, and emergency management contacts.

## 🚀 **PRODUCTION DEPLOYMENT**

### **[→ LAUNCH APPLICATION ←](https://arc-relationship-manager.vercel.app/)**
Live production system

### **[→ ARCGIS EMBED ←](https://experience.arcgis.com/experience/2117527fa62f4c1eaf37f78d5459670e?org=arc-nhq-gis)**
ArcGIS Experience Builder integration

### **[→ DEPLOYMENT STATUS ←](https://vercel.com/jbf-2539-e1ec6bfb/arc-relationship-manager)**
Check build status and logs

## 📋 **PROJECT STATUS** 

**READY FOR EXECUTIVE PRESENTATION** ✅

### Completed Features
- ✅ **Organization Management** - Full CRUD operations with contact details
- ✅ **People Management** - Individual contacts with roles and relationships  
- ✅ **Interaction Tracking** - Meeting/call logs with outcomes and follow-ups
- ✅ **Geographic Mapping** - Interactive maps with organization locations
- ✅ **Search & Filtering** - Advanced search across all entities
- ✅ **Audit Trail** - Complete user tracking for accountability
- ✅ **Authentication** - Supabase auth with email confirmation
- ✅ **Red Cross Branding** - Official logos and color scheme

### In Progress
- ⚠️ **Multi-Chapter Organizations** - Awaiting authoritative county-chapter-region database
- ⚠️ **Admin Interface** - Pending official geographic hierarchy data
- ⚠️ **Terminology Updates** - Converting remaining "Meetings" to "Interactions"

## 🛠 **TECHNICAL ARCHITECTURE**

### Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Hosting**: Vercel (Production), GitHub (Source Control)
- **Integration**: ArcGIS Experience Builder embedding

### Database
- **Organizations**: 5 sample emergency management agencies
- **People**: Contact details with organizational relationships
- **Interactions**: Meeting/call logs with structured outcomes
- **User Profiles**: Audit trail and role-based access

### Key Features
- **Geographic Search**: County/state filtering with map integration
- **Relationship Tracking**: Primary contact assignments and interaction history
- **Mission Area Classification**: Emergency Management, Healthcare, Government
- **Activity Dashboard**: Recent actions and upcoming follow-ups

## 🔧 **DEVELOPMENT**

### Local Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://okclryedqbghlhxzqyrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
SUPABASE_SERVICE_ROLE_KEY=[service_role_key]
DATABASE_URL=[postgres_connection_string]
```

### Database Access
```bash
# Direct PostgreSQL access
PGPASSWORD=garypelletier2025! psql -h db.okclryedqbghlhxzqyrw.supabase.co -U postgres -d postgres
```

## 📊 **DEMO DATA**

### Organizations (5)
- Florida Division of Emergency Management
- Miami-Dade Emergency Management  
- Orange County Emergency Management
- Florida National Guard
- Tampa General Hospital

### People (10+)
- Emergency Managers, Directors, Coordinators
- Hospital administrators, Government liaisons
- Complete contact information and organizational roles

### Interactions (15+)
- Emergency response meetings, Preparedness planning
- Resource coordination, Training sessions
- Follow-up actions and outcome tracking

## 🎯 **EXECUTIVE SUMMARY**

The American Red Cross Relationship Manager provides a centralized platform for tracking partnerships with emergency management agencies, healthcare systems, and government organizations. The system enables Red Cross staff to maintain detailed interaction histories, manage follow-up actions, and ensure consistent relationship management across chapters and regions.

**Key Value Propositions:**
- **Centralized Contact Management** - Single source of truth for all external relationships
- **Interaction History** - Complete timeline of meetings, calls, and outcomes  
- **Geographic Organization** - County/region-based filtering and mapping
- **Accountability** - Full audit trail of who updated what and when
- **Scalability** - Designed for national deployment across all Red Cross chapters

## 📞 **SUPPORT**

For technical questions or deployment issues:
- **Repository**: https://github.com/franzenjb/arc-relationship-manager
- **Tech Stack Details**: `/tech-stack` page in application
- **Database Schema**: See `implement-audit-trail.sql`