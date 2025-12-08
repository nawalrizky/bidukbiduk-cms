'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MediaUploader, MediaFile } from '@/components/ui/media-uploader'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createArticle, getArticleCategories } from '@/lib/api/articles'
import { ArticleCategory } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function AddArticlePage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 0,
    tags: '',
    status: 'published' as 'draft' | 'published' | 'archived'
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

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
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
      // Set loading state yang sesuai
      if (saveAsDraft) {
        setSavingDraft(true)
      } else {
        setLoading(true)
      }
      
      // Determine status - sederhana: draft atau published
      const status: 'draft' | 'published' = saveAsDraft ? 'draft' : 'published'
      
      await createArticle({
        title: formData.title,
        content: formData.content,
        featured_image: mediaFiles[0]?.file || undefined,
        category: formData.category,
        tags: formData.tags || undefined,
        status: status
      })

      const message = saveAsDraft 
        ? 'Artikel disimpan sebagai draft' 
        : 'Artikel berhasil dipublikasikan'

      addNotification({
        type: 'success',
        title: 'Article Created',
        message: message
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
      setSavingDraft(false)
    }
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
            <MediaUploader
              label="Featured Image"
              acceptImages={true}
              acceptVideos={false}
              multiple={false}
              maxSizeMB={10}
              value={mediaFiles}
              onChange={setMediaFiles}
              showPreview={true}
              previewSize="lg"
              helperText="Upload gambar utama untuk artikel (PNG, JPG, GIF)"
            />

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
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/articles')}
              disabled={loading || savingDraft}
            >
              Batal
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading || savingDraft}
              >
                {savingDraft ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Simpan sebagai Draft
                  </>
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={loading || savingDraft}
                onClick={(e) => handleSubmit(e, false)}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publish Artikel
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  )
}
