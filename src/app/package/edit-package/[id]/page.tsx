"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, X, Save, Loader2 } from "lucide-react";
import { getPackage, updatePackage } from "@/lib/api/packages";
import { getDestinations } from "@/lib/api/destinations";
import { Package, Destination } from "@/lib/types";
import { useNotifications } from "@/contexts/NotificationContext";

interface FormData {
  name: string;
  description: string;
  price: string;
  total_rating: string;
  total_rating_users: string;
  is_active: boolean;
  destination_ids: number[];
}

export default function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [existingPackage, setExistingPackage] = useState<Package | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
    total_rating: "0",
    total_rating_users: "0",
    is_active: true,
    destination_ids: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        const [packageData, destinationsResponse] = await Promise.all([
          getPackage(parseInt(resolvedParams.id)),
          getDestinations(),
        ]);

        setExistingPackage(packageData);
        setDestinations(destinationsResponse.data);

        // Populate form with existing data
        setFormData({
          name: packageData.name,
          description: packageData.description || "",
          price: packageData.price,
          total_rating: packageData.total_rating?.toString() || "0",
          total_rating_users: packageData.total_rating_users?.toString() || "0",
          is_active: packageData.is_active,
          destination_ids: packageData.destinations ? packageData.destinations.map(dest => dest.id) : [],
        });

        // Set existing image preview
        if (packageData.image_url) {
          setImagePreview(packageData.image_url);
        }

      } catch (error) {
        console.error("Error loading data:", error);
        addNotification({
          type: "error",
          title: "Failed to load package",
          message: "Unable to load package data. Please try again.",
        });
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, addNotification]);

  const handleInputChange = (field: keyof FormData, value: string | boolean | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addNotification({
          type: "error",
          title: "File too large",
          message: "Please select an image smaller than 5MB.",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        addNotification({
          type: "error",
          title: "Invalid file type",
          message: "Please select a valid image file.",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const toggleDestination = (destinationId: number) => {
    setFormData(prev => ({
      ...prev,
      destination_ids: prev.destination_ids.includes(destinationId)
        ? prev.destination_ids.filter(id => id !== destinationId)
        : [...prev.destination_ids, destinationId]
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Package name is required.",
      });
      return;
    }

    if (!formData.description.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Package description is required.",
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

    if (formData.destination_ids.length === 0) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please select at least one destination.",
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
      submitData.append("total_rating", formData.total_rating);
      submitData.append("total_rating_users", formData.total_rating_users);
      
      // Add destinations
      formData.destination_ids.forEach(id => {
        submitData.append("destinations", id.toString());
      });

      // Add image if selected (new image)
      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      console.log("Form data before submission:");
      for (const [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      await updatePackage(parseInt(resolvedParams.id), submitData);

      addNotification({
        type: "success",
        title: "Package updated",
        message: `Package "${formData.name}" has been updated successfully`,
      });

      router.push("/package");
    } catch (error: unknown) {
      console.error("Error updating package:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      addNotification({
        type: "error",
        title: "Failed to update package",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!existingPackage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Package Not Found</h2>
            <p className="text-gray-600 mb-4">
              The requested package could not be found.
            </p>
            <Button onClick={() => router.push("/package")}>
              Back to Packages
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Package</h1>
            <p className="text-gray-600">Update package information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter package name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter package description"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] resize-vertical"
                />
              </div>

              <div>
                <Label htmlFor="price">Price (IDR) *</Label>
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

          {/* Package Image */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Package Image</h2>
            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Package preview"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {selectedImage && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      New Image
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Destinations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Destinations *
            </h2>
            <div className="space-y-3">
              {destinations.length === 0 ? (
                <p className="text-gray-500">No destinations available</p>
              ) : (
                destinations.map((destination) => (
                  <div
                    key={destination.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      id={`destination-${destination.id}`}
                      checked={formData.destination_ids.includes(destination.id)}
                      onChange={() => toggleDestination(destination.id)}
                      className="rounded"
                    />
                    <label
                      htmlFor={`destination-${destination.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div>
                        <h3 className="font-medium">{destination.name}</h3>
                        <p className="text-sm text-gray-600">{destination.location}</p>
                      </div>
                    </label>
                  </div>
                ))
              )}
            </div>
            {formData.destination_ids.length > 0 && (
              <div className="mt-3 text-sm text-gray-600">
                {formData.destination_ids.length} destination(s) selected
              </div>
            )}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Package
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}