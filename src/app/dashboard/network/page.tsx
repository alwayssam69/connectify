'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import MatchingCard from '@/components/MatchingCard'
import { Profile } from '@/lib/types'

export default function NetworkPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showMatchAnimation, setShowMatchAnimation] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all profiles except the current user's
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Get existing matches to filter them out
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('profile_id_2')
        .eq('profile_id_1', user.id)

      if (matchesError) throw matchesError

      const matchedIds = matches.map(match => match.profile_id_2)
      const availableProfiles = allProfiles.filter(profile => !matchedIds.includes(profile.id))

      setProfiles(availableProfiles)
    } catch (err) {
      setError('Failed to load profiles')
      console.error('Error:', err)
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
    setProfiles(current => current.filter(p => p.id !== profile.id))
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

  if (profiles.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No more profiles</h3>
          <p className="mt-2 text-gray-600">Check back later for new connections!</p>
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
        </div>

        <div className="relative h-[600px]">
          <AnimatePresence>
            {profiles.map((profile, index) => (
              index === profiles.length - 1 && (
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