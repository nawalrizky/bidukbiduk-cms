'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react'
import { createArticle, getArticleCategories } from '@/lib/api/articles'
import { ArticleCategory } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function AddArticlePage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featured_image: null as File | null,
    category: 0,
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    publish_date: ''
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getArticleCategories()
        setCategories(data)
        
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, category: data[0].id }))
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        addNotification({
          type: 'error',
          title: 'Failed to load categories',
          message: 'Unable to load article categories.'
        })
      }
    }

    loadCategories()
  }, [addNotification])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, featured_image: file }))
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, featured_image: null }))
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Title is required'
      })
      return
    }

    if (!formData.content.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Content is required'
      })
      return
    }

    if (formData.category === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a category'
      })
      return
    }

    try {
      setLoading(true)
      
      await createArticle({
        title: formData.title,
        content: formData.content,
        featured_image: formData.featured_image || undefined,
        category: formData.category,
        tags: formData.tags || undefined,
        status: formData.status,
        publish_date: formData.publish_date || undefined
      })

      addNotification({
        type: 'success',
        title: 'Article Created',
        message: 'Article has been created successfully'
      })

      router.push('/articles')
    } catch (error: unknown) {
      console.error('Error creating article:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to create article',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Article</h1>
          <p className="text-gray-600">Create a new article or blog post</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter article title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', parseInt(e.target.value))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value={0}>Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured_image">Featured Image</Label>
              {imagePreview ? (
                <div className="relative">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="featured_image" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      id="featured_image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your article content here..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                className="resize-none font-mono"
                required
              />
              <p className="text-sm text-gray-500">
                You can use HTML tags for formatting. {formData.content.length} characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Enter tags separated by commas (e.g., travel, culture, food)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Publish Date */}
            <div className="space-y-2">
              <Label htmlFor="publish_date">Publish Date</Label>
              <Input
                id="publish_date"
                type="datetime-local"
                value={formData.publish_date}
                onChange={(e) => handleInputChange('publish_date', e.target.value)}
                min={getMinDateTime()}
              />
              <p className="text-sm text-gray-500">
                Leave empty to use current date/time
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/articles')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Article
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
