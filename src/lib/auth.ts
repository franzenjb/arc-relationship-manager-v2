// Simple auth utilities for region-based access
// This is a temporary solution until proper user auth is implemented

export function setUserRegion(region: string, userName: string = 'User') {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('userRegion', region)
    sessionStorage.setItem('userName', userName)
    
    // Also set cookies for middleware to access
    document.cookie = `userRegion=${region}; path=/; max-age=86400` // 24 hours
    document.cookie = `userName=${userName}; path=/; max-age=86400`
  }
}

export function getUserRegion(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('userRegion')
  }
  return null
}

export function getUserName(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('userName')
  }
  return null
}

export function clearUserRegion() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('userRegion')
    sessionStorage.removeItem('userName')
    
    // Also clear cookies
    document.cookie = 'userRegion=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'userName=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
  }
}

export function isAuthenticated(): boolean {
  return getUserRegion() !== null
}