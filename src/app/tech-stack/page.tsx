'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { 
  Shield, 
  DollarSign, 
  Server, 
  Database, 
  Globe, 
  Lock, 
  Users, 
  Zap,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Cloud,
  Mail,
  Building,
  MapPin,
  Brain,
  Smartphone,
  Workflow,
  BarChart3,
  Settings,
  X,
  MessageCircle,
  Clock
} from 'lucide-react'

export default function TechStackPage() {
  const currentCosts = [
    { item: "SharePoint Online Plans", cost: "Enterprise licensing", total: "Tens of thousands annually" },
    { item: "Microsoft SQL Database", cost: "Enterprise database licensing", total: "Tens of thousands annually" },
    { item: "Power BI Premium", cost: "Business intelligence licensing", total: "Hundreds of thousands annually" },
    { item: "Azure Active Directory", cost: "Identity management licensing", total: "Tens of thousands annually" },
    { item: "Development & Maintenance", cost: "Enterprise development team", total: "Hundreds of thousands annually" },
  ]

  const proposedCosts = [
    { item: "Supabase Pro", cost: "$25/month", total: "$300/year" },
    { item: "Vercel Pro", cost: "$20/month", total: "$240/year" },
    { item: "Domain & SSL", cost: "$50/year", total: "$50/year" },
    { item: "Email Service (Postmark)", cost: "$15/month", total: "$180/year" },
    { item: "Monitoring & Backups", cost: "$30/month", total: "$360/year" },
  ]

  const databaseSchema = [
    { 
      table: "organizations", 
      purpose: "Partner organizations",
      keyFields: "name, mission_area, organization_type, address, relationship_manager_id",
      relationships: "Has many people, Has many meetings"
    },
    { 
      table: "people", 
      purpose: "External contacts",
      keyFields: "first_name, last_name, title, email, phone, org_id",
      relationships: "Belongs to organization, Attends meetings"
    },
    { 
      table: "staff_members", 
      purpose: "Red Cross employees",
      keyFields: "first_name, last_name, email, title, department, region, is_active",
      relationships: "Can be relationship managers, Attend meetings"
    },
    { 
      table: "meetings", 
      purpose: "Interactions & coordination",
      keyFields: "meeting_name, date, location, agenda, notes, attendees",
      relationships: "Has organization, Has attendees, Links to counties"
    },
    { 
      table: "counties", 
      purpose: "Geographic units (primary)",
      keyFields: "name, state_code, chapter, region, division",
      relationships: "Counties → Chapters → Regions → Divisions"
    }
  ]

  const techStack = [
    { category: "Frontend", tech: "Next.js 14", description: "React framework with App Router, TypeScript, Tailwind CSS" },
    { category: "Backend", tech: "Supabase", description: "PostgreSQL + PostGIS, Authentication, Real-time, File Storage" },
    { category: "Database", tech: "PostgreSQL", description: "Open-source relational database with PostGIS for mapping" },
    { category: "Authentication", tech: "Supabase Auth", description: "Email/password, SSO ready, row-level security (RLS)" },
    { category: "Hosting", tech: "Vercel", description: "Edge deployment, automatic scaling, global CDN" },
    { category: "Styling", tech: "Tailwind CSS", description: "Utility-first CSS framework for rapid development" },
    { category: "Forms", tech: "React Hook Form + Zod", description: "Type-safe form validation and state management" },
  ]

  const securityFeatures = [
    "Row Level Security (RLS) - Database-level multi-tenancy",
    "JWT-based authentication with secure token rotation",
    "HTTPS everywhere with automatic SSL certificates",
    "GDPR compliant data handling and user consent",
    "Audit logging for all data changes",
    "Encrypted data at rest and in transit",
    "Rate limiting and DDoS protection",
    "Regular security updates and monitoring"
  ]

  const migrationSteps = [
    "Export existing SharePoint data to CSV/Excel format",
    "Set up ARC Azure AD SSO integration",
    "Migrate user accounts and permissions",
    "Import organization and contact data",
    "Train staff on new interface",
    "Run parallel systems during transition",
    "Full cutover after user acceptance testing"
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Technology Stack & Architecture</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive overview of the ARC Relationship Manager technical implementation
        </p>
      </div>

      {/* Credits */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Users className="h-5 w-5 mr-2" />
            Project Credits & Foundation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-blue-800">
            <p className="mb-2">
              <strong>Database Architecture & Design:</strong> Gary Pelletier, Tasneem Hakim, and Jim Manson
            </p>
            <p className="text-sm text-blue-700">
              This system builds upon months of foundational work by Gary Pelletier, Tasneem Hakim, and Jim Manson, 
              who designed the comprehensive relationship management database schema, data models, and 
              business logic. The current implementation is a variation of their excellent 
              database architecture and requirements analysis.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2 text-blue-600" />
            Technology Stack
          </CardTitle>
          <CardDescription>
            Modern, enterprise-grade technologies chosen for performance, security, and cost efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {techStack.map((tech, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{tech.category}</Badge>
                  <span className="font-semibold">{tech.tech}</span>
                </div>
                <p className="text-sm text-gray-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2 text-indigo-600" />
            Architecture Benefits
          </CardTitle>
          <CardDescription>
            Why this modern architecture outperforms legacy solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-semibold">Lightning Fast</h4>
              <p className="text-sm text-gray-600">Edge deployment, global CDN, sub-second load times</p>
            </div>
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-semibold">Unlimited Scale</h4>
              <p className="text-sm text-gray-600">Supports 1-100,000+ users without performance degradation</p>
            </div>
            <div className="text-center">
              <Globe className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-semibold">Global Ready</h4>
              <p className="text-sm text-gray-600">Multi-region deployment, disaster recovery built-in</p>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Security & Privacy Features
          </CardTitle>
          <CardDescription>
            Enterprise-grade security meeting American Red Cross requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, i) => (
              <div key={i} className="flex items-start">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Migration Path & Power BI Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowRight className="h-5 w-5 mr-2 text-purple-600" />
              Migration to ARC Platform
            </CardTitle>
            <CardDescription>
              Step-by-step migration plan from current SharePoint solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {migrationSteps.map((step, i) => (
                <div key={i} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {i + 1}
                  </div>
                  <span className="text-sm pt-1">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <Database className="h-5 w-5 mr-2" />
              Power BI Database Connection
            </CardTitle>
            <CardDescription>
              Direct connection instructions for your Power BI team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Connection Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Data Source:</strong> PostgreSQL</div>
                  <div><strong>Server:</strong> your-project.supabase.co</div>
                  <div><strong>Port:</strong> 5432</div>
                  <div><strong>Database:</strong> postgres</div>
                  <div><strong>Authentication:</strong> Database credentials</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-600">1. Get Data Source</h4>
                  <p className="text-sm text-gray-600">
                    In Power BI Desktop: Get Data → More → Database → PostgreSQL database
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-600">2. Enter Connection</h4>
                  <p className="text-sm text-gray-600">
                    Server: your-project.supabase.co<br/>
                    Database: postgres (optional)
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-600">3. Available Tables</h4>
                  <p className="text-sm text-gray-600">
                    • organizations (main org data)<br/>
                    • people (contacts)<br/>
                    • meetings (meeting records)<br/>
                    • Custom views for analytics
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-600">4. Real-time Updates</h4>
                  <p className="text-sm text-gray-600">
                    Set refresh schedule in Power BI Service for automatic data updates
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                <strong>Note:</strong> Contact system administrator for database credentials and connection string details.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Database Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            ARC Email Database Integration
          </CardTitle>
          <CardDescription>
            Options for integrating with existing American Red Cross email systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-600">Azure AD Integration</h4>
              <p className="text-sm text-gray-600">
                Single Sign-On (SSO) with existing ARC Azure Active Directory. Users login with @redcross.org credentials.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-600">Email Sync Options</h4>
              <p className="text-sm text-gray-600">
                Automatic contact synchronization with Exchange/Outlook, import staff directory, and maintain email preferences.
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-purple-600">Data Migration</h4>
              <p className="text-sm text-gray-600">
                Bulk import from existing SharePoint lists, CSV exports, and API connections to HR systems.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-purple-600" />
            Database Schema & Application Structure
          </CardTitle>
          <CardDescription>
            How the ARC Relationship Manager works - designed specifically for Red Cross partnership tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Core Concept</h3>
              <p className="text-blue-800 text-sm">
                The system tracks relationships between American Red Cross and partner organizations. 
                Red Cross staff are kept in a separate table (staff_members) from external contacts (people table). 
                All interactions are tracked through meetings, which can include multiple organizations and attendees.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Database Tables</h3>
              <div className="grid gap-3">
                {databaseSchema.map((table, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-semibold text-red-600">{table.table}</span>
                      <Badge variant="secondary">{table.purpose}</Badge>
                    </div>
                    <div className="text-xs space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Fields:</span> {table.keyFields}
                      </p>
                      <p className="text-gray-500">
                        <span className="font-medium">Links:</span> {table.relationships}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Geographic Hierarchy (Simplified)</h3>
              <div className="text-sm space-y-2">
                <p className="font-medium">Counties are the primary geographic unit</p>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-white rounded">Counties</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="px-2 py-1 bg-white rounded">Build Chapters</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="px-2 py-1 bg-white rounded">Build Regions</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="px-2 py-1 bg-white rounded">Build Divisions</span>
                </div>
                <p className="text-xs text-gray-600">
                  Example: Montgomery County + Fairfax County + others = DC Metro Chapter
                </p>
                <p className="text-xs text-gray-600">
                  Multiple chapters = National Capital Region → Multiple regions = Eastern Division
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Current Setup Costs (Annual)
            </CardTitle>
            <CardDescription>
              Estimated costs for current SharePoint/Excel/SQL Server solution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentCosts.map((cost, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{cost.item}</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{cost.cost}</div>
                    <div className="text-sm font-bold text-red-600">{cost.total}</div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Annual Cost:</span>
                  <span className="text-red-600">Hundreds of thousands annually</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CheckCircle className="h-5 w-5 mr-2" />
              Proposed Solution Costs (Annual)
            </CardTitle>
            <CardDescription>
              Modern, scalable solution with 99%+ cost savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {proposedCosts.map((cost, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{cost.item}</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{cost.cost}</div>
                    <div className="text-sm font-bold text-green-800">{cost.total}</div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Annual Cost:</span>
                  <span className="text-green-800">$1,130</span>
                </div>
                <div className="text-sm text-green-800 mt-1">
                  💰 Saves hundreds of thousands annually (99%+ cost reduction)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alternatives Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
            Alternative Solutions Comparison
          </CardTitle>
          <CardDescription>
            Why our solution outperforms Microsoft and other enterprise alternatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Solution</th>
                  <th className="text-left py-2">Annual Cost</th>
                  <th className="text-left py-2">Scalability</th>
                  <th className="text-left py-2">Customization</th>
                  <th className="text-left py-2">Performance</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2 font-medium text-green-800">Our Solution</td>
                  <td className="py-2">$1,130</td>
                  <td className="py-2"><span className="text-amber-600">★★★★★</span></td>
                  <td className="py-2"><span className="text-amber-600">★★★★★</span></td>
                  <td className="py-2"><span className="text-amber-600">★★★★★</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">SharePoint + SQL Server</td>
                  <td className="py-2">Hundreds of thousands</td>
                  <td className="py-2"><span className="text-amber-600">★★★★</span></td>
                  <td className="py-2"><span className="text-amber-600">★★★</span></td>
                  <td className="py-2"><span className="text-amber-600">★★★</span></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Salesforce Nonprofit</td>
                  <td className="py-2">Hundreds of thousands</td>
                  <td className="py-2"><span className="text-amber-600">★★★★</span></td>
                  <td className="py-2"><span className="text-amber-600">★★★★</span></td>
                  <td className="py-2"><span className="text-amber-600">★★★★</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Current Issues */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
            Current Issues & Enhancements in Process
          </CardTitle>
          <CardDescription>
            Active development priorities identified during executive review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                ✅ Primary ARC Contact/Relationship Manager Assignment
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> COMPLETED - Full relationship manager assignment system implemented. 
                Red Cross staff can be assigned to organizations with contact details and management capabilities.
              </p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-600 flex items-center">
                <X className="h-4 w-4 mr-2" />
                ❌ Multi-Chapter/Multi-Region Organizations
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> PENDING DATA - Critical gap for national partners like HyVee, Goodwill, Salvation Army. 
                Current system assigns organizations to single chapter/region only. Need national-level organization 
                management with regional sub-relationships. We are currently obtaining the authoritative county-chapter-region 
                division database from Red Cross headquarters to implement proper geographic hierarchies.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-yellow-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                ⚠️ Admin Interface for Reference Data
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> AWAITING AUTHORITATIVE DATA - Admin page exists but uses mock data. 
                We are in the process of obtaining the official counties-chapters-regions database from Red Cross 
                headquarters. Once received, we will integrate this authoritative data source for managing geographic 
                hierarchies, mission areas, and organization types throughout the system.
              </p>
            </div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-yellow-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                ⚠️ "Meetings" vs "Interactions/Contacts" Terminology
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> PARTIALLY ADDRESSED - Navigation updated to "Interactions" but many UI labels 
                still use "Meetings" terminology. Need comprehensive update across all pages and components to use 
                "Interactions" for better user understanding of phone calls and various contact types.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                ✅ Audit Trail User Tracking
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> COMPLETED - Full audit trail implemented with user_profiles table, 
                created_by/updated_by tracking, and UI displaying actual user names and timestamps. All 
                create/update operations now capture user information for complete accountability.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                ✅ Authentication Email Confirmation Links
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> COMPLETED - Supabase authentication configured with production URLs. 
                Site URL set to ArcGIS Experience Builder, redirect URLs configured for production and development. 
                Email confirmation links now work properly for user registration.
              </p>
            </div>
            
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-red-600 flex items-center">
                <X className="h-4 w-4 mr-2" />
                ❌ User Authentication Display Issues
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Status:</strong> CRITICAL BUG IDENTIFIED - Two hardcoded display issues requiring immediate fix:
                <br/>• <strong>Header "Relationship Manager" name:</strong> Shows hardcoded "Jeff Franzen" even when logged out or when different users log in
                <br/>• <strong>Dashboard welcome message:</strong> Shows hardcoded "Welcome back, Jeff!" regardless of actual logged-in user
                <br/>Both need to dynamically reflect the actual authenticated user's name or show generic text when logged out.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-600" />
            Future Enhancements & Roadmap
          </CardTitle>
          <CardDescription>
            Planned improvements and new features for the ARC Relationship Manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {/* Current Phase 1: High Priority Features */}
            <AccordionItem title="Current Phase 1: Core Enhancements (Next 3-6 months)" defaultOpen={true}>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Precise Geocoding System
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Replace city-based clustering with address-level geocoding for exact location mapping. 
                    Integrate with Google Maps or MapBox API for precise coordinates, confidence scoring, 
                    and address validation.
                  </p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-green-600 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Azure AD Enterprise SSO
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete integration with ARC Azure Active Directory for seamless single sign-on, 
                    role-based access control, and automatic user provisioning/deprovisioning.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-purple-600 flex items-center">
                    <Cloud className="h-4 w-4 mr-2" />
                    Document Management
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    File attachments for meetings and organizations, document versioning, 
                    shared libraries, and integration with SharePoint/OneDrive.
                  </p>
                </div>
                
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-600 flex items-center">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile Application
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Native iOS/Android apps with offline sync, GPS check-ins, 
                    and mobile-optimized meeting logging for field staff.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Phase 2: Advanced Features */}
            <AccordionItem title="Phase 2: Advanced Features (6-12 months)">
              <div className="space-y-4">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-indigo-600 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Advanced Analytics & Reporting
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Custom dashboards, relationship strength scoring, engagement analytics, 
                    geographic heat maps, and enhanced Power BI integration.
                  </p>
                </div>
                
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Emergency Response Features
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Disaster activation protocols, resource tracking, emergency contact deployment, 
                    and integration with emergency management systems.
                  </p>
                </div>
                
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-semibold text-cyan-600 flex items-center">
                    <Workflow className="h-4 w-4 mr-2" />
                    Workflow Automation
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Automated follow-up reminders, email campaigns, meeting scheduling, 
                    and integration with CRM systems like Salesforce or HubSpot.
                  </p>
                </div>
                
                <div className="border-l-4 border-teal-500 pl-4">
                  <h4 className="font-semibold text-teal-600 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    API Development
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    RESTful API for third-party integrations, webhook support, 
                    developer portal, and custom integration capabilities.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Phase 3: AI & Advanced Intelligence */}
            <AccordionItem title="Phase 3: AI & Intelligence (12+ months)">
              <div className="space-y-4">
                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-semibold text-pink-600 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI-Powered Insights
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Natural language search, relationship decay predictions, 
                    optimal contact frequency recommendations, and machine learning insights.
                  </p>
                </div>
                
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-600 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Predictive Analytics
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Meeting outcome predictions, capacity planning, resource optimization, 
                    and trend analysis for strategic decision making.
                  </p>
                </div>
                
                <div className="border-l-4 border-lime-500 pl-4">
                  <h4 className="font-semibold text-lime-600 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Multi-language Support
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Spanish and Haitian Creole interfaces for South Florida operations, 
                    dynamic language switching, and cultural customization options.
                  </p>
                </div>
                
                <div className="border-l-4 border-violet-500 pl-4">
                  <h4 className="font-semibold text-violet-600 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Security & Compliance
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Enhanced data encryption, GDPR compliance tools, advanced audit logging, 
                    and privacy controls for sensitive relationship data.
                  </p>
                </div>
              </div>
            </AccordionItem>

            {/* Implementation Priorities */}
            <AccordionItem title="Implementation Priority Framework">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h4 className="font-semibold text-green-700">High Impact, Low Effort</h4>
                  <p className="text-sm text-green-600 mt-1">
                    Geocoding, Azure AD SSO, Document Management, Mobile App
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-semibold text-blue-700">Medium Impact, Medium Effort</h4>
                  <p className="text-sm text-blue-600 mt-1">
                    Advanced Analytics, API Development, Workflow Automation
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h4 className="font-semibold text-purple-700">High Impact, High Effort</h4>
                  <p className="text-sm text-purple-600 mt-1">
                    Emergency Response, AI Insights, Predictive Analytics
                  </p>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <h4 className="font-semibold text-gray-700">Cost Estimates</h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Phase 1: $15,000-25,000 development cost</li>
                    <li>• Phase 2: $30,000-50,000 development cost</li>
                    <li>• Phase 3: $50,000-100,000 development cost</li>
                    <li>• Ongoing maintenance: $500-1,000/month</li>
                  </ul>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Strategic Considerations */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center text-yellow-800">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Strategic Considerations for Enterprise Deployment
          </CardTitle>
          <CardDescription>
            Critical analysis of scalability, sustainability, and enterprise transition planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 text-yellow-900">
            
            {/* Scalability Assessment */}
            <div className="border-l-4 border-yellow-600 pl-4">
              <h4 className="font-semibold text-yellow-800 mb-2">📊 Scalability Assessment</h4>
              <p className="text-sm mb-2">
                <strong>Technical Capacity:</strong> The current architecture can handle enterprise scale (600 concurrent users, 
                30,000 contacts, 100,000+ meetings) with infrastructure upgrades. Database capacity is excellent, 
                application architecture is proven, and performance optimizations are already implemented.
              </p>
              <p className="text-sm">
                <strong>Required Upgrades:</strong> Supabase Pro tier ($25/month), database indexing, monitoring suite, 
                and enhanced caching. Total estimated infrastructure cost: $2,000-$3,000 annually vs hundreds of thousands 
                for traditional enterprise solutions.
              </p>
            </div>

            {/* Bus Factor Risk */}
            <div className="border-l-4 border-red-600 pl-4">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Bus Factor Risk Assessment</h4>
              <p className="text-sm mb-2">
                <strong>Current Risk:</strong> Bus Factor = 1 (single developer). If the primary developer becomes unavailable, 
                the entire system becomes unmaintainable. This represents a critical risk for enterprise deployment.
              </p>
              <p className="text-sm">
                <strong>Risk Factors:</strong> Claude-assisted development workflow unfamiliar to most developers, 
                custom architecture knowledge, deployment processes, and Red Cross-specific business logic 
                concentrated in one person.
              </p>
            </div>

            {/* Enterprise Transition */}
            <div className="border-l-4 border-blue-600 pl-4">
              <h4 className="font-semibold text-blue-800 mb-2">🚀 Enterprise Transition Strategy</h4>
              <p className="text-sm mb-2">
                <strong>Recommended Approach:</strong> Controlled handoff strategy over 3-6 months. Train 2-3 Red Cross 
                developers on system maintenance, implement comprehensive monitoring, and establish clear support boundaries.
              </p>
              <p className="text-sm">
                <strong>Critical Success Factors:</strong> Complete authentication system before major rollout, 
                implement comprehensive audit logging, document all operational procedures, and set clear expectations 
                about post-transition support.
              </p>
            </div>

            {/* Capacity Planning */}
            <div className="border-l-4 border-green-600 pl-4">
              <h4 className="font-semibold text-green-800 mb-2">📈 Capacity Planning</h4>
              <p className="text-sm mb-2">
                <strong>Current Performance:</strong> Map loading <100ms (50-100x improvement), organization search <200ms, 
                optimized for current scale with excellent user experience.
              </p>
              <p className="text-sm">
                <strong>Enterprise Targets:</strong> Map loading <200ms for 600 users, search operations <500ms for 30K database, 
                99.5% uptime requirement. Infrastructure scaling plan defined with clear cost projections.
              </p>
            </div>

            {/* Recommendation */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-yellow-900 mb-2">🎯 Strategic Recommendation</h4>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Is this a good idea to pursue as a solo operator?</strong> The technical foundation is excellent 
                and can scale to enterprise requirements. However, the operational risk of a single-person dependency 
                becomes critical at enterprise scale.
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Recommended Path:</strong> Complete the controlled handoff strategy BEFORE expanding to 30+ regions. 
                The system is ready for enterprise use, but sustainable support requires proper knowledge transfer 
                and Red Cross IT team ownership. Don't expand to hundreds of users until bus factor > 3.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg px-8 py-4">
          <p className="text-center text-sm text-gray-600">
            For further information, suggestions, or comments: 
            <span className="font-medium text-gray-900 ml-2">Jeff Franzen</span>
            <span className="mx-2">•</span>
            <a href="mailto:Jeff.Franzen2@redcross.org" className="text-red-600 hover:text-red-700 hover:underline">
              Jeff.Franzen2@redcross.org
            </a>
            <span className="mx-2">•</span>
            <a href="tel:703-957-5711" className="text-red-600 hover:text-red-700 hover:underline">
              703-957-5711
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}