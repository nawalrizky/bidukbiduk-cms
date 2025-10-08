'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { Plus, Search, Filter, Star, Eye, Edit, Trash2, Loader2, Building } from 'lucide-react'
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
            <Card key={hotel.hotel_id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video">
                {hotel.images && hotel.images.length > 0 ? (
                  (() => {
                    const firstImage = hotel.images[0];
                    const imageUrl = typeof firstImage === 'string' 
                      ? firstImage 
                      : firstImage?.image_url;
                    
                    return imageUrl?.trim() ? (
                      <>
                        <Image
                          src={imageUrl}
                          alt={hotel.name}
                          fill
                          className="object-cover"
                        />
                        {hotel.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            +{hotel.images.length - 1} more
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    );
                  })()
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {!hotel.is_active && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{hotel.name}</h3>
                  {hotel.total_rating_users > 0 ? (
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{hotel.total_rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({hotel.total_rating_users})</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Star className="h-4 w-4" />
                      <span className="text-xs">No reviews</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="text-lg font-bold text-green-600">
                    Rp {parseFloat(hotel.price).toLocaleString('id-ID')}
                    <span className="text-sm text-gray-500 font-normal">/night</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    <Link href={`/hotel/${hotel.hotel_id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/hotel/edit-hotel/${hotel.hotel_id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(hotel.hotel_id, hotel.name)}
                      disabled={deleteLoading === hotel.hotel_id}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {deleteLoading === hotel.hotel_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
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
