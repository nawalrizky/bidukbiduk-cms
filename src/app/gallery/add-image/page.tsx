'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, Check, X, Camera } from 'lucide-react'
import { createGalleryItem } from '@/lib/api/gallery'
import { CreateGalleryItem } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getSafeImageUrl } from '@/lib/utils/imageUtils'
import { authService } from '@/lib/api/auth'

export default function AddImagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
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

  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Handle file selection (shared by both click and drag & drop)
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    
    // Store the actual file object
    setSelectedFile(file)
    
    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    
    // Store the File object directly in form data
    setFormData(prev => ({ ...prev, file }))
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag & drop events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

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
    
    if (!selectedFile) {
      setError('Please select an image to upload')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      console.log('Submitting form data:', formData) // Debug log
      console.log('Auth token present:', !!authService.getAccessToken()) // Auth debug
      
      const response = await createGalleryItem(formData)
      
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
        setPreviewUrl('')
        setSelectedFile(null)
        
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {previewUrl ? (
              <div className="relative w-full aspect-square max-w-md mb-4">
                <Image 
                  src={getSafeImageUrl(previewUrl)}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-full aspect-square max-w-md flex flex-col items-center justify-center bg-gray-100 rounded-lg mb-4">
                <Camera className="h-16 w-16 text-gray-400 mb-2" />
                <p className="text-gray-500">No image selected</p>
              </div>
            )}
          </CardContent>
        </Card>

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

              <div className="space-y-2">
                <Label htmlFor="file">Image File</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-600 mb-2">
                    {isDragging ? 'Drop gambar di sini' : 'Drag and drop gambar, atau klik untuk memilih'}
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="mt-2"
                    onChange={handleFileChange}
                  />
                  {previewUrl && (
                    <div className="mt-4">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="mx-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

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
                      <Upload className="mr-2 h-4 w-4" />
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
