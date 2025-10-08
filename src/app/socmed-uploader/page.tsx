'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'
import { createInstagramPost } from '@/lib/api/instagram'

export default function SocmedUploaderPage() {
  const [loading, setLoading] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const { addNotification } = useNotifications()
  
  const [formData, setFormData] = useState({
    post_type: 'photo',
    caption: '',
    media: null as File | null,
    scheduled_at: '',
    status: 'scheduled',
    extras: '',
    session: 0
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, media: file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.caption.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Caption is required'
      })
      return
    }

    if (!formData.media) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Media file is required'
      })
      return
    }

    if (formData.status === 'scheduled' && !formData.scheduled_at) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Scheduled date/time is required for scheduled posts'
      })
      return
    }

    try {
      setLoading(true)
      
      await createInstagramPost({
        post_type: formData.post_type,
        caption: formData.caption,
        media: formData.media,
        scheduled_at: formData.scheduled_at || undefined,
        status: formData.status,
        extras: formData.extras || undefined,
        session: formData.session
      })

      addNotification({
        type: 'success',
        title: 'Post Created',
        message: `Instagram post has been ${formData.status === 'scheduled' ? 'scheduled' : 'created'} successfully`
      })

      // Reset form
      setFormData({
        post_type: 'photo',
        caption: '',
        media: null,
        scheduled_at: '',
        status: 'scheduled',
        extras: '',
        session: 0
      })
      setMediaPreview(null)
      
    } catch (error: unknown) {
      console.error('Error creating post:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to create post',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  // Get minimum datetime for scheduled_at (current time)
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instagram Post Uploader</h1>
        <p className="text-gray-600">
          Create and schedule Instagram posts
        </p>
      </div>

      {/* Main Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type */}
          <div className="space-y-2">
            <Label htmlFor="post_type">Post Type</Label>
            <select
              id="post_type"
              value={formData.post_type}
              onChange={(e) => handleInputChange('post_type', e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="carousel">Carousel</option>
              <option value="reel">Reel</option>
              <option value="story">Story</option>
            </select>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label htmlFor="media">Media File *</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="cursor-pointer"
                />
              </div>
              {mediaPreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200 relative">
                  <Image 
                    src={mediaPreview} 
                    alt="Preview" 
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Upload the image or video for your post
            </p>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption *</Label>
            <Textarea
              id="caption"
              placeholder="Write your caption here... (You can include hashtags and emojis)"
              value={formData.caption}
              onChange={(e) => handleInputChange('caption', e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-sm text-gray-500">
              {formData.caption.length} characters
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Scheduled Date/Time - Only show if status is scheduled */}
          {formData.status === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Date & Time *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                  min={getMinDateTime()}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-gray-500">
                Select when you want this post to be published
              </p>
            </div>
          )}

          {/* Session */}
          <div className="space-y-2">
            <Label htmlFor="session">Session ID</Label>
            <Input
              id="session"
              type="number"
              placeholder="0"
              value={formData.session}
              onChange={(e) => handleInputChange('session', parseInt(e.target.value) || 0)}
              min="0"
            />
            <p className="text-sm text-gray-500">
              Optional: Specify session ID for batch posting
            </p>
          </div>

          {/* Extras */}
          <div className="space-y-2">
            <Label htmlFor="extras">Additional Information</Label>
            <Textarea
              id="extras"
              placeholder="Any additional notes or metadata (optional)"
              value={formData.extras}
              onChange={(e) => handleInputChange('extras', e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  post_type: 'photo',
                  caption: '',
                  media: null,
                  scheduled_at: '',
                  status: 'scheduled',
                  extras: '',
                  session: 0
                })
                setMediaPreview(null)
              }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.status === 'scheduled' ? 'Schedule Post' : 'Create Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <ImageIcon className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Post Guidelines</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Images should be in JPG, PNG format (recommended: 1080x1080px)</li>
              <li>• Videos should be in MP4 format (max 60 seconds for feed posts)</li>
              <li>• Captions can include hashtags and mentions</li>
              <li>• Scheduled posts must have a future date and time</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}


