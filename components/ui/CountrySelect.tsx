'use client'

import { useState, useMemo } from 'react'
import { Country, countryFlags, topCountries } from '@/lib/woocommerce/countries-taxes'
import { Search, ChevronDown } from 'lucide-react'

interface CountrySelectProps {
  countries: Country[]
  value: string
  onChange: (countryCode: string) => void
  label?: string
  error?: string
}

export default function CountrySelect({ countries, value, onChange, label, error }: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Get selected country details
  const selectedCountry = countries.find(c => c.code === value)

  // Filter countries based on search term
  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countries
    const term = searchTerm.toLowerCase()
    return countries.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term)
    )
  }, [countries, searchTerm])

  // Get top countries for quick select (always include in search results)
  const topCountriesList = useMemo(() => {
    const topList = topCountries
      .map(code => countries.find(c => c.code === code))
      .filter(Boolean) as Country[]

    // If searching, filter top countries too
    if (!searchTerm) return topList

    const term = searchTerm.toLowerCase()
    return topList.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term)
    )
  }, [countries, searchTerm])

  // Get other countries (not in top list)
  const otherCountries = useMemo(() => {
    return filteredCountries.filter(c => !topCountries.includes(c.code))
  }, [filteredCountries])

  const handleSelect = (countryCode: string) => {
    onChange(countryCode)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Selected Country Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-left flex items-center justify-between hover:border-gray-400 transition-colors`}
      >
        {selectedCountry ? (
          <span>{selectedCountry.name}</span>
        ) : (
          <span className="text-gray-500">Select a country</span>
        )}
        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false)
              setSearchTerm('')
            }}
          />

          {/* Dropdown Content */}
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-hidden">
            {/* Search Box */}
            <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffed00] focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Countries List */}
            <div className="overflow-y-auto max-h-80">
              {/* Show message if no results at all */}
              {topCountriesList.length === 0 && otherCountries.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No countries found matching &quot;{searchTerm}&quot;
                </div>
              ) : (
                <>
                  {/* Top Countries Section - always show if there are matches */}
                  {topCountriesList.length > 0 && (
                    <div className="border-b border-gray-200">
                      {!searchTerm && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                          Popular Countries
                        </div>
                      )}
                      {topCountriesList.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelect(country.code)}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                            value === country.code ? 'bg-[#ffed00]/10' : ''
                          }`}
                        >
                          <span className="font-medium">{country.name}</span>
                          {value === country.code && (
                            <span className="text-[#ffed00]">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* All/Filtered Countries */}
                  {otherCountries.length > 0 && (
                    <>
                      {!searchTerm && (
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                          All Countries
                        </div>
                      )}
                      {otherCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => handleSelect(country.code)}
                          className={`w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                            value === country.code ? 'bg-[#ffed00]/10' : ''
                          }`}
                        >
                          <span>{country.name}</span>
                          {value === country.code && (
                            <span className="text-[#ffed00]">✓</span>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
