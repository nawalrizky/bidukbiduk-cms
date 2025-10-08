'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PackageIcon, Edit, Trash2, Plus, Search, Star, MapPin, Loader2 } from 'lucide-react'
import { getPackages, deletePackage } from '@/lib/api/packages'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { Package as PackageType } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'

export default function PackagePage() {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  
  // Use the global delete modal hook
  const deleteModal = useDeleteModal()
  
  const { addNotification } = useNotifications()
  const router = useRouter()

  const loadPackages = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await getPackages()
      console.log('Packages API response:', response)
      
      // Ensure we have an array
      const packagesData = Array.isArray(response.data) ? response.data : []
      setPackages(packagesData)
    } catch (error: unknown) {
      console.error('Error loading packages:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to load packages',
        message: errorMessage
      })
      // Set empty array on error
      setPackages([])
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  const handleDelete = async (packageId: number, packageName: string) => {
    deleteModal.openModal(packageId, packageName)
  }

  const confirmDelete = async () => {
    if (!deleteModal.itemToDelete) return

    try {
      setDeleteLoading(Number(deleteModal.itemToDelete.id))
      await deletePackage(Number(deleteModal.itemToDelete.id))
      
      addNotification({
        type: 'success',
        title: 'Package deleted',
        message: `Package "${deleteModal.itemToDelete.name}" has been deleted successfully`
      })
      
      // Close modal and reload packages list
      deleteModal.closeModal()
      await loadPackages()
    } catch (error: unknown) {
      console.error('Error deleting package:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to delete package',
        message: errorMessage
      })
    } finally {
      setDeleteLoading(null)
      deleteModal.closeModal()
    }
  }

  // Ensure packages is always an array before filtering
  const safePackages = Array.isArray(packages) ? packages : []
  
  const filteredPackages = safePackages.filter(pkg => {
    // Safety checks for package properties
    const packageName = pkg?.name || ''
    const packageDestinations = Array.isArray(pkg?.destinations) ? pkg.destinations : []
    
    const matchesSearch = packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         packageDestinations.some(dest => 
                           (dest?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (dest?.location || '').toLowerCase().includes(searchTerm.toLowerCase())
                         )
    const matchesActiveFilter = !showActiveOnly || pkg?.is_active
    return matchesSearch && matchesActiveFilter
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Packages</h1>
          <p className="text-gray-600">
            Manage travel packages and tour offerings
          </p>
        </div>
        <Button onClick={() => router.push('/package/add-package')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search packages or destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
      </div>

      {/* Packages Grid */}
      {filteredPackages.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-16">
            <PackageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {safePackages.length === 0 ? 'No packages yet' : 'No packages found'}
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              {safePackages.length === 0 
                ? 'Get started by creating your first travel package.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {safePackages.length === 0 && (
              <Button 
                className="mt-4"
                onClick={() => router.push('/package/add-package')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.package_id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {/* Package Image - Clickable to view details */}
              <div 
                className="aspect-video bg-gray-200 relative cursor-pointer"
                onClick={() => router.push(`/package/${pkg.package_id}`)}
              >
                {pkg.image_url ? (
                  <Image
                    src={pkg.image_url}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <PackageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pkg.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {pkg.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1 space-y-3">
                  {/* Package Name and Price */}
                  <div>
                    <h3 
                      className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => router.push(`/package/${pkg.package_id}`)}
                    >
                      {pkg.name}
                    </h3>
                    <p className="text-2xl font-bold text-green-600">
                      Rp {parseFloat(pkg.price).toLocaleString('id-ID')}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {pkg.total_rating > 0 ? (
                        <>
                          {pkg.total_rating.toFixed(1)} ({pkg.total_rating_users} reviews)
                        </>
                      ) : (
                        'No reviews yet'
                      )}
                    </span>
                  </div>

                  {/* Destinations */}
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {pkg.destinations && pkg.destinations.length > 0 
                          ? `${pkg.destinations.length} destination${pkg.destinations.length !== 1 ? 's' : ''}`
                          : 'View details for destinations'
                        }
                      </span>
                    </div>
                    {pkg.destinations && pkg.destinations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pkg.destinations.slice(0, 2).map((dest, index) => (
                          <span key={dest.id || index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {dest.name}
                          </span>
                        ))}
                        {pkg.destinations.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{pkg.destinations.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/package/edit-package/${pkg.package_id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(pkg.package_id, pkg.name)}
                    disabled={deleteLoading === pkg.package_id}
                  >
                    {deleteLoading === pkg.package_id ? (
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
        itemType="Package"
        isDeleting={deleteLoading !== null}
      />
    </div>
  )
}
