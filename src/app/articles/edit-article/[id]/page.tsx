'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MediaUploader, MediaFile } from '@/components/ui/media-uploader'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { getArticle, updateArticle, getArticleCategories } from '@/lib/api/articles'
import { Article, ArticleCategory } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [article, setArticle] = useState<Article | null>(null)
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
          category: articleData.category,
          tags: articleData.tags || '',
          status: 'published' // Always default to published
        })
        
        // Convert existing image URL to MediaFile format for preview
        if (articleData.featured_image_url) {
          // Create a placeholder MediaFile for existing image
          const existingMedia: MediaFile = {
            file: new File([], 'existing-image.jpg', { type: 'image/jpeg' }),
            preview: articleData.featured_image_url,
            type: 'image',
            id: 'existing-image'
          }
          setMediaFiles([existingMedia])
        }
      } catch (error) {
        console.error('Error loading article:', error)
        addNotification({
          type: 'error',
          title: 'Gagal memuat artikel',
          message: 'Tidak dapat memuat detail artikel.'
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

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      addNotification({
        type: 'error',
        title: 'Kesalahan Validasi',
        message: 'Judul wajib diisi'
      })
      return
    }

    if (!formData.content.trim()) {
      addNotification({
        type: 'error',
        title: 'Kesalahan Validasi',
        message: 'Konten wajib diisi'
      })
      return
    }

    if (formData.category === 0) {
      addNotification({
        type: 'error',
        title: 'Kesalahan Validasi',
        message: 'Silakan pilih kategori'
      })
      return
    }

    try {
      // Set loading state yang sesuai
      if (saveAsDraft) {
        setSavingDraft(true)
      } else {
        setSubmitting(true)
      }
      
      const articleId = Number(params.id)
      
      // Determine status - sederhana: draft atau published
      const status: 'draft' | 'published' = saveAsDraft ? 'draft' : 'published'
      
      // Only send the file if it's a new upload (not the placeholder)
      const featuredImage = mediaFiles[0]?.id !== 'existing-image' ? mediaFiles[0]?.file : undefined
      
      await updateArticle(articleId, {
        title: formData.title,
        content: formData.content,
        featured_image: featuredImage,
        category: formData.category,
        tags: formData.tags || undefined,
        status: status
      })

      const message = saveAsDraft 
        ? 'Artikel disimpan sebagai draft' 
        : 'Artikel berhasil diupdate'

      addNotification({
        type: 'success',
        title: 'Artikel Diperbarui',
        message: message
      })

      router.push(`/articles/${articleId}`)
    } catch (error: unknown) {
      console.error('Error updating article:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Gagal memperbarui artikel',
        message: errorMessage
      })
    } finally {
      setSubmitting(false)
      setSavingDraft(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Artikel tidak ditemukan</h3>
        <Button onClick={() => router.push('/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Artikel
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Artikel</h1>
          <p className="text-gray-600">Perbarui detail artikel</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/articles/${article.id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Batal
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                placeholder="Masukkan judul artikel"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', parseInt(e.target.value))}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                required
              >
                <option value={0}>Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Image */}
            <MediaUploader
              label="Gambar Utama"
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
              <Label htmlFor="content">Konten *</Label>
              <Textarea
                id="content"
                placeholder="Tulis konten artikel Anda di sini..."
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                className="resize-none whitespace-pre-wrap"
                style={{ fontFamily: 'inherit' }}
                required
              />
              <p className="text-sm text-gray-500">
                Formatting dipertahankan (spasi, enter, dll.). {formData.content.length} karakter
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tag</Label>
              <Input
                id="tags"
                placeholder="Masukkan tag dipisahkan dengan koma (contoh: wisata, budaya, makanan)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Pisahkan beberapa tag dengan koma
              </p>
            </div>

            {/* Publish Date */}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/articles/${article.id}`)}
              disabled={submitting || savingDraft}
            >
              Batal
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting || savingDraft}
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
                disabled={submitting || savingDraft}
                onClick={(e) => handleSubmit(e, false)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Perbarui & Terbitkan
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
