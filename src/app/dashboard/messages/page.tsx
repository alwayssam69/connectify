'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import VideoCall from '@/components/VideoCall'

type Profile = Database['public']['Tables']['profiles']['Row']
type Message = Database['public']['Tables']['messages']['Row']

export default function MessagesPage() {
  const [matches, setMatches] = useState<Profile[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages()
      let subscription: any
      const setupSubscription = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !selectedMatch) return

        subscription = supabase
          .channel('messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedMatch.user_id}),and(sender_id=eq.${selectedMatch.user_id},receiver_id=eq.${user.id}))`,
            },
            (payload) => {
              setMessages((prev) => [...prev, payload.new as Message])
            }
          )
          .subscribe()
      }

      setupSubscription()

      return () => {
        if (subscription) {
          subscription.unsubscribe()
        }
      }
    }
  }, [selectedMatch])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMatches() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('user1_id, user2_id, status')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (matchesError) throw matchesError

      // Get profiles of matched users
      const matchedUserIds = matchesData.map((match) =>
        match.user1_id === user.id ? match.user2_id : match.user1_id
      )

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', matchedUserIds)

      if (profilesError) throw profilesError

      setMatches(profiles || [])
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !selectedMatch) return

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${selectedMatch.user_id}),and(sender_id.eq.${selectedMatch.user_id},receiver_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedMatch) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: selectedMatch.user_id,
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Matches List */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {matches.map((match) => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                selectedMatch?.id === match.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {match.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={match.avatar_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">
                        {match.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {match.full_name}
                  </p>
                  <p className="text-sm text-gray-500">{match.role}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {selectedMatch.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={selectedMatch.avatar_url}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">
                          {selectedMatch.full_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedMatch.full_name}
                    </p>
                    <p className="text-sm text-gray-500">{selectedMatch.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsVideoCallOpen(true)}
                  className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === selectedMatch.user_id
                      ? 'justify-start'
                      : 'justify-end'
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${
                      message.sender_id === selectedMatch.user_id
                        ? 'bg-gray-100 text-gray-900'
                        : 'bg-primary-600 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === selectedMatch.user_id
                          ? 'text-gray-500'
                          : 'text-primary-100'
                      }`}
                    >
                      {format(new Date(message.created_at), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Video Call Modal */}
      <AnimatePresence>
        {isVideoCallOpen && selectedMatch && (
          <VideoCall
            matchId={selectedMatch.id}
            onClose={() => setIsVideoCallOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 