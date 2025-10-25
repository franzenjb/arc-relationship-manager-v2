// Red Cross Geographic Hierarchy
// Source: ArcGIS Master_RC_Geo_County_2025 (3,162 counties)
// Updated: October 2025

export const RED_CROSS_DIVISIONS = {
  CENTRAL_ATLANTIC: {
    name: 'Central Atlantic Division',
    code: 'D24',
    states: ['DC', 'DE', 'MD', 'PA', 'VA', 'WV']
  },
  NORTH_CENTRAL: {
    name: 'North Central Division',
    code: 'D23',
    states: ['IA', 'IL', 'IN', 'MI', 'MN', 'NE', 'ND', 'SD', 'WI']
  },
  NORTHEAST: {
    name: 'Northeast Division',
    code: 'D27',
    states: ['CT', 'MA', 'ME', 'NH', 'NJ', 'NY', 'RI', 'VT']
  },
  PACIFIC: {
    name: 'Pacific Division',
    code: 'D21',
    states: ['AK', 'AS', 'CA', 'GU', 'HI', 'ID', 'MP', 'MT', 'OR', 'WA']
  },
  SOUTHEAST_CARIBBEAN: {
    name: 'Southeast and Caribbean Division',
    code: 'D25',
    states: ['AL', 'FL', 'GA', 'KY', 'MS', 'NC', 'PR', 'SC', 'TN', 'VI']
  },
  SOUTHWEST_ROCKY_MOUNTAIN: {
    name: 'Southwest and Rocky Mountain Division',
    code: 'D22',
    states: ['AR', 'AZ', 'CO', 'KS', 'LA', 'MO', 'NM', 'NV', 'OK', 'TX', 'UT', 'WY']
  }
}

// Region configurations based on actual ArcGIS data
export const KNOWN_REGIONS = {
  FLORIDA: {
    division: 'Southeast and Caribbean Division',
    divisionCode: 'D25',
    regions: [
      {
        name: 'South Florida Region',
        code: '10R12',
        chapters: 5,
        counties: 18
      },
      {
        name: 'North and Central Florida Region',
        code: '10R08',
        chapters: 7,
        counties: 52
      }
    ]
  },
  
  NEBRASKA_IOWA: {
    division: 'North Central Division',
    divisionCode: 'D23',
    regions: [
      {
        name: 'Nebraska Iowa Region',
        code: '15R08',
        chapters: 6,
        counties: 193,
        chapterDetails: [
          { name: 'ARC of Central and Western Nebraska', code: '27172', states: ['NE'] },
          { name: 'ARC of Omaha Council Bluffs and Southwest Iowa', code: '27186', states: ['NE', 'IA'] },
          { name: 'ARC of Southeast Nebraska', code: '27234', states: ['NE'] },
          { name: 'ARC of Northwest Iowa and Northeast Nebraska', code: '15422', states: ['NE', 'IA'] },
          { name: 'ARC of Eastern Iowa', code: '15148', states: ['IA'] },
          { name: 'ARC of Northern and Central Iowa', code: '15080', states: ['IA'] }
        ]
      }
    ]
  }
}

// Total counts from the data
export const GEOGRAPHY_STATS = {
  totalDivisions: 6,
  totalRegions: 48,
  totalChapters: 225,
  totalStates: 55,
  totalCounties: 3162
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

// Function to get division for a state
export function getDivisionForState(state: string): string | null {
  for (const [divKey, divData] of Object.entries(RED_CROSS_DIVISIONS)) {
    if (divData.states.includes(state)) {
      return divKey
    }
  }
  return null
}