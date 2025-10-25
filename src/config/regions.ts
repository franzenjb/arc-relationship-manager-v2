// Region Configuration with Maps and Access
export const REGIONS = {
  FLORIDA: {
    name: 'Florida',
    code: 'FLORIDA',
    password: 'RedCrossFlorida2025!', // Change this!
    states: ['FL'],
    map: {
      center: [27.6648, -81.5158] as [number, number],
      zoom: 7,
      bounds: {
        north: 31.0,
        south: 24.5,
        east: -79.5,
        west: -87.6
      }
    },
    colors: {
      primary: '#ED1B2E', // Red Cross Red
      secondary: '#6B6B6B'
    },
    contacts: {
      lead: 'Florida Regional Lead',
      email: 'florida.lead@redcross.org',
      phone: '(305) 555-0100'
    }
  },
  NEBRASKA_IOWA: {
    name: 'Nebraska & Iowa',
    code: 'NEBRASKA_IOWA',
    password: 'RedCrossMidwest2025!', // Change this!
    states: ['NE', 'IA'],
    map: {
      center: [41.5, -95.9] as [number, number],
      zoom: 6,
      bounds: {
        north: 43.5,
        south: 40.0,
        east: -90.0,
        west: -104.0
      }
    },
    colors: {
      primary: '#ED1B2E',
      secondary: '#0052CC'
    },
    contacts: {
      lead: 'Midwest Regional Lead',
      email: 'midwest.lead@redcross.org',
      phone: '(402) 555-0100'
    }
  },
  NATIONAL: {
    name: 'National Headquarters',
    code: 'NATIONAL',
    password: 'RedCrossHQ2025Admin!', // Change this!
    states: [], // All states
    map: {
      center: [39.8283, -98.5795] as [number, number], // Center of USA
      zoom: 4,
      bounds: {
        north: 49.0,
        south: 24.5,
        east: -66.9,
        west: -125.0
      }
    },
    colors: {
      primary: '#ED1B2E',
      secondary: '#231F20'
    },
    contacts: {
      lead: 'National Coordinator',
      email: 'hq@redcross.org',
      phone: '(202) 555-0100'
    }
  }
}

export type RegionCode = keyof typeof REGIONS;

// Get region from environment or default to Florida
export function getCurrentRegion() {
  const regionCode = (process.env.NEXT_PUBLIC_REGION || 'FLORIDA') as RegionCode;
  return REGIONS[regionCode] || REGIONS.FLORIDA;
}

// Validate region password
export function validateRegionAccess(regionCode: string, password: string): boolean {
  const region = REGIONS[regionCode as RegionCode];
  if (!region) return false;
  return region.password === password;
}

// Store region in session
export function setUserRegion(regionCode: string, userName?: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('userRegion', regionCode);
    sessionStorage.setItem('userName', userName || 'User');
    sessionStorage.setItem('loginTime', new Date().toISOString());
  }
}

// Get current user's region
export function getUserRegion(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('userRegion');
  }
  return null;
}

// Clear session
export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.clear();
    window.location.href = '/login';
  }
}