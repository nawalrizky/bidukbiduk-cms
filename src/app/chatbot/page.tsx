'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Bot, User, Edit, Check, X } from 'lucide-react'
import { sendChatbotMessage, getChatbotContent, updateChatbotContent } from '@/lib/api/chatbot'
import { ChatbotMessage, ChatbotContent } from '@/lib/types'

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatbotMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // New state for content management
  const [chatbotContent, setChatbotContent] = useState<ChatbotContent | null>(null)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [editContentValue, setEditContentValue] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [contentError, setContentError] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatbotContent()
  }, [])

  const loadChatbotContent = async () => {
    try {
      setContentLoading(true)
      setContentError(null)
      const content = await getChatbotContent()
      setChatbotContent(content)
      setEditContentValue(content.content)
    } catch (err) {
      setContentError('Failed to load chatbot content')
      console.error('Error loading chatbot content:', err)
    } finally {
      setContentLoading(false)
    }
  }

  const handleEditContent = () => {
    setIsEditingContent(true)
    // Set the full content when entering edit mode
    setEditContentValue(chatbotContent?.content || '')
  }

  const handleCancelEdit = () => {
    setIsEditingContent(false)
    setEditContentValue(chatbotContent?.content || '')
    setContentError(null)
  }

  // Function to trim content for display
  const getTrimmedContent = (content: string, maxLength: number = 1000) => {
    if (content.length <= maxLength) {
      return content
    }
    return content.substring(0, maxLength) + '...'
  }

  // Check if content is trimmed
  const isContentTrimmed = (content: string, maxLength: number = 1000) => {
    return content.length > maxLength
  }

  const handleSaveContent = async () => {
    try {
      setContentLoading(true)
      setContentError(null)
      const updatedContent = await updateChatbotContent(editContentValue)
      setChatbotContent(updatedContent)
      setIsEditingContent(false)
    } catch (err) {
      setContentError('Failed to update chatbot content')
      console.error('Error updating chatbot content:', err)
    } finally {
      setContentLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim()) return

    const userMessage: ChatbotMessage = {
      userMessage: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)
    setError(null)

    try {
      const response = await sendChatbotMessage(inputMessage)
      
      const botMessage: ChatbotMessage = {
        userMessage: inputMessage,
        botResponse: response.response,
        timestamp: response.timestamp || new Date().toISOString()
      }

      setMessages(prev => {
        // Update the last message with bot response
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = botMessage
        return newMessages
      })
    } catch (err) {
      setError('Failed to send message')
      console.error('Error sending message:', err)
      
      // Add error message to chat
      const errorMessage: ChatbotMessage = {
        userMessage: inputMessage,
        botResponse: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }

      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = errorMessage
        return newMessages
      })
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chatbot</h1>
          <p className="text-gray-600">
            Chat with our AI assistant
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" onClick={clearChat}>
            Clear Chat
          </Button>
        )}
      </div>

      <Card className="min-h-[700px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span>AI Assistant</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 justify-between flex flex-col">
          {/* Data Input Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Data Input</h3>
              <div className="flex space-x-2">
                {isEditingContent ? (
                  <>
                    <Button 
                      size="sm" 
                      onClick={handleSaveContent}
                      disabled={contentLoading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {contentLoading ? 'Saving...' : 'Save'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={contentLoading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleEditContent}
                    disabled={contentLoading}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            
            {contentError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {contentError}
              </div>
            )}
            
            <div className="border rounded-lg p-3 bg-gray-50">
              {contentLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading content...</span>
                </div>
              ) : isEditingContent ? (
                <div className="space-y-2">
                  <textarea
                    value={editContentValue}
                    onChange={(e) => setEditContentValue(e.target.value)}
                    className="w-full h-32 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter chatbot training content..."
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {editContentValue.length} characters
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div 
                    className="min-h-[8rem] p-2 text-gray-700 whitespace-pre-wrap cursor-pointer hover:bg-gray-100 rounded"
                    onClick={handleEditContent}
                  >
                    {chatbotContent?.content ? getTrimmedContent(chatbotContent.content) : 'Click to add chatbot training content...'}
                  </div>
                  {chatbotContent?.content && isContentTrimmed(chatbotContent.content) && (
                    <div className="text-xs text-gray-500 text-right">
                      Click Edit to view full content.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[300px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Start a conversation
                </h3>
                <p className="text-gray-600">
                  Ask me anything about traditional boats, fishing, or marine topics!
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="space-y-2">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="flex items-end space-x-2 max-w-[80%]">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg rounded-br-sm">
                        <p className="text-sm">{message.userMessage}</p>
                      </div>
                      <User className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                  
                  {/* Bot Response */}
                  {message.botResponse && (
                    <div className="flex justify-start">
                      <div className="flex items-end space-x-2 max-w-[80%]">
                        <Bot className="h-6 w-6 text-blue-600 flex-shrink-0" />
                        <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg rounded-bl-sm">
                          <p className="text-sm">{message.botResponse}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2 max-w-[80%]">
                  <Bot className="h-6 w-6 text-blue-600 flex-shrink-0" />
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg rounded-bl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
