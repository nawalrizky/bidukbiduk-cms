'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal';
import { 
  Plus, 
  Search, 
  MapPin, 
  DollarSign, 
  Edit, 
  Trash2,
  ExternalLink,
  FolderOpen,
  Loader2,
  Info
} from 'lucide-react';
import { 
  getDestinations, 
  getDestinationCategoriesList, 
  deleteDestination 
} from '@/lib/api/destinations';
import { Destination, DestinationCategory } from '@/lib/types';
import { useNotifications } from '@/contexts/NotificationContext';

export default function DestinationPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const deleteModal = useDeleteModal();
  
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [destinationsResponse, categoriesData] = await Promise.all([
        getDestinations(),
        getDestinationCategoriesList()
      ]);
      
      setDestinations(destinationsResponse.data || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading destinations:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load destinations',
        message: 'Unable to load destinations. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    deleteModal.openModal(id, name);
  };

  const confirmDelete = async () => {
    if (!deleteModal.itemToDelete) return;
    
    try {
      setDeleteLoading(Number(deleteModal.itemToDelete.id));
      await deleteDestination(Number(deleteModal.itemToDelete.id));
      
      addNotification({
        type: 'success',
        title: 'Destination Deleted',
        message: `Destination "${deleteModal.itemToDelete.name}" has been deleted successfully`
      });
      
      deleteModal.closeModal();
      await loadData();
    } catch (error: unknown) {
      console.error('Error deleting destination:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      addNotification({
        type: 'error',
        title: 'Failed to delete destination',
        message: errorMessage
      });
    } finally {
      setDeleteLoading(null);
      deleteModal.closeModal();
    }
  };

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === null || destination.category.id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Destination Management</h1>
            <p className="text-gray-600 mt-2">Loading destinations...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destination Management</h1>
          <p className="text-gray-600 mt-2">
            Manage travel destinations and locations ({destinations.length} total)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            className="flex items-center space-x-2"
            onClick={() => router.push('/destination/categories')}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Manage Categories</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={() => router.push('/destination/add-destination')}
          >
            <Plus className="h-4 w-4" />
            <span>Add Destination</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="min-w-48">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredDestinations.length} of {destinations.length} destinations
        </span>
       
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No destinations found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || selectedCategory
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first destination'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <Card key={destination.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{destination.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {destination.category.name}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedDestination(destination);
                        setShowDetailModal(true);
                      }}
                      title="View Details"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/destination/edit-destination/${destination.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(destination.id, destination.name)}
                      disabled={deleteLoading === destination.id}
                      className="text-red-600 hover:text-red-700"
                    >
                      {deleteLoading === destination.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">{destination.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="line-clamp-1">{destination.location}</span>
                  </div>
                  
                  {destination.entrance_fee && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Rp {parseFloat(destination.entrance_fee).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>

                {(destination.latitude && destination.longitude) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open(`https://www.openstreetmap.org/#map=15/${destination.latitude}/${destination.longitude}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                )}
              </CardContent>
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
        itemType="Destination"
        isDeleting={deleteLoading !== null}
      />

      {/* Detail Modal */}
      {showDetailModal && selectedDestination && (
        <div 
          className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedDestination.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </Button>
            </div>

            {/* Destination Image */}
            {selectedDestination.images && (
              <div className="relative w-full h-64 bg-gray-200">
                <Image
                  src={selectedDestination.images}
                  alt={selectedDestination.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Kategori</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {selectedDestination.category.name}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Deskripsi</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDestination.description}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Lokasi</h3>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{selectedDestination.location}</p>
                </div>
              </div>

              {/* Coordinates */}
              {selectedDestination.latitude && selectedDestination.longitude && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Koordinat</h3>
                  <p className="text-gray-700">
                    Lat: {selectedDestination.latitude}, Long: {selectedDestination.longitude}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.open(`https://www.openstreetmap.org/#map=15/${selectedDestination.latitude}/${selectedDestination.longitude}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Lihat di Peta
                  </Button>
                </div>
              )}

              {/* Entrance Fee */}
              {selectedDestination.entrance_fee && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Biaya Masuk</h3>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                    <p className="text-lg font-semibold text-gray-900">
                      Rp {parseFloat(selectedDestination.entrance_fee).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )}

              {/* Operating Hours */}
              {selectedDestination.operating_hours && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Jam Operasional</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDestination.operating_hours}</p>
                </div>
              )}

              {/* Contact */}
              {selectedDestination.contact_info && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Kontak</h3>
                  <p className="text-gray-700">{selectedDestination.contact_info}</p>
                </div>
              )}

              {/* Facilities */}
              {selectedDestination.facilities && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Fasilitas</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedDestination.facilities}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowDetailModal(false);
                    router.push(`/destination/edit-destination/${selectedDestination.id}`);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Destinasi
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
