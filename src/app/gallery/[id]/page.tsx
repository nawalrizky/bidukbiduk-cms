'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getSafeImageUrl } from '@/lib/utils/imageUtils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Save, Trash2 } from 'lucide-react'
import { 
  getGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem,
  getGalleryCategories 
} from '@/lib/api/gallery'
import { GalleryItem, GalleryCategory, CreateGalleryItem } from '@/lib/types'

interface GalleryDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'
  
  // Use React.use to unwrap the params promise
  const { id } = React.use(params)
  
  const [item, setItem] = useState<GalleryItem | null>(null)
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(isEditMode)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [formData, setFormData] = useState<CreateGalleryItem>({
    title: '',
    description: '',
    category: 0,
    file: '', // Only string for edit mode
    imageUrl: ''
  })

  useEffect(() => {
    loadItem()
    loadCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category,
        file: item.file_url || item.file || '',
        imageUrl: item.file_url || item.file || '' // Maintain backward compatibility
      })
    }
  }, [item])

  const loadItem = async () => {
    try {
      setLoading(true)
      const galleryItem = await getGalleryItem(parseInt(id))
      console.log('Loaded gallery item:', galleryItem) // Debug log
      setItem(galleryItem)
      setError(null)
    } catch (err) {
      console.error('Error loading gallery item:', err)
      setError('Gagal memuat item galeri')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const categoryList = await getGalleryCategories()
      
      // Handle different response structures
      let cats: GalleryCategory[] = []
      if (Array.isArray(categoryList)) {
        cats = categoryList
      } else if (categoryList && typeof categoryList === 'object') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyResponse = categoryList as any
        if (anyResponse.results && Array.isArray(anyResponse.results)) {
          cats = anyResponse.results
        } else if (anyResponse.data && Array.isArray(anyResponse.data)) {
          cats = anyResponse.data
        }
      }
      
      setCategories(cats)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Judul wajib diisi')
      return
    }
    
    if (!formData.category || formData.category === 0) {
      setError('Silakan pilih kategori')
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const updatedItem = await updateGalleryItem(parseInt(id), formData)
      setItem(updatedItem)
      setEditMode(false)
      router.push(`/gallery/${id}`)
    } catch (err) {
      console.error('Error updating gallery item:', err)
      setError('Gagal memperbarui item galeri')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      setError(null)
      
      await deleteGalleryItem(parseInt(id))
      router.push('/gallery')
    } catch (err) {
      console.error('Error deleting gallery item:', err)
      setError('Gagal menghapus item galeri')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category' ? parseInt(value) : value
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/gallery">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Item Galeri</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat item galeri...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !item) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/gallery">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Item Galeri</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <Button onClick={loadItem} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!item) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/gallery">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {editMode ? 'Edit Item Galeri' : item.title}
            </h1>
            <p className="text-gray-600">
              {editMode ? 'Ubah detail item galeri' : 'Detail item galeri'}
            </p>
          </div>
        </div>
        
        {!editMode && (
          <div className="flex space-x-2">
            <Button onClick={() => setEditMode(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)} disabled={saving}>
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image */}
        <Card>
          <CardHeader>
            <CardTitle>Gambar</CardTitle>
          </CardHeader>
          <CardContent>
            {(editMode ? formData.file || formData.imageUrl : item.file_url || item.file) ? (
              <div className="relative w-full h-64">
                <Image
                  src={getSafeImageUrl(editMode ? (formData.file as string) || formData.imageUrl : item.file_url || item.file)}
                  alt={item.title || 'Gallery image'}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Tidak ada gambar tersedia</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detail</CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Judul *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Save/Cancel Buttons */}
                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditMode(false)
                      setError(null)
                      // Reset form data
                      setFormData({
                        title: item.title,
                        description: item.description || '',
                        category: item.category,
                        file: item.file_url || item.file || '',
                        imageUrl: item.file_url || item.file || ''
                      })
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  {item.description && (
                    <p className="text-gray-600">{item.description}</p>
                  )}
                </div>
                
                <div>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.category_name || `Kategori ${item.category}`}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p><strong>ID:</strong> {item.id}</p>
                  {item.media_type && (
                    <p><strong>Jenis Media:</strong> {item.media_type}</p>
                  )}
                  {item.tags && (
                    <p><strong>Tag:</strong> {item.tags}</p>
                  )}
                  {item.uploaded_by_name && (
                    <p><strong>Diunggah oleh:</strong> {item.uploaded_by_name}</p>
                  )}
                  {item.is_featured && (
                    <p><strong>Unggulan:</strong> Ya</p>
                  )}
                  {item.created_at && (
                    <p><strong>Dibuat:</strong> {new Date(item.created_at).toLocaleString()}</p>
                  )}
                  {item.updated_at && (
                    <p><strong>Diperbarui:</strong> {new Date(item.updated_at).toLocaleString()}</p>
                  )}
                  {(item.file_url || item.file) && (
                    <p><strong>URL Gambar:</strong> 
                      <a href={item.file_url || item.file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        Lihat Asli
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Hapus Item Galeri</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus &ldquo;{item.title}&rdquo;? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-4 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Batal
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
