'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { REGIONS, RegionCode, validateRegionAccess, setUserRegion } from '@/config/regions'
import { MapPin, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>('FLORIDA')
  const [password, setPassword] = useState('')
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (validateRegionAccess(selectedRegion, password)) {
        setUserRegion(selectedRegion, userName || 'User')
        router.push('/organizations')
      } else {
        setError('Access denied for selected region')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ARC Relationship Manager</h1>
                <p className="text-red-100 text-sm">Select your region to continue</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Region
              </label>
              <div className="space-y-2">
                {Object.entries(REGIONS).map(([code, region]) => (
                  <label
                    key={code}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRegion === code
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="region"
                      value={code}
                      checked={selectedRegion === code}
                      onChange={(e) => setSelectedRegion(e.target.value as RegionCode)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{region.name}</div>
                      <div className="text-sm text-gray-500">
                        {region.states.length > 0 ? region.states.join(', ') : 'All States'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Password field temporarily hidden - no authentication required */}
            {false && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Region Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter region password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Access System'}
            </button>
          </form>

          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Temporary open access - no password required. Simply select your region to continue.
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>American Red Cross • Internal Use Only</p>
        </div>
      </div>
    </div>
  )
}