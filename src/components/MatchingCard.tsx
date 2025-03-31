'use client'

import { useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import Image from 'next/image'
import { Profile } from '@/lib/types'

interface MatchingCardProps {
  profile: Profile
  onSwipe: (direction: 'left' | 'right') => void
}

export default function MatchingCard({ profile, onSwipe }: MatchingCardProps) {
  const [exitX, setExitX] = useState<number>(0)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])
  const background = useTransform(
    x,
    [-200, 0, 200],
    [
      'linear-gradient(to right, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0))',
      'none',
      'linear-gradient(to left, rgba(0, 255, 0, 0.2), rgba(0, 255, 0, 0))'
    ]
  )

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x)
      onSwipe(info.offset.x > 0 ? 'right' : 'left')
    }
  }

  return (
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        x,
        rotate,
        opacity,
        background
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={{ x: exitX }}
      transition={{ type: 'spring', damping: 40, stiffness: 400 }}
      className="touch-none"
    >
      <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-xl bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50 z-10" />
        
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.full_name || 'Profile'}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-8xl font-bold text-white">
              {profile.full_name?.[0] || '?'}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 z-20 text-white">
          <h3 className="text-2xl font-bold mb-2">{profile.full_name}</h3>
          <p className="text-lg opacity-90 mb-3">{profile.headline}</p>
          
          {profile.bio && (
            <p className="text-sm opacity-75 line-clamp-3">{profile.bio}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills?.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-20 flex space-x-2">
          <button
            onClick={() => onSwipe('left')}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => onSwipe('right')}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        <motion.div
          className="absolute inset-x-0 bottom-0 h-full"
          style={{ background: useTransform(x, [-200, 0, 200], ['#ff0000', 'transparent', '#00ff00']) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
        />
      </div>
    </motion.div>
  )
} 