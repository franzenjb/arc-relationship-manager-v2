-- Direct database setup via psql
-- Complete reset and explicit permissions

-- Drop and recreate schema with full permissions
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Grant all permissions to all roles
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- Create organizations table with explicit schema
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  mission_area TEXT,
  organization_type TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create people table
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  title TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create meetings table  
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT,
  summary TEXT,
  follow_up_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant explicit permissions on tables
GRANT ALL ON public.organizations TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.people TO anon, authenticated, service_role, postgres;
GRANT ALL ON public.meetings TO anon, authenticated, service_role, postgres;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;

-- Insert sample data
INSERT INTO public.organizations (name, mission_area, organization_type, address, city, state, zip, website, phone, notes, status) VALUES
('FEMA Region III', 'disaster_relief', 'government', '615 Chestnut Street', 'Philadelphia', 'PA', '19106', 'https://www.fema.gov/region-iii', '(215) 931-5500', 'Federal emergency management coordination', 'active'),
('Johns Hopkins Hospital', 'health_safety', 'healthcare', '1800 Orleans Street', 'Baltimore', 'MD', '21287', 'https://www.hopkinsmedicine.org', '(410) 955-5000', 'Major medical center partnership', 'active'),
('Salvation Army NCA', 'disaster_relief', 'nonprofit', '2626 Pennsylvania Avenue NW', 'Washington', 'DC', '20037', 'https://salvationarmynca.org', '(202) 756-2600', 'Emergency shelter and services', 'active'),
('Amazon Web Services', 'disaster_relief', 'business', '410 Terry Avenue North', 'Seattle', 'WA', '98109', 'https://aws.amazon.com', '(206) 266-1000', 'Cloud infrastructure solutions', 'active'),
('Washington National Cathedral', 'disaster_relief', 'faith_based', '3101 Wisconsin Avenue NW', 'Washington', 'DC', '20016', 'https://cathedral.org', '(202) 537-6200', 'Interfaith disaster response', 'active');

-- Insert sample people
INSERT INTO public.people (org_id, first_name, last_name, title, email, phone, notes)
SELECT org.id, first_name, last_name, title, email, phone, notes
FROM (VALUES
  ('FEMA Region III', 'Michael', 'Rodriguez', 'Regional Administrator', 'michael.rodriguez@fema.dhs.gov', '(215) 931-5501', 'Primary FEMA contact'),
  ('Johns Hopkins Hospital', 'Dr. Sarah', 'Kim', 'Emergency Department Director', 'skim@jhmi.edu', '(410) 955-5001', 'Emergency medical services'),
  ('Salvation Army NCA', 'Major John', 'Williams', 'Area Commander', 'john.williams@uss.salvationarmy.org', '(202) 756-2601', 'Regional operations')
) AS people_data(org_name, first_name, last_name, title, email, phone, notes)
JOIN public.organizations org ON org.name = people_data.org_name;

-- Insert sample meetings
INSERT INTO public.meetings (org_id, date, location, summary, follow_up_date)
SELECT org.id, meeting_date::date, location, summary, follow_up_date::date
FROM (VALUES
  ('FEMA Region III', '2024-01-15', 'ARC National Headquarters', 'Quarterly coordination meeting discussing 2024 disaster preparedness initiatives', '2024-04-15'),
  ('Johns Hopkins Hospital', '2024-01-28', 'Johns Hopkins Hospital', 'Medical surge planning session focused on hospital capacity during emergencies', '2024-03-01')
) AS meeting_data(org_name, meeting_date, location, summary, follow_up_date)
JOIN public.organizations org ON org.name = meeting_data.org_name;

-- Verify data
SELECT 'Database setup complete!' as status,
       (SELECT COUNT(*) FROM public.organizations) as organizations_count,
       (SELECT COUNT(*) FROM public.people) as people_count,
       (SELECT COUNT(*) FROM public.meetings) as meetings_count;