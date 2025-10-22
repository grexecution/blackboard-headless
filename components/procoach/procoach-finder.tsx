'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ProCoach, calculateDistance, searchProCoaches, getGoogleMapsDirectionsUrl } from '@/lib/woocommerce/procoaches'
import { MapPin, Phone, Mail, Globe, Navigation, Search, Sliders } from 'lucide-react'

// Dynamically import map to avoid SSR issues
const ProCoachMap = dynamic(() => import('./procoach-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffed00] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface ProCoachFinderProps {
  procoaches: ProCoach[]
}

interface ProCoachWithDistance extends ProCoach {
  distance?: number
}

export default function ProCoachFinder({ procoaches }: ProCoachFinderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [radiusKm, setRadiusKm] = useState<number>(500) // Default 500km
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        console.error('Error getting location:', error)
        setLocationError('Unable to get your location. Please enable location services.')
      }
    )
  }

  // Filter and sort ProCoaches
  const filteredProCoaches = useMemo<ProCoachWithDistance[]>(() => {
    let result: ProCoachWithDistance[] = searchProCoaches(procoaches, searchQuery)

    // Add distance if user location is available
    if (userLocation) {
      const withDistance: ProCoachWithDistance[] = result.map(coach => ({
        ...coach,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lon,
          coach.latitude,
          coach.longitude
        )
      }))

      // Filter by radius
      const filtered = withDistance.filter(coach => (coach.distance || 0) <= radiusKm)

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))

      return filtered
    }

    return result
  }, [procoaches, searchQuery, userLocation, radiusKm])

  return (
    <div className="bg-gray-50">
      {/* Search and Filters */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, company, location, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffed00] focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${
                showFilters
                  ? 'bg-[#ffed00] border-[#ffed00] text-black'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition`}
            >
              <Sliders className="h-5 w-5" />
              <span className="font-medium">Filters</span>
            </button>

            {/* Location Button */}
            <button
              onClick={getUserLocation}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border ${
                userLocation
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition`}
            >
              <Navigation className="h-5 w-5" />
              <span className="font-medium">
                {userLocation ? 'Location Set' : 'Use My Location'}
              </span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Radius: {radiusKm} km
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    disabled={!userLocation}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#ffed00]"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10 km</span>
                    <span>1000 km</span>
                  </div>
                  {!userLocation && (
                    <p className="text-sm text-amber-600 mt-2">
                      Enable location to use radius filter
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Error */}
          {locationError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {locationError}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProCoaches.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{procoaches.length}</span> ProCoaches
            {userLocation && ` within ${radiusKm} km`}
          </div>
        </div>
      </div>

      {/* Map and List Layout */}
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 py-6 pb-12">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List View */}
          <div className="space-y-4 max-h-[800px] overflow-y-scroll pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
            {filteredProCoaches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No ProCoaches Found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? 'Try adjusting your search criteria'
                    : 'No ProCoaches available in this area'}
                </p>
              </div>
            ) : (
              filteredProCoaches.map((coach) => (
                <div
                  key={coach.id}
                  onMouseEnter={() => setHoveredId(coach.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelectedId(coach.id === selectedId ? null : coach.id)}
                  className={`bg-white rounded-xl border p-6 cursor-pointer transition-all duration-200 ${
                    hoveredId === coach.id || selectedId === coach.id
                      ? 'border-[#ffed00] shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-4">
                    {coach.image_url && (
                      <Image
                        src={coach.image_url}
                        alt={coach.coach_name}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {coach.coach_name}
                      </h3>
                      {coach.company_name && (
                        <p className="text-sm text-gray-600 mb-2">{coach.company_name}</p>
                      )}

                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-3">
                        <MapPin className="h-4 w-4 text-[#ffed00] mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{coach.address}</span>
                      </div>

                      {coach.distance !== undefined && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffed00] bg-opacity-20 rounded-full text-sm font-semibold text-gray-900 mb-3">
                          <Navigation className="h-3 w-3" />
                          {coach.distance} km away
                        </div>
                      )}

                      {coach.specialties && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {coach.specialties}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3 text-sm">
                        {coach.phone && (
                          <a
                            href={`tel:${coach.phone}`}
                            className="flex items-center gap-1 text-gray-600 hover:text-[#ffed00] transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Phone className="h-4 w-4" />
                            <span>{coach.phone}</span>
                          </a>
                        )}
                        {coach.email && (
                          <a
                            href={`mailto:${coach.email}`}
                            className="flex items-center gap-1 text-gray-600 hover:text-[#ffed00] transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                          </a>
                        )}
                        {coach.website && (
                          <a
                            href={coach.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gray-600 hover:text-[#ffed00] transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Globe className="h-4 w-4" />
                            <span>Website</span>
                          </a>
                        )}
                      </div>

                      <a
                        href={getGoogleMapsDirectionsUrl(coach.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#ffed00] hover:bg-yellow-400 text-black font-semibold rounded-lg transition"
                      >
                        <Navigation className="h-4 w-4" />
                        Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Map View */}
          <div className="h-[800px] rounded-xl overflow-hidden border border-gray-200 bg-white sticky top-24">
            <ProCoachMap
              procoaches={filteredProCoaches}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onMarkerHover={setHoveredId}
              onMarkerClick={setSelectedId}
              userLocation={userLocation}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
