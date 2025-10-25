// Region-specific map configurations
import { getUserRegion } from '@/lib/auth'

// City coordinates by region
export const REGION_COORDINATES: Record<string, Record<string, [number, number]>> = {
  FLORIDA: {
    'miami': [25.7617, -80.1918],
    'tampa': [27.9506, -82.4572],
    'orlando': [28.5383, -81.3792],
    'jacksonville': [30.3322, -81.6557],
    'tallahassee': [30.4518, -84.27277],
    'fort lauderdale': [26.1224, -80.1373],
    'st. petersburg': [27.7676, -82.6403],
    'gainesville': [29.6516, -82.3248],
    'west palm beach': [26.7153, -80.0534],
    'naples': [26.1420, -81.7948],
    'fort myers': [26.5628, -81.8495],
    'cape coral': [26.5629, -81.9495],
    'pensacola': [30.4213, -87.2169],
    'sarasota': [27.3364, -82.5307],
    'clearwater': [27.9659, -82.8001],
    'lakeland': [28.0395, -81.9498],
    'melbourne': [28.0836, -80.6081]
  },
  NEBRASKA_IOWA: {
    // Nebraska cities
    'omaha': [41.2565, -95.9345],
    'lincoln': [40.8136, -96.7026],
    'bellevue': [41.1370, -95.8916],
    'grand island': [40.9264, -98.3420],
    'kearney': [40.6994, -99.0817],
    'fremont': [41.4332, -96.4981],
    'norfolk': [42.0341, -97.4170],
    'north platte': [41.1238, -100.7654],
    'columbus': [41.4302, -97.3559],
    'papillion': [41.1544, -96.0436],
    'la vista': [41.1836, -96.0311],
    'scottsbluff': [41.8666, -103.6672],
    
    // Iowa cities  
    'des moines': [41.5868, -93.6250],
    'cedar rapids': [42.0080, -91.6441],
    'davenport': [41.5236, -90.5776],
    'sioux city': [42.4999, -96.4003],
    'waterloo': [42.4928, -92.3426],
    'iowa city': [41.6611, -91.5302],
    'council bluffs': [41.2619, -95.8608],
    'dubuque': [42.5001, -90.6665],
    'ames': [42.0341, -93.6202],
    'west des moines': [41.5772, -93.7108],
    'cedar falls': [42.5341, -92.4454],
    'urbandale': [41.6266, -93.7824],
    'marion': [42.0341, -91.5968],
    'bettendorf': [41.5245, -90.5151]
  }
}

// Region-specific filters
export const REGION_FILTERS = {
  FLORIDA: {
    regions: [
      { value: 'north_and_central', label: 'North and Central' },
      { value: 'south', label: 'South' }
    ],
    chapters: [
      { value: 'northwest_florida', label: 'Northwest Florida' },
      { value: 'capital_area', label: 'Capital Area' },
      { value: 'north_central_florida', label: 'North Central Florida' },
      { value: 'northeast_florida', label: 'Northeast Florida' },
      { value: 'central_florida_coast', label: 'Central Florida Coast' },
      { value: 'tampa_bay', label: 'Tampa Bay' },
      { value: 'mid_florida', label: 'Mid Florida' },
      { value: 'palm_beach_to_treasure_coast', label: 'Palm Beach to Treasure Coast' },
      { value: 'southwest_gulf_coast_to_glades', label: 'Southwest Gulf Coast to Glades' },
      { value: 'broward', label: 'Broward' },
      { value: 'greater_miami_to_the_keys', label: 'Greater Miami to the Keys' }
    ],
    counties: [
      { value: 'miami_dade', label: 'Miami-Dade County' },
      { value: 'broward', label: 'Broward County' },
      { value: 'palm_beach', label: 'Palm Beach County' },
      { value: 'orange', label: 'Orange County' },
      { value: 'hillsborough', label: 'Hillsborough County' },
      { value: 'pinellas', label: 'Pinellas County' },
      { value: 'duval', label: 'Duval County' },
      { value: 'leon', label: 'Leon County' },
      { value: 'polk', label: 'Polk County' },
      // ... add more as needed
    ]
  },
  NEBRASKA_IOWA: {
    regions: [
      { value: 'nebraska_iowa_region', label: 'Nebraska Iowa Region' }
    ],
    chapters: [
      { value: 'central_western_nebraska', label: 'Central and Western Nebraska' },
      { value: 'omaha_council_bluffs', label: 'Omaha Council Bluffs and Southwest Iowa' },
      { value: 'southeast_nebraska', label: 'Southeast Nebraska' },
      { value: 'northwest_iowa_northeast_nebraska', label: 'Northwest Iowa and Northeast Nebraska' },
      { value: 'eastern_iowa', label: 'Eastern Iowa' },
      { value: 'northern_central_iowa', label: 'Northern and Central Iowa' }
    ],
    counties: [
      // Nebraska counties
      { value: 'douglas', label: 'Douglas County, NE' },
      { value: 'lancaster', label: 'Lancaster County, NE' },
      { value: 'sarpy', label: 'Sarpy County, NE' },
      { value: 'hall', label: 'Hall County, NE' },
      { value: 'buffalo', label: 'Buffalo County, NE' },
      { value: 'adams', label: 'Adams County, NE' },
      { value: 'scotts_bluff', label: 'Scotts Bluff County, NE' },
      
      // Iowa counties
      { value: 'polk', label: 'Polk County, IA' },
      { value: 'linn', label: 'Linn County, IA' },
      { value: 'scott', label: 'Scott County, IA' },
      { value: 'johnson', label: 'Johnson County, IA' },
      { value: 'black_hawk', label: 'Black Hawk County, IA' },
      { value: 'woodbury', label: 'Woodbury County, IA' },
      { value: 'pottawattamie', label: 'Pottawattamie County, IA' }
    ]
  },
  NATIONAL: {
    regions: [
      // Florida regions
      { value: 'north_and_central', label: 'North and Central Florida' },
      { value: 'south', label: 'South Florida' },
      // Nebraska/Iowa regions
      { value: 'nebraska_iowa_region', label: 'Nebraska Iowa Region' },
      // Other national regions can be added here
      { value: 'mid_atlantic', label: 'Mid-Atlantic Region' },
      { value: 'southeast', label: 'Southeast Region' }
    ],
    chapters: [
      // Florida chapters
      { value: 'northwest_florida', label: 'Northwest Florida' },
      { value: 'capital_area', label: 'Capital Area (FL)' },
      { value: 'north_central_florida', label: 'North Central Florida' },
      { value: 'northeast_florida', label: 'Northeast Florida' },
      { value: 'central_florida_coast', label: 'Central Florida Coast' },
      { value: 'tampa_bay', label: 'Tampa Bay' },
      { value: 'mid_florida', label: 'Mid Florida' },
      { value: 'palm_beach_to_treasure_coast', label: 'Palm Beach to Treasure Coast' },
      { value: 'southwest_gulf_coast_to_glades', label: 'Southwest Gulf Coast to Glades' },
      { value: 'broward', label: 'Broward' },
      { value: 'greater_miami_to_the_keys', label: 'Greater Miami to the Keys' },
      // Nebraska/Iowa chapters
      { value: 'central_western_nebraska', label: 'Central and Western Nebraska' },
      { value: 'omaha_council_bluffs', label: 'Omaha Council Bluffs and Southwest Iowa' },
      { value: 'southeast_nebraska', label: 'Southeast Nebraska' },
      { value: 'northwest_iowa_northeast_nebraska', label: 'Northwest Iowa and Northeast Nebraska' },
      { value: 'eastern_iowa', label: 'Eastern Iowa' },
      { value: 'northern_central_iowa', label: 'Northern and Central Iowa' },
      // Other national chapters can be added here
      { value: 'national_capital', label: 'National Capital Area' },
      { value: 'maryland', label: 'Maryland' },
      { value: 'pennsylvania', label: 'Pennsylvania' }
    ],
    counties: [
      // Florida counties
      { value: 'miami_dade', label: 'Miami-Dade County, FL' },
      { value: 'broward', label: 'Broward County, FL' },
      { value: 'palm_beach', label: 'Palm Beach County, FL' },
      { value: 'orange', label: 'Orange County, FL' },
      { value: 'hillsborough', label: 'Hillsborough County, FL' },
      { value: 'pinellas', label: 'Pinellas County, FL' },
      { value: 'duval', label: 'Duval County, FL' },
      { value: 'leon', label: 'Leon County, FL' },
      { value: 'polk', label: 'Polk County, FL' },
      // Nebraska counties
      { value: 'douglas', label: 'Douglas County, NE' },
      { value: 'lancaster', label: 'Lancaster County, NE' },
      { value: 'sarpy', label: 'Sarpy County, NE' },
      { value: 'hall', label: 'Hall County, NE' },
      { value: 'buffalo', label: 'Buffalo County, NE' },
      { value: 'adams', label: 'Adams County, NE' },
      { value: 'scotts_bluff', label: 'Scotts Bluff County, NE' },
      // Iowa counties
      { value: 'polk_ia', label: 'Polk County, IA' },
      { value: 'linn', label: 'Linn County, IA' },
      { value: 'scott', label: 'Scott County, IA' },
      { value: 'johnson', label: 'Johnson County, IA' },
      { value: 'black_hawk', label: 'Black Hawk County, IA' },
      { value: 'woodbury', label: 'Woodbury County, IA' },
      { value: 'pottawattamie', label: 'Pottawattamie County, IA' },
      // Other states
      { value: 'baltimore_city', label: 'Baltimore City, MD' },
      { value: 'philadelphia', label: 'Philadelphia County, PA' },
      { value: 'arlington', label: 'Arlington County, VA' }
    ]
  }
}

// Get coordinates for a city based on current region
export function getCoordinatesForRegion(city?: string): [number, number] | null {
  if (!city) return null
  
  const userRegion = getUserRegion()
  if (!userRegion) return null
  
  const regionCoords = REGION_COORDINATES[userRegion as keyof typeof REGION_COORDINATES]
  if (!regionCoords) return null
  
  const normalized = city.toLowerCase().trim()
  return regionCoords[normalized] || null
}

// Get filters for current region (DEPRECATED - use GeographyService instead)
export function getFiltersForRegion() {
  const userRegion = getUserRegion()
  if (!userRegion) return REGION_FILTERS.FLORIDA // Default to Florida
  
  return REGION_FILTERS[userRegion as keyof typeof REGION_FILTERS] || REGION_FILTERS.FLORIDA
}

// New dynamic filters using geography service
export async function getDynamicFiltersForRegion() {
  const userRegion = getUserRegion()
  if (!userRegion) return null

  const { GeographyService } = await import('@/lib/geography')
  
  try {
    const [regions, chapters] = await Promise.all([
      GeographyService.getRegionsForUser(userRegion),
      GeographyService.getChaptersForUser(userRegion)
    ])

    return {
      regions,
      chapters,
      counties: [] // Can be populated based on selected state/region
    }
  } catch (error) {
    console.error('Failed to load dynamic filters:', error)
    // Fallback to static filters
    return getFiltersForRegion()
  }
}