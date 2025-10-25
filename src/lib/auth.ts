// Simple auth utilities for region-based access
// This is a temporary solution until proper user auth is implemented

export function setUserRegion(region: string, userName: string = 'User') {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('userRegion', region)
    sessionStorage.setItem('userName', userName)
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
  }
}

export function isAuthenticated(): boolean {
  return getUserRegion() !== null
}