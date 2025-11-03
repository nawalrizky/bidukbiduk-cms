"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit, Trash2, Star, MapPin, Calendar } from "lucide-react";
import { getPackage, deletePackage } from "@/lib/api/packages";
import { DeleteModal, useDeleteModal } from "@/components/ui/delete-modal";
import { Package } from "@/lib/types";
import { useNotifications } from "@/contexts/NotificationContext";
import Image from "next/image";

export default function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // Use the global delete modal hook
  const deleteModal = useDeleteModal();

  useEffect(() => {
    const loadPackage = async () => {
      try {
        setLoading(true);
        const data = await getPackage(parseInt(resolvedParams.id));
        console.log('Package detail data:', data);
        setPackageData(data);
      } catch (error) {
        console.error("Error loading package:", error);
        addNotification({
          type: "error",
          title: "Failed to load package",
          message: "Unable to load package details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [resolvedParams.id, addNotification]);

  const handleDeleteClick = () => {
    if (packageData) {
      deleteModal.openModal(packageData.package_id, packageData.name);
    }
  };

  const handleDelete = async () => {
    if (!packageData) return;

    try {
      setDeleting(true);
      await deletePackage(packageData.package_id);
      
      addNotification({
        type: "success",
        title: "Package deleted",
        message: `Package "${packageData.name}" has been deleted successfully`,
      });

      router.push("/package");
    } catch (error: unknown) {
      console.error("Error deleting package:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      addNotification({
        type: "error",
        title: "Failed to delete package",
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
            <h1 className="text-3xl font-bold tracking-tight">Package Details</h1>
            <p className="text-gray-600">View package information</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading package details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packageData) {
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
            <h1 className="text-3xl font-bold tracking-tight">Package Not Found</h1>
          </div>
        </div>
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-600">Package not found or has been removed.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-3xl font-bold tracking-tight">{packageData.name}</h1>
            <p className="text-gray-600">Package Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/package/edit-package/${packageData.package_id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package Image */}
          <Card className="overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              {packageData.image_url ? (
                <Image
                  src={packageData.image_url}
                  alt={packageData.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {packageData.description || "No description available"}
            </p>
          </Card>

          {/* Destinations */}
          {packageData.destination_details && packageData.destination_details.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                <MapPin className="inline h-5 w-5 mr-2" />
                Destinations Included ({packageData.destination_details.length})
              </h2>
              <div className="space-y-4">
                {packageData.destination_details.map((dest, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-semibold text-lg">{dest.name}</h3>
                    {dest.location && (
                      <p className="text-sm text-gray-600 mb-2">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {dest.location}
                      </p>
                    )}
                    {dest.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {dest.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Package Info */}
        <div className="space-y-6">
          {/* Price and Status */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Price</h3>
                <p className="text-3xl font-bold text-green-600">
                  Rp {parseFloat(packageData.price).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  packageData.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {packageData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-gray-700">Rating</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-2xl font-bold">{packageData.total_rating.toFixed(1)}</span>
                      <span className="text-gray-500">/ 5.0</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      ({packageData.total_rating_users} {packageData.total_rating_users === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  {/* Star Rating Visualization */}
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(packageData.total_rating)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Package Information</h3>
            <div className="space-y-3 text-sm">
              {packageData.created_at && (
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">
                      {new Date(packageData.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              {packageData.updated_at && (
                <div className="flex items-start">
                  <Calendar className="h-4 w-4 mr-2 mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(packageData.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={handleDelete}
        itemName={packageData.name}
        itemType="Package"
        isDeleting={deleting}
      />
    </div>
  );
}
