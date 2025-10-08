'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { Plus, Search, Filter, Star, Edit, Trash2, Loader2, Building } from 'lucide-react'
import { getHotels, deleteHotel } from '@/lib/api/hotels'
import { Hotel } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function HotelPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  
  // Use the global delete modal hook
  const deleteModal = useDeleteModal()
  
  const { addNotification } = useNotifications()

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true)
      console.log('Loading hotels...')
      const response = await getHotels()
      console.log('Hotels response:', response)
      
      // Handle different response structures
      let hotelsList: Hotel[] = []
      
      if (response.data && Array.isArray(response.data)) {
        hotelsList = response.data
      } else if (Array.isArray(response)) {
        hotelsList = response
      } else {
        console.warn('Unexpected hotels response structure:', response)
        hotelsList = []
      }
      
      setHotels(hotelsList)
    } catch (error) {
      console.error('Error loading hotels:', error)
      addNotification({
        type: 'error',
        title: 'Failed to load hotels',
        message: 'Unable to load hotels. Please try again.'
      })
      // Set empty array on error
      setHotels([])
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    loadHotels()
  }, [loadHotels])

  const handleDelete = async (hotelId: number, hotelName: string) => {
    deleteModal.openModal(hotelId, hotelName)
  }

  const confirmDelete = async () => {
    if (!deleteModal.itemToDelete) return

    try {
      setDeleteLoading(Number(deleteModal.itemToDelete.id))
      await deleteHotel(Number(deleteModal.itemToDelete.id))
      
      addNotification({
        type: 'success',
        title: 'Hotel deleted',
        message: `Hotel "${deleteModal.itemToDelete.name}" has been deleted successfully`
      })
      
      // Close modal and reload hotels list
      deleteModal.closeModal()
      await loadHotels()
    } catch (error: unknown) {
      console.error('Error deleting hotel:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to delete hotel',
        message: errorMessage
      })
    } finally {
      setDeleteLoading(null)
      deleteModal.closeModal()
    }
  }

  // Filter hotels based on search term and active status
  const filteredHotels = hotels.filter(hotel => {
    if (!Array.isArray(hotels)) return false
    
    const matchesSearch = hotel.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesActiveFilter = showActiveOnly ? hotel.is_active : true
    return matchesSearch && matchesActiveFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
            <p className="text-gray-600">Manage hotel listings and bookings</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotels...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <p className="text-gray-600">Manage hotel listings and bookings</p>
        </div>
        <div className="flex space-x-2">
          <Link href="/hotel/add-hotel">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Hotel
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
        </div>
      </Card>

      {/* Hotels List */}
      {filteredHotels.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <Building className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || showActiveOnly ? 'No hotels found' : 'No hotels yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || showActiveOnly 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first hotel listing.'}
            </p>
            {!searchTerm && !showActiveOnly && (
              <Link href="/hotel/add-hotel">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Hotel
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <Card key={hotel.hotel_id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {/* Hotel Image - Clickable to view details */}
              <Link href={`/hotel/${hotel.hotel_id}`}>
                <div className="aspect-video bg-gray-200 relative cursor-pointer">
                  {hotel.images && hotel.images.length > 0 ? (
                    (() => {
                      const firstImage = hotel.images[0];
                      const imageUrl = typeof firstImage === 'string' 
                        ? firstImage 
                        : firstImage?.image_url;
                      
                      return imageUrl?.trim() ? (
                        <Image
                          src={imageUrl}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Building className="h-12 w-12 text-gray-400" />
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      hotel.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {hotel.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {hotel.images && hotel.images.length > 1 && (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      +{hotel.images.length - 1} more
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1 space-y-3">
                  {/* Hotel Name and Price */}
                  <div>
                    <Link href={`/hotel/${hotel.hotel_id}`}>
                      <h3 className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors">
                        {hotel.name}
                      </h3>
                    </Link>
                    <p className="text-2xl font-bold text-green-600">
                      Rp {parseFloat(hotel.price).toLocaleString('id-ID')}
                      <span className="text-sm text-gray-500 font-normal">/night</span>
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {hotel.total_rating_users > 0 ? (
                        <>
                          {hotel.total_rating.toFixed(1)} ({hotel.total_rating_users} reviews)
                        </>
                      ) : (
                        'No reviews yet'
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `/hotel/edit-hotel/${hotel.hotel_id}`}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(hotel.hotel_id, hotel.name)}
                    disabled={deleteLoading === hotel.hotel_id}
                  >
                    {deleteLoading === hotel.hotel_id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.itemToDelete?.name || ''}
        itemType="Hotel"
        isDeleting={deleteLoading !== null}
      />
    </div>
  )
}
