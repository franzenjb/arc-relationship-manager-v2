# ARC Relationship Manager V2

## 🚨 **AUTHENTICATION UPDATE - January 25, 2025**

### **🔐 NEW: Region-Based Password Protection (BETA)**

**Current Authentication Status:**
- ✅ **REGION PASSWORD SYSTEM** - Basic password protection per region
- ⚠️ **NOT ENFORCED YET** - Direct URLs still accessible (gradual rollout)
- ⏳ **IN TESTING** - Login at: https://arc-relationship-manager-v2.vercel.app/login
- 🔄 **GOLD STANDARD BACKUP** - Tagged v2.0-gold-standard for rollback if needed

**Region Access Passwords:**
- **Florida:** `RedCrossFlorida2025!`
- **Nebraska & Iowa:** `RedCrossMidwest2025!`
- **National HQ:** `RedCrossHQ2025Admin!`

**Implementation Timeline:**
1. ✅ **Phase 0.5** (Jan 25): Region passwords - COMPLETE
2. ⏳ **Phase 1** (Next): Enforce login + add user tracking
3. ⏳ **Phase 2** (Future): Full Supabase Auth with individual users
4. ⏳ **Phase 3** (Later): SSO integration

**Why This Approach:**
- Simple password per region (requested by user)
- No database changes required (uses sessionStorage)
- Can be rolled back instantly if issues arise
- Allows gradual testing without breaking production

---

## 📋 **Project Overview**

The ARC Relationship Manager V2 is a partnership and stakeholder management system for the American Red Cross. It tracks relationships between the Red Cross and partner organizations, manages contact information, and logs interactions/meetings.

**Live Application:** https://arc-relationship-manager-v2.vercel.app

**GitHub Repository:** https://github.com/franzenjb/arc-relationship-manager-v2

## 🏗️ **System Architecture**

### **Technology Stack:**
- **Frontend:** Next.js 14 with TypeScript, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL database)
- **Hosting:** Vercel (automatic deployments)
- **Database:** PostgreSQL with Row Level Security (currently bypassed)

### **Database Schema:**

The system uses a relational database with the following main tables:

1. **organizations** - Partner organizations and stakeholders
2. **people** - External contacts at partner organizations  
3. **staff_members** - Red Cross employees (separate from external contacts)
4. **meetings** - Interactions, coordination sessions, and meetings
5. **counties** - Geographic units containing chapter, region, and division info

**Geographic Hierarchy:**
- Counties → build Chapters → build Regions → build Divisions
- Example: Montgomery County + others = DC Metro Chapter → National Capital Region → Eastern Division

## 🔐 **Authentication Roadmap**

### **Phase 1: Basic Authentication (Priority 1)**
- [ ] Implement Supabase Auth with email/password
- [ ] Add login/logout functionality
- [ ] Create user profiles table
- [ ] Link users to audit fields

### **Phase 2: Access Control (Priority 2)**
- [ ] Implement role-based access (admin, chapter_user, viewer)
- [ ] Add Row Level Security policies
- [ ] Restrict data by region/chapter
- [ ] Add user management interface

### **Phase 3: Enterprise Features (Future)**
- [ ] Single Sign-On (SSO) integration
- [ ] Multi-factor authentication (MFA)
- [ ] Session management
- [ ] Password policies

## 🚀 **Getting Started**

### **Prerequisites:**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### **Local Development:**

```bash
# Clone the repository
git clone https://github.com/franzenjb/arc-relationship-manager-v2.git
cd arc-relationship-manager-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### **Environment Variables:**

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 **Features**

### **Currently Implemented:**
- ✅ Organization management (CRUD operations)
- ✅ Contact/person management
- ✅ Meeting/interaction tracking
- ✅ Geographic hierarchy (Division → Region → Chapter → County)
- ✅ Search and filtering
- ✅ Card and table views
- ✅ Address and contact information display
- ✅ Relationship manager assignment
- ✅ Activity tracking

### **Pending Implementation:**
- ⏳ User authentication and login
- ⏳ Role-based access control
- ⏳ Real audit trails
- ⏳ Data export functionality
- ⏳ Email notifications
- ⏳ Advanced reporting

## 🗂️ **Project Structure**

```
arc-relationship-manager-v2/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── organizations/ # Organization management
│   │   ├── people/       # Contact management
│   │   ├── meetings/     # Meeting tracking
│   │   └── tech-stack/   # System documentation
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components
│   ├── lib/             # Business logic and services
│   │   ├── supabase.ts  # Database connection
│   │   ├── organizations.ts
│   │   ├── people.ts
│   │   ├── meetings.ts
│   │   └── types.ts     # TypeScript interfaces
│   └── styles/          # Global styles
├── supabase/
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## ⚠️ **Known Issues**

1. **NO AUTHENTICATION** - System is completely open (see security notice above)
2. **Hardcoded User** - All actions appear as "Jeff Franzen"
3. **No Data Validation** - Limited client-side validation only
4. **No Backup System** - Manual database backups required
5. **Limited Error Handling** - Some edge cases not covered

## 📝 **Database Migrations**

Recent migrations that need to be run:
```sql
-- Add missing columns to meetings table
ALTER TABLE meetings 
ADD COLUMN IF NOT EXISTS other_organizations UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS rc_attendees UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attendees UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Update counties table structure
ALTER TABLE counties 
ADD COLUMN IF NOT EXISTS division VARCHAR(255),
ADD COLUMN IF NOT EXISTS division_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS region VARCHAR(255),
ADD COLUMN IF NOT EXISTS region_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS chapter VARCHAR(255),
ADD COLUMN IF NOT EXISTS chapter_code VARCHAR(50);
```

## 👥 **Contributors**

- **Development:** Jeff Franzen (Jeff.Franzen2@redcross.org)
- **Database Design:** Gary Pelletier, Tasneem Hakim, Jim Manson
- **Project Support:** American Red Cross National Headquarters

## 📞 **Support**

For questions, issues, or support:
- **Email:** Jeff.Franzen2@redcross.org
- **Phone:** 703-957-5711
- **GitHub Issues:** https://github.com/franzenjb/arc-relationship-manager-v2/issues

## 🔴 **American Red Cross**

This system is developed for the American Red Cross to manage partnerships and stakeholder relationships across regions, chapters, and counties. It supports the Red Cross mission of preventing and alleviating human suffering in the face of emergencies.

---

**Last Updated:** January 24, 2025  
**Version:** 2.0.0 (No Authentication)  
**Status:** Development/Demo (NOT FOR PRODUCTION USE WITHOUT AUTHENTICATION)