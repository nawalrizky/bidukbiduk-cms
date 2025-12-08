"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader, MediaFile } from "@/components/ui/media-uploader";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { getHotel, updateHotel } from "@/lib/api/hotels";
import { useNotifications } from "@/contexts/NotificationContext";

interface FormData {
  name: string;
  description: string;
  price: string;
  book_url: string;
  maps_url: string;
  total_rating: string;
  total_rating_users: string;
  is_active: boolean;
}

export default function EditHotelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [existingImages, setExistingImages] = useState<{id: number, image_url: string}[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    book_url: "",
    maps_url: "",
    total_rating: "0",
    total_rating_users: "0",
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        const hotelData = await getHotel(parseInt(resolvedParams.id));

        // Populate form with existing data
        setFormData({
          name: hotelData.name,
          description: hotelData.description || "",
          price: hotelData.price,
          book_url: hotelData.book_url || "",
          maps_url: hotelData.maps_url || "",
          total_rating: hotelData.total_rating?.toString() || "0",
          total_rating_users: hotelData.total_rating_users?.toString() || "0",
          is_active: hotelData.is_active,
        });

        // Set existing images - handle both string array and object array
        if (hotelData.images && hotelData.images.length > 0) {
          const normalizedImages = hotelData.images.map((img, index) => {
            if (typeof img === 'string') {
              return { id: index, image_url: img };
            }
            return img;
          });
          setExistingImages(normalizedImages);
        }

      } catch (error) {
        console.error("Error loading data:", error);
        addNotification({
          type: "error",
          title: "Failed to load hotel",
          message: "Unable to load hotel data. Please try again.",
        });
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, addNotification]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveExistingImage = (imageId: number) => {
    const updatedExisting = existingImages.filter(img => img.id !== imageId);
    setExistingImages(updatedExisting);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Hotel name is required.",
      });
      return;
    }

    if (!formData.description.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Hotel description is required.",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a valid price.",
      });
      return;
    }

    try {
      setLoading(true);

      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("description", formData.description);
      submitData.append("price", formData.price);
      submitData.append("is_active", formData.is_active.toString());
      
      // Add URLs if provided
      if (formData.book_url.trim()) {
        submitData.append("book_url", formData.book_url);
      }
      
      if (formData.maps_url.trim()) {
        submitData.append("maps_url", formData.maps_url);
      }

      // Add rating data
      submitData.append("total_rating", formData.total_rating);
      submitData.append("total_rating_users", formData.total_rating_users);
      console.log('Rating data being sent:', {
        total_rating: formData.total_rating,
        total_rating_users: formData.total_rating_users
      });

      // Add new images if selected
      mediaFiles.forEach((media) => {
        submitData.append("images", media.file);
      });

      // Add existing image IDs to keep
      existingImages.forEach((image) => {
        submitData.append("existing_image_ids", image.id.toString());
      });

      console.log("Form data before submission:");
      for (const [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      await updateHotel(parseInt(resolvedParams.id), submitData);

      addNotification({
        type: "success",
        title: "Hotel updated",
        message: `Hotel "${formData.name}" has been updated successfully`,
      });

      router.push("/hotel");
    } catch (error: unknown) {
      console.error("Error updating hotel:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      addNotification({
        type: "error",
        title: "Failed to update hotel",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Hotel</h1>
            <p className="text-gray-600">Update hotel information</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hotel data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Hotel</h1>
          <p className="text-gray-600">Update hotel information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Hotel Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter hotel name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter hotel description"
                className="min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price (IDR) per night *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Enter price in IDR"
                required
              />
            </div>

            <div>
              <Label htmlFor="book_url">Booking URL</Label>
              <Input
                id="book_url"
                type="url"
                value={formData.book_url}
                onChange={(e) => handleInputChange("book_url", e.target.value)}
                placeholder="https://example.com/booking"
              />
            </div>

            <div>
              <Label htmlFor="maps_url">Maps URL</Label>
              <Input
                id="maps_url"
                type="url"
                value={formData.maps_url}
                onChange={(e) => handleInputChange("maps_url", e.target.value)}
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_rating">Average Rating</Label>
                <Input
                  id="total_rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.total_rating}
                  onChange={(e) => handleInputChange("total_rating", e.target.value)}
                  placeholder="0.0 - 5.0"
                />
                <p className="text-xs text-gray-500 mt-1">Rating from 0.0 to 5.0</p>
              </div>

              <div>
                <Label htmlFor="total_rating_users">Total Reviews</Label>
                <Input
                  id="total_rating_users"
                  type="number"
                  min="0"
                  value={formData.total_rating_users}
                  onChange={(e) => handleInputChange("total_rating_users", e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Number of reviews</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange("is_active", e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="is_active">Active (visible to public)</Label>
            </div>
          </div>
        </Card>

        {/* Hotel Images */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Hotel Images</h2>
          <div className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative">
                      <Image
                        src={image.image_url}
                        alt={`Hotel image ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveExistingImage(image.id)}
                        className="absolute top-2 right-2"
                      >
                        ✕
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Current
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Images</h3>
              <MediaUploader
                label=""
                acceptImages={true}
                multiple={true}
                maxFiles={10}
                maxSizeMB={5}
                value={mediaFiles}
                onChange={setMediaFiles}
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Hotel
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}