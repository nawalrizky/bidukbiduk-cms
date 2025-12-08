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
      setError('You are not authenticated. Please log in again.')
      router.push('/auth/login')
      return
    }
    
    // Validation
    if (!formData.title.trim()) {
      setError('Please provide a title for the image')
      return
    }
    
    if (!mediaFiles[0]) {
      setError('Please select an image to upload')
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
        setError('Failed to upload image. Please try again.')
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      
      // Extract detailed error message
      let errorMessage = 'Failed to upload image. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Please try again.';
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
              Back to Gallery
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Image uploaded successfully. Redirecting to gallery...
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <X className="h-4 w-4 text-red-600" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Image Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a title for this image"
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Enter a description for this image"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <MediaUploader
                label="Image File"
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
                <Label htmlFor="tags">Tags (optional)</Label>
                <Input
                  id="tags"
                  placeholder="nature, landscape, beach (comma separated)"
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
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Upload Image
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
