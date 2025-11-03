'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { Plus, Trash2, Camera } from 'lucide-react'
import { getGalleryItems, deleteGalleryItem } from '@/lib/api/gallery'
import { GalleryItem } from '@/lib/types'
import { getSafeImageUrl } from '@/lib/utils/imageUtils'

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Use the delete modal hook
  const deleteModal = useDeleteModal()

  useEffect(() => {
    loadGalleryItems()
  }, [])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const response = await getGalleryItems()
      console.log('Gallery API response:', response) // Debug log
      
      // Handle different response structures
      let items: GalleryItem[] = []
      
      if (Array.isArray(response)) {
        items = response
      } else if (response && typeof response === 'object') {
        // Try different response structures
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyResponse = response as any
        if (anyResponse.results && Array.isArray(anyResponse.results)) {
          items = anyResponse.results // Paginated response
        } else if (anyResponse.data && Array.isArray(anyResponse.data)) {
          items = anyResponse.data // Wrapped response
        } else {
          console.warn('Unexpected API response structure:', response)
          items = []
        }
      }
      
      setGalleryItems(items)
      setError(null)
    } catch (err) {
      // For development/testing, show a fallback error with suggestion
      setError('Failed to load gallery items. The API might not be available.')
      console.error('Error loading gallery items:', err)
      setGalleryItems([]) // Ensure it's always an array
      
      // You can uncomment the lines below to test with mock data
      // setGalleryItems([
      //   {
      //     id: 1,
      //     title: 'Sample Gallery Item',
      //     description: 'This is a mock item for testing',
      //     category: { id: 1, name: 'Test Category' },
      //     imageUrl: 'https://via.placeholder.com/300x200',
      //     created_at: new Date().toISOString()
      //   }
      // ])
      // setError(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (item: GalleryItem) => {
    deleteModal.openModal(item.id, item.title)
  }

  const handleDelete = async () => {
    if (!deleteModal.itemToDelete) return

    try {
      setDeleting(true)
      setError(null)
      
      await deleteGalleryItem(Number(deleteModal.itemToDelete.id))
      setGalleryItems(items => items.filter(item => item.id !== deleteModal.itemToDelete!.id))
      deleteModal.closeModal()
    } catch (err) {
      setError('Failed to delete item')
      console.error('Error deleting item:', err)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-gray-600">Manage your gallery items</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading gallery items...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <p className="text-gray-600">Manage your gallery items</p>
          </div>
          <Link href="/gallery/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">{error}</p>
            </div>
            <Button onClick={loadGalleryItems} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-gray-600">Manage your gallery items</p>
        </div>
        <div className="flex space-x-2">
          
          <Link href="/gallery/add-image">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Item
            </Button>
          </Link>
        </div>
      </div>

      {galleryItems.length === 0 ? (
        <div className="bg-white rounded-lg border shadow-sm p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No gallery items yet</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first gallery item.</p>
            <Link href="/gallery/add-image">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Item
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {galleryItems.map((item, index) => (
            <div key={item.id} className="group">
              <Card className="overflow-hidden border hover:shadow-md transition-shadow cursor-pointer">
                <Link href={`/gallery/${item.id}`} className="block">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={getSafeImageUrl(item.file)}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                      className="object-cover"
                      priority={index < 12}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[-1]">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate group-hover:text-blue-600 transition-colors">{item.title}</h3>
                   
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleDeleteClick(item)
                      }}
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        itemName={deleteModal.itemToDelete?.name || ''}
        itemType="Gallery Item"
        isDeleting={deleting}
      />
    </div>
  )
}
