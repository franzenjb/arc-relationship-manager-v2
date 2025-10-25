// Temporary Red Cross Geographic Hierarchy
// Based on known structure - will be updated with full ArcGIS data

export const RED_CROSS_DIVISIONS = {
  EASTERN: {
    name: 'Eastern Division',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC', 'VA', 'WV']
  },
  CENTRAL_SOUTH: {
    name: 'Central and South Division', 
    states: ['OH', 'IN', 'IL', 'MI', 'WI', 'KY', 'TN', 'NC', 'SC', 'GA', 'FL', 'AL', 'MS']
  },
  MIDWEST_PLAINS: {
    name: 'Midwest and Plains Division',
    states: ['MN', 'IA', 'MO', 'AR', 'LA', 'TX', 'OK', 'KS', 'NE', 'SD', 'ND']
  },
  SOUTHWEST_ROCKY_MOUNTAIN: {
    name: 'Southwest and Rocky Mountain Division',
    states: ['MT', 'ID', 'WY', 'CO', 'NM', 'AZ', 'UT', 'NV']
  },
  PACIFIC: {
    name: 'Pacific Division',
    states: ['WA', 'OR', 'CA', 'AK', 'HI']
  }
}

// Known regions for our current implementation
export const KNOWN_REGIONS = {
  FLORIDA: {
    division: 'Central and South Division',
    regions: [
      {
        name: 'South Florida Region',
        chapters: [
          { name: 'Greater Miami & The Keys', counties: ['Miami-Dade', 'Monroe'] },
          { name: 'Broward County', counties: ['Broward'] },
          { name: 'Palm Beach County', counties: ['Palm Beach'] }
        ]
      },
      {
        name: 'Central Florida Region',
        chapters: [
          { name: 'Central Florida', counties: ['Orange', 'Osceola', 'Seminole', 'Lake'] },
          { name: 'Tampa Bay', counties: ['Hillsborough', 'Pinellas', 'Pasco'] },
          { name: 'Southwest Florida', counties: ['Lee', 'Collier', 'Charlotte', 'Sarasota', 'Manatee'] }
        ]
      },
      {
        name: 'North Florida Region',
        chapters: [
          { name: 'Northeast Florida', counties: ['Duval', 'Clay', 'St. Johns', 'Nassau', 'Baker'] },
          { name: 'Capital Area', counties: ['Leon', 'Gadsden', 'Jefferson', 'Wakulla'] },
          { name: 'Northwest Florida', counties: ['Escambia', 'Santa Rosa', 'Okaloosa', 'Walton'] }
        ]
      }
    ]
  },
  
  NEBRASKA_IOWA: {
    division: 'Midwest and Plains Division',
    regions: [
      {
        name: 'Nebraska Region',
        chapters: [
          { name: 'Heartland Chapter', counties: ['Douglas', 'Sarpy', 'Washington', 'Dodge', 'Saunders'] },
          { name: 'Southeast Nebraska Chapter', counties: ['Lancaster', 'Cass', 'Otoe', 'Seward'] },
          { name: 'Central Nebraska Chapter', counties: ['Hall', 'Buffalo', 'Adams', 'Kearney'] },
          { name: 'Western Nebraska Chapter', counties: ['Scotts Bluff', 'Cheyenne', 'Box Butte'] }
        ]
      },
      {
        name: 'Iowa Region',
        chapters: [
          { name: 'Central Iowa Chapter', counties: ['Polk', 'Dallas', 'Warren', 'Madison', 'Marion'] },
          { name: 'Eastern Iowa Chapter', counties: ['Linn', 'Johnson', 'Scott', 'Black Hawk'] },
          { name: 'Western Iowa Chapter', counties: ['Pottawattamie', 'Woodbury', 'Harrison'] },
          { name: 'Southern Iowa Chapter', counties: ['Wapello', 'Jefferson', 'Henry', 'Des Moines'] }
        ]
      }
    ]
  }
}

// Function to get chapter for a county
export function getChapterForCounty(countyName: string, state: string): string | null {
  for (const [regionKey, regionData] of Object.entries(KNOWN_REGIONS)) {
    for (const region of regionData.regions) {
      for (const chapter of region.chapters) {
        if (chapter.counties.some(c => c.toLowerCase() === countyName.toLowerCase())) {
          return chapter.name
        }
      }
    }
  }
  return null
}

// Function to get region for a state
export function getRegionForState(state: string): string | null {
  // Check our known regions first
  if (state === 'FL') return 'FLORIDA'
  if (state === 'NE' || state === 'IA') return 'NEBRASKA_IOWA'
  
  // Return division for other states
  for (const [divKey, divData] of Object.entries(RED_CROSS_DIVISIONS)) {
    if (divData.states.includes(state)) {
      return divKey
    }
  }
  return null
}