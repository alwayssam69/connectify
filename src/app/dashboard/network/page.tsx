'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import MatchingCard from '@/components/MatchingCard'
import type { Database } from '@/lib/types'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function NetworkPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    industry: '',
    skills: '',
    location: ''
  })
  const [industries, setIndustries] = useState<string[]>([])
  const [allSkills, setAllSkills] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (profiles.length > 0) {
      // Extract unique industries, skills, and locations from profiles
      const uniqueIndustries = Array.from(new Set(profiles.map(p => p.industry).filter(Boolean))) as string[]
      const uniqueSkills = Array.from(new Set(profiles.flatMap(p => p.skills || [])))
      const uniqueLocations = Array.from(new Set(profiles.map(p => p.location).filter(Boolean))) as string[]

      setIndustries(uniqueIndustries)
      setAllSkills(uniqueSkills)
      setLocations(uniqueLocations)
      
      // Apply initial filtering
      filterProfiles()
    }
  }, [profiles])

  useEffect(() => {
    filterProfiles()
  }, [filters])

  const filterProfiles = () => {
    let filtered = [...profiles]

    if (filters.industry) {
      filtered = filtered.filter(p => p.industry === filters.industry)
    }

    if (filters.skills) {
      filtered = filtered.filter(p => p.skills?.includes(filters.skills))
    }

    if (filters.location) {
      filtered = filtered.filter(p => p.location === filters.location)
    }

    setFilteredProfiles(filtered)
  }

  const loadProfiles = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Auth error:', userError)
        setError('Authentication error. Please try logging in again.')
        return
      }
      
      if (!user) {
        console.error('No user found')
        setError('Please log in to view profiles.')
        return
      }

      // Get all profiles except the current user's
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('created_at', { ascending: false })

      if (profilesError) {
        console.error('Profiles error:', profilesError)
        throw profilesError
      }

      if (!allProfiles) {
        console.error('No profiles found')
        setProfiles([])
        setFilteredProfiles([])
        return
      }

      // Get existing matches to filter them out
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('profile_id_2')
        .eq('profile_id_1', user.id)

      if (matchesError) {
        console.error('Matches error:', matchesError)
        throw matchesError
      }

      const matchedIds = matches?.map(match => match.profile_id_2) || []
      const availableProfiles = allProfiles.filter(profile => !matchedIds.includes(profile.id))

      console.log('Available profiles:', availableProfiles.length)
      setProfiles(availableProfiles)
      setFilteredProfiles(availableProfiles)
    } catch (err) {
      console.error('Error in loadProfiles:', err)
      setError('Failed to load profiles. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleSwipe = async (profile: Profile, direction: 'left' | 'right') => {
    if (direction === 'right') {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Create a match
        const { error: matchError } = await supabase
          .from('matches')
          .insert([
            {
              profile_id_1: user.id,
              profile_id_2: profile.id,
              status: 'pending'
            }
          ])

        if (matchError) throw matchError

        // Show match animation
        setMatchedProfile(profile)
        setShowMatchAnimation(true)
        setTimeout(() => {
          setShowMatchAnimation(false)
          setMatchedProfile(null)
        }, 2000)
      } catch (err) {
        console.error('Error creating match:', err)
      }
    }

    // Remove the profile from the stack
    setFilteredProfiles(current => current.filter(p => p.id !== profile.id))
  }

  const resetFilters = () => {
    setFilters({
      industry: '',
      skills: '',
      location: ''
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading potential connections...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-4 text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (filteredProfiles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No matches found</h3>
          <p className="mt-2 text-gray-600">Try adjusting your filters or check back later!</p>
          {(filters.industry || filters.skills || filters.location) && (
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-500"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-primary/10 to-transparent py-12">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Connections</h1>
          <p className="mt-2 text-gray-600">Swipe right to connect, left to pass</p>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={filters.industry}
                    onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">All Industries</option>
                    {industries.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    Skills
                  </label>
                  <select
                    id="skills"
                    value={filters.skills}
                    onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">All Skills</option>
                    {allSkills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <select
                    id="location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">All Locations</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={resetFilters}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-500"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative h-[600px]">
          <AnimatePresence>
            {filteredProfiles.map((profile, index) => (
              index === filteredProfiles.length - 1 && (
                <MatchingCard
                  key={profile.id}
                  profile={profile}
                  onSwipe={(direction) => handleSwipe(profile, direction)}
                />
              )
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showMatchAnimation && matchedProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
              <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">It's a match!</h3>
                <p className="text-gray-600">
                  You and {matchedProfile.full_name} have connected. Start a conversation!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}