'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ProCoach } from '@/lib/woocommerce/procoaches'

interface ProCoachMapProps {
  procoaches: ProCoach[]
  hoveredId: number | null
  selectedId: number | null
  onMarkerHover: (id: number | null) => void
  onMarkerClick: (id: number | null) => void
  userLocation: { lat: number; lon: number } | null
}

export default function ProCoachMap({
  procoaches,
  hoveredId,
  selectedId,
  onMarkerHover,
  onMarkerClick,
  userLocation
}: ProCoachMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Map<number, L.Marker>>(new Map())
  const userMarkerRef = useRef<L.Marker | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Create map centered on Europe with better world view
      const map = L.map('procoach-map').setView([35, 10], 3)

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current.clear()

    // Create custom icon for ProCoach markers
    const createIcon = (isHovered: boolean, isSelected: boolean) => {
      const bgColor = isSelected ? '#000000' : '#ffed00'
      const innerColor = isSelected ? '#ffed00' : '#000000'
      const shadow = isHovered
        ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
        : 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))'
      const translateY = isHovered ? -3 : 0
      const size = isSelected ? 36 : 32

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            position: relative;
            width: ${size}px;
            height: ${size * 1.2}px;
            filter: ${shadow};
            transform: translateY(${translateY}px);
            transition: all 0.2s ease;
          ">
            <svg width="${size}" height="${size * 1.2}" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 17 12 17s12-9 12-17c0-6.6-5.4-12-12-12z"
                    fill="${bgColor}"/>
              <circle cx="12" cy="11" r="3.5" fill="${innerColor}"/>
            </svg>
          </div>
        `,
        iconSize: [size, size * 1.2],
        iconAnchor: [size / 2, size * 1.2],
        popupAnchor: [0, -size * 1.2],
      })
    }

    // Add ProCoach markers
    procoaches.forEach(coach => {
      const isHovered = hoveredId === coach.id
      const isSelected = selectedId === coach.id

      const marker = L.marker([coach.latitude, coach.longitude], {
        icon: createIcon(isHovered, isSelected),
        zIndexOffset: isSelected ? 1000 : isHovered ? 500 : 0
      }).addTo(map)

      // Popup content
      const popupContent = `
        <div style="font-family: system-ui, sans-serif; padding: 8px;">
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #111;">
            ${coach.coach_name}
          </h3>
          ${coach.company_name ? `
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
              ${coach.company_name}
            </p>
          ` : ''}
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #444;">
            <strong>📍</strong> ${coach.address}
          </p>
          ${coach.phone ? `
            <p style="margin: 0 0 4px 0; font-size: 13px; color: #444;">
              <strong>📞</strong> ${coach.phone}
            </p>
          ` : ''}
          ${coach.email ? `
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #444;">
              <strong>✉️</strong> ${coach.email}
            </p>
          ` : ''}
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      })

      // Event handlers
      marker.on('mouseover', () => {
        onMarkerHover(coach.id)
      })

      marker.on('mouseout', () => {
        onMarkerHover(null)
      })

      marker.on('click', () => {
        const newSelectedId = coach.id === selectedId ? null : coach.id
        onMarkerClick(newSelectedId)
        if (newSelectedId) {
          marker.openPopup()
        } else {
          marker.closePopup()
        }
      })

      markersRef.current.set(coach.id, marker)
    })

    // Don't auto-fit bounds - keep the default world view centered on Europe/Africa
  }, [procoaches, hoveredId, selectedId, onMarkerHover, onMarkerClick])

  // Center map on selected coach (when clicking card)
  useEffect(() => {
    if (!mapRef.current || !selectedId) return

    const selectedCoach = procoaches.find(c => c.id === selectedId)
    if (selectedCoach) {
      mapRef.current.setView([selectedCoach.latitude, selectedCoach.longitude], 10, {
        animate: true,
        duration: 0.5
      })
    }
  }, [selectedId, procoaches])

  // Add user location marker
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
      userMarkerRef.current = null
    }

    // Add new user marker if location is available
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
          <div style="
            background-color: #3b82f6;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid #fff;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      const userMarker = L.marker([userLocation.lat, userLocation.lon], {
        icon: userIcon,
        zIndexOffset: 2000
      }).addTo(map)

      userMarker.bindPopup(
        '<div style="font-family: system-ui, sans-serif; padding: 8px;"><strong>📍 Your Location</strong></div>'
      )

      userMarkerRef.current = userMarker

      // Pan to user location
      map.setView([userLocation.lat, userLocation.lon], 8)
    }
  }, [userLocation])

  // Update marker styles when hover/selected changes
  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((marker, id) => {
      const isHovered = hoveredId === id
      const isSelected = selectedId === id

      const createIcon = (isHovered: boolean, isSelected: boolean) => {
        const bgColor = isSelected ? '#000000' : '#ffed00'
        const innerColor = isSelected ? '#ffed00' : '#000000'
        const shadow = isHovered
          ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))'
          : 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))'
        const translateY = isHovered ? -3 : 0
        const size = isSelected ? 36 : 32

        return L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              position: relative;
              width: ${size}px;
              height: ${size * 1.2}px;
              filter: ${shadow};
              transform: translateY(${translateY}px);
              transition: all 0.2s ease;
            ">
              <svg width="${size}" height="${size * 1.2}" viewBox="0 0 24 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 8 12 17 12 17s12-9 12-17c0-6.6-5.4-12-12-12z"
                      fill="${bgColor}"/>
                <circle cx="12" cy="11" r="3.5" fill="${innerColor}"/>
              </svg>
            </div>
          `,
          iconSize: [size, size * 1.2],
          iconAnchor: [size / 2, size * 1.2],
          popupAnchor: [0, -size * 1.2],
        })
      }

      marker.setIcon(createIcon(isHovered, isSelected))
      marker.setZIndexOffset(isSelected ? 1000 : isHovered ? 500 : 0)

      // Only manage popup state for selected markers
      if (isSelected) {
        marker.openPopup()
      } else {
        marker.closePopup()
      }
    })
  }, [hoveredId, selectedId])

  return (
    <div className="relative h-full w-full">
      <div id="procoach-map" className="h-full w-full" />
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-tip {
          background: white;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-marker-pane {
          z-index: 600;
        }
        .leaflet-map-pane {
          z-index: 400;
        }
        #procoach-map .leaflet-container {
          padding: 20px;
          clip-path: none !important;
        }
      `}</style>
    </div>
  )
}
