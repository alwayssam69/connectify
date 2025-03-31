'use client'

import { useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import type { Database } from '@/lib/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface MatchingCardProps {
  profile: Profile
  onSwipe: (direction: 'left' | 'right') => void
}

export default function MatchingCard({ profile, onSwipe }: MatchingCardProps) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  useEffect(() => {
    const unsubscribe = x.onChange((latest) => {
      if (latest <= -200) {
        onSwipe('left')
      } else if (latest >= 200) {
        onSwipe('right')
      }
    })

    return () => unsubscribe()
  }, [x, onSwipe])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x <= -100) {
      onSwipe('left')
    } else if (info.offset.x >= 100) {
      onSwipe('right')
    }
  }

  return (
    <motion.div
      style={{
        x,
        rotate,
        opacity,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-full"
    >
      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        {profile.avatar_url && (
          <div className="relative h-64 sm:h-80">
            <Image
              src={profile.avatar_url}
              alt={profile.full_name || 'Profile'}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {profile.full_name || 'Anonymous'}
          </h3>
          {profile.headline && (
            <p className="mt-2 text-gray-600">{profile.headline}</p>
          )}
          {profile.bio && (
            <p className="mt-4 text-gray-600">{profile.bio}</p>
          )}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Skills</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.industry && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Industry</h4>
              <p className="mt-1 text-gray-600">{profile.industry}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
} 