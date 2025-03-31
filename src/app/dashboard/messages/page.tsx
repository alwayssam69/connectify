'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types'
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
  const [isInVideoCall, setIsInVideoCall] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMatches()
  }, [])

  useEffect(() => {
    if (selectedMatch) {
      loadMessages()
      subscribeToMessages()
    }
  }, [selectedMatch])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const subscribeToMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !selectedMatch) return

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(and(sender_id=eq.${user.id},receiver_id=eq.${selectedMatch.id}),and(sender_id=eq.${selectedMatch.id},receiver_id=eq.${user.id}))`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const loadMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('profile_id_2')
        .eq('profile_id_1', user.id)
        .eq('status', 'accepted')

      if (matchesError) throw matchesError

      if (matches && matches.length > 0) {
        const matchedProfileIds = matches.map(match => match.profile_id_2)
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', matchedProfileIds)

        if (profilesError) throw profilesError
        setMatches(profiles || [])
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedMatch) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedMatch.id}),and(sender_id.eq.${selectedMatch.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedMatch) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: user.id,
            receiver_id: selectedMatch.id,
            content: newMessage.trim(),
          },
        ])

      if (error) throw error
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* Matches Sidebar */}
            <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-900">Matches</h2>
                {matches.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-500">No matches yet</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {matches.map((match) => (
                      <li key={match.id}>
                        <button
                          onClick={() => setSelectedMatch(match)}
                          className={`w-full flex items-center p-3 rounded-lg hover:bg-gray-50 ${
                            selectedMatch?.id === match.id ? 'bg-gray-50' : ''
                          }`}
                        >
                          {match.avatar_url ? (
                            <img
                              src={match.avatar_url}
                              alt={match.full_name || ''}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-lg">
                                {(match.full_name || '?')[0]}
                              </span>
                            </div>
                          )}
                          <div className="ml-3 text-left">
                            <p className="text-sm font-medium text-gray-900">
                              {match.full_name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">{match.headline || 'No headline'}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedMatch ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      {selectedMatch.avatar_url ? (
                        <img
                          src={selectedMatch.avatar_url}
                          alt={selectedMatch.full_name || ''}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-lg">
                            {(selectedMatch.full_name || '?')[0]}
                          </span>
                        </div>
                      )}
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {selectedMatch.full_name || 'Anonymous'}
                        </h3>
                        <p className="text-sm text-gray-500">{selectedMatch.headline || 'No headline'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsInVideoCall(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Video Call
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_id === selectedMatch.id ? 'justify-start' : 'justify-end'
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.sender_id === selectedMatch.id
                                ? 'bg-gray-100'
                                : 'bg-primary-600 text-white'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <form onSubmit={sendMessage} className="flex space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Select a match to start chatting</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose from your matches on the left to begin a conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Modal */}
      <AnimatePresence>
        {isInVideoCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl"
            >
              <VideoCall
                matchId={selectedMatch?.id || ''}
                onClose={() => setIsInVideoCall(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 