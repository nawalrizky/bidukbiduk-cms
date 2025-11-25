'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react'
import { getArticle, updateArticle, getArticleCategories } from '@/lib/api/articles'
import { Article, ArticleCategory } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    featured_image: null as File | null,
    category: 0,
    tags: '',
    status: 'published' as 'draft' | 'published' | 'archived',
    publish_date: ''
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const articleId = Number(params.id)
        
        const [articleData, categoriesData] = await Promise.all([
          getArticle(articleId),
          getArticleCategories()
        ])
        
        setArticle(articleData)
        setCategories(categoriesData)
        
        setFormData({
          title: articleData.title,
          content: articleData.content,
          featured_image: null,
          category: articleData.category,
          tags: articleData.tags || '',
          status: 'published', // Always default to published
          publish_date: articleData.publish_date 
            ? new Date(articleData.publish_date).toISOString().slice(0, 16)
            : ''
        })
        
        if (articleData.featured_image_url) {
          setImagePreview(articleData.featured_image_url)
        }
      } catch (error) {
        console.error('Error loading article:', error)
        addNotification({
          type: 'error',
          title: 'Failed to load article',
          message: 'Unable to load article details.'
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadData()
    }
  }, [params.id, addNotification])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        title: 'Invalid File',
        message: 'Please select an image file'
      })
      return
    }

    setFormData(prev => ({ ...prev, featured_image: file }))
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
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
      setSubmitting(true)
      const articleId = Number(params.id)
      
      await updateArticle(articleId, {
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
        title: 'Article Updated',
        message: 'Article has been updated successfully'
      })

      router.push(`/articles/${articleId}`)
    } catch (error: unknown) {
      console.error('Error updating article:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to update article',
        message: errorMessage
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Article not found</h3>
        <Button onClick={() => router.push('/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Articles
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-gray-600">Update article details</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/articles/${article.id}`)}>
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
                  <div className="absolute top-2 right-2 flex gap-2">
                    <label htmlFor="featured_image">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-white cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('featured_image')?.click();
                        }}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Ganti
                      </Button>
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeImage}
                      className="bg-white"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label 
                    htmlFor="featured_image" 
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">{isDragging ? 'Drop gambar di sini' : 'Klik untuk upload'}</span> {!isDragging && 'atau drag and drop'}
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 10MB</p>
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
                className="resize-none whitespace-pre-wrap"
                style={{ fontFamily: 'inherit' }}
                required
              />
              <p className="text-sm text-gray-500">
                Formatting preserved (spaces, enters, etc.). {formData.content.length} characters
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
              onClick={() => router.push(`/articles/${article.id}`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Article
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  )
}
