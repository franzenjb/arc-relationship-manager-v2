-- THIS IS THE EXACT SQL TO RUN IN SUPABASE
-- Go to: https://supabase.com/dashboard/project/yqucprgxgdnowjnzrtoz/sql/new
-- Paste this entire script and click RUN

-- First, update any references to the duplicates
UPDATE people 
SET org_id = '550e8400-e29b-41d4-a716-446655440304'
WHERE org_id = '7c0532e9-6b5b-4532-8ddb-ed022b6a6fe5';

UPDATE meetings 
SET org_id = '550e8400-e29b-41d4-a716-446655440304'
WHERE org_id = '7c0532e9-6b5b-4532-8ddb-ed022b6a6fe5';

UPDATE meetings 
SET lead_organization_id = '550e8400-e29b-41d4-a716-446655440304'
WHERE lead_organization_id = '7c0532e9-6b5b-4532-8ddb-ed022b6a6fe5';

-- Now delete the duplicates
DELETE FROM organizations WHERE id IN (
  '70536a63-08e2-4a60-a65b-1391a7366a0f',  -- Florida Div duplicate
  '7c0532e9-6b5b-4532-8ddb-ed022b6a6fe5',  -- Tampa General duplicate
  '4cbdc4fd-5d4b-434a-9ed3-fe9c9955a136'   -- United Way duplicate
);

-- Verify results
SELECT name, COUNT(*) as count, array_agg(id) as ids
FROM organizations
GROUP BY name
HAVING COUNT(*) > 1;

-- Final count
SELECT COUNT(*) as total_organizations FROM organizations;