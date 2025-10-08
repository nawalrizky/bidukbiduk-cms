"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ImageCarousel from "@/components/ui/image-carousel";
import { ArrowLeft, Edit, Trash2, Calendar, Building, Star } from "lucide-react";
import { getHotel, deleteHotel } from "@/lib/api/hotels";
import { DeleteModal, useDeleteModal } from "@/components/ui/delete-modal";
import { Hotel } from "@/lib/types";
import { useNotifications } from "@/contexts/NotificationContext";

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Use the global delete modal hook
  const deleteModal = useDeleteModal();

  useEffect(() => {
    const loadHotel = async () => {
      try {
        setLoading(true);
        const hotelData = await getHotel(parseInt(resolvedParams.id));
        setHotel(hotelData);
      } catch (error) {
        console.error("Error loading hotel:", error);
        addNotification({
          type: "error",
          title: "Failed to load hotel",
          message: "Unable to load hotel details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHotel();
  }, [resolvedParams.id, addNotification]);

  const handleDeleteClick = () => {
    if (hotel) {
      deleteModal.openModal(hotel.hotel_id, hotel.name);
    }
  };

  const handleDelete = async () => {
    if (!hotel) return;

    try {
      setDeleting(true);
      await deleteHotel(hotel.hotel_id);
      
      addNotification({
        type: "success",
        title: "Hotel deleted",
        message: `Hotel "${hotel.name}" has been deleted successfully`,
      });

      router.push("/hotel");
    } catch (error: unknown) {
      console.error("Error deleting hotel:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      addNotification({
        type: "error",
        title: "Failed to delete hotel",
        message: errorMessage,
      });
    } finally {
      setDeleting(false);
      deleteModal.closeModal();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hotel Details</h1>
            <p className="text-gray-600">View hotel information</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hotel Not Found</h1>
            <p className="text-gray-600">The hotel you&apos;re looking for doesn&apos;t exist</p>
          </div>
        </div>
        <Card className="p-8">
          <div className="text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hotel Not Found</h3>
            <p className="text-gray-600 mb-4">The hotel you&apos;re looking for may have been deleted or doesn&apos;t exist.</p>
            <Link href="/hotel">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Hotels
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{hotel.name}</h1>
            <p className="text-gray-600">Hotel Details</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/hotel/edit-hotel/${hotel.hotel_id}`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            onClick={handleDeleteClick}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1  gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hotel Images */}
          {hotel.images && hotel.images.length > 0 && (
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                <ImageCarousel 
                  images={hotel.images}
                  alt={hotel.name}
                  className="w-full h-full"
                />
              </div>
            </Card>
          )}

          {/* Hotel Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Hotel Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm  text-gray-700">Name</h3>
                <p className="text-lg">{hotel.name}</p>
              </div>

              {hotel.description && (
                <div>
                  <h3 className="font-bold text-sm  text-gray-700">Description</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{hotel.description}</p>
                </div>
              )}
              
              <div>
                <h3 className="font-bold text-sm  text-gray-700">Price per Night</h3>
                <p className="text-2xl font-bold text-green-600">
                  Rp {parseFloat(hotel.price).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-sm  text-gray-700">Rating</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold">{hotel.total_rating.toFixed(1)}</span>
                      <span className="text-gray-500">/ 5.0</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({hotel.total_rating_users} {hotel.total_rating_users === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  {/* Star Rating Visualization */}
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(hotel.total_rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {hotel.book_url && (
                <div>
                  <h3 className="font-bold text-sm  text-gray-700">Booking</h3>
                  <a 
                    href={hotel.book_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                  >
                    Book this hotel
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </a>
                </div>
              )}

              {hotel.maps_url && (
                <div>
                  <h3 className="font-bold text-sm  text-gray-700">Location</h3>
                  <a 
                    href={hotel.maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                  >
                    View on Maps
                    <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                  </a>
                </div>
              )}

              <div>
                <h3 className="font-bold text-sm  text-gray-700">Status</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    hotel.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {hotel.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm  text-gray-700">Created</h3>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{new Date(hotel.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

      
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        itemName={deleteModal.itemToDelete?.name || ''}
        itemType="Hotel"
        isDeleting={deleting}
      />
    </div>
  );
}