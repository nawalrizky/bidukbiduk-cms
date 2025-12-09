'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MediaUploader, MediaFile } from '@/components/ui/media-uploader'
import { ArrowLeft, Check, X, Camera } from 'lucide-react'
import { createGalleryItem } from '@/lib/api/gallery'
import { CreateGalleryItem } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { authService } from '@/lib/api/auth'

export default function AddImagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  
  // Check authentication on component mount
  useEffect(() => {
    const token = authService.getAccessToken()
    console.log('AddImagePage: Token check:', !!token)
    if (!token) {
      console.log('AddImagePage: No token found, redirecting to login')
      router.push('/auth/login')
      return
    }
  }, [router])
  
  const [formData, setFormData] = useState<CreateGalleryItem>({
    title: '',
    description: '',
    category: 1, // Default category - hidden from UI
    file: '',
    tags: '',
    is_featured: true, // Default to featured
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check authentication before submission
    const token = authService.getAccessToken()
    console.log('Form submission: Token check:', !!token)
    if (!token) {
      setError('Anda tidak terautentikasi. Silakan masuk lagi.')
      router.push('/auth/login')
      return
    }
    
    // Validation
    if (!formData.title.trim()) {
      setError('Silakan berikan judul untuk gambar')
      return
    }
    
    if (!mediaFiles[0]) {
      setError('Silakan pilih gambar untuk diunggah')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('Submitting form data:', formData) // Debug log
      console.log('Auth token present:', !!authService.getAccessToken()) // Auth debug
      
      // Update formData with the selected file
      const submitData = {
        ...formData,
        file: mediaFiles[0].file
      }
      
      const response = await createGalleryItem(submitData)
      
      if (response && response.id) {
        setSuccess(true)
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 1, // Keep default category
          file: '',
          tags: '',
          is_featured: true,
        });
        setMediaFiles([])
        
        // Redirect after short delay to show success message
        setTimeout(() => {
          router.push('/gallery')
        }, 1500)
      } else {
        setError('Gagal mengunggah gambar. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      
      // Extract detailed error message
      let errorMessage = 'Gagal mengunggah gambar. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Silakan coba lagi.';
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/gallery">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Kembali ke Galeri
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Unggah Gambar</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Berhasil!</AlertTitle>
                <AlertDescription>
                  Gambar berhasil diunggah. Mengalihkan ke galeri...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <X className="h-4 w-4 text-red-600" />
                <AlertTitle>Kesalahan</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Judul Gambar</Label>
                <Input
                  id="title"
                  placeholder="Masukkan judul untuk gambar ini"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Input
                  id="description"
                  placeholder="Masukkan deskripsi untuk gambar ini"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <MediaUploader
                label="File Gambar"
                acceptImages={true}
                acceptVideos={false}
                multiple={false}
                maxSizeMB={10}
                value={mediaFiles}
                onChange={setMediaFiles}
                showPreview={true}
                previewSize="lg"
                helperText="Upload gambar untuk gallery"
              />

              <div className="space-y-2">
                <Label htmlFor="tags">Tag (opsional)</Label>
                <Input
                  id="tags"
                  placeholder="alam, pemandangan, pantai (dipisahkan koma)"
                  value={formData.tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                />
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Unggah Gambar
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
