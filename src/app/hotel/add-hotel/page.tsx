"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X, Save, Loader2 } from "lucide-react";
import { createHotel } from "@/lib/api/hotels";
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

export default function AddHotelPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      addNotification({
        type: "error",
        title: "Invalid file type",
        message: "Please select only valid image files.",
      });
      return;
    }

    // Validate file sizes (5MB each)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      addNotification({
        type: "error",
        title: "File too large",
        message: "Each image must be less than 5MB.",
      });
      return;
    }

    // Add to existing images
    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    // Create previews for new files
    const newPreviews = [...imagePreviews];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
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

      // Add images if selected
      selectedImages.forEach((image) => {
        submitData.append("images", image);
      });

      console.log("Form data before submission:");
      for (const [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value} (type: ${typeof value})`);
        }
      }

      await createHotel(submitData);

      addNotification({
        type: "success",
        title: "Hotel created",
        message: `Hotel "${formData.name}" has been created successfully`,
      });

      router.push("/hotel");
    } catch (error: unknown) {
      console.error("Error creating hotel:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      addNotification({
        type: "error",
        title: "Failed to create hotel",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Add New Hotel</h1>
          <p className="text-gray-600">Create a new hotel listing</p>
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
                required
                rows={4}
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
                placeholder="https://booking.example.com/hotel"
              />
            </div>

            <div>
              <Label htmlFor="maps_url">Maps URL</Label>
              <Input
                id="maps_url"
                type="url"
                value={formData.maps_url}
                onChange={(e) => handleInputChange("maps_url", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
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
            {/* Image Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={preview}
                      alt={`Hotel preview ${index + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                {imagePreviews.length > 0 ? "Add more images" : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 5MB each. Select multiple files.
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Hotel
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}