"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  updateDestination,
  getDestination,
  getDestinationCategoriesList,
} from "@/lib/api/destinations";
import { Destination, DestinationCategory, CreateDestination } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useNotifications } from '@/contexts/NotificationContext';
import { getErrorMessage, getErrorTitle } from '@/lib/utils/errorUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Save, Loader2, Upload, X } from "lucide-react";

// Dynamically import the map component to avoid SSR issues
const MapPicker = dynamic(() => import("../../add-destination/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function EditDestinationPage() {
  const router = useRouter();
  const params = useParams();
  const destinationId = params?.id as string;
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [coordinates, setCoordinates] = useState(""); // Single coordinate input
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateDestination>({
    name: "",
    description: "",
    category_id: 0,
    location: "",
    latitude: "",
    longitude: "",
    facilities: "",
    operating_hours: "",
    entrance_fee: "",
    contact_info: "",
    is_active: true,
  });

  // Load destination data and categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        
        // Load categories
        const categoriesData = await getDestinationCategoriesList();
        setCategories(categoriesData);

        // Load destination data
        if (destinationId) {
          const destination = await getDestination(parseInt(destinationId));
          console.log('Loaded destination data:', destination);
          
          // Extract coordinates from nested structure
          let latitude = "";
          let longitude = "";
          const destinationWithCoords = destination as Destination & { coordinates?: { latitude: number; longitude: number } };
          if (destinationWithCoords.coordinates && typeof destinationWithCoords.coordinates === 'object') {
            latitude = destinationWithCoords.coordinates.latitude?.toString() || "";
            longitude = destinationWithCoords.coordinates.longitude?.toString() || "";
          }

          // Populate form with existing data
          setFormData({
            name: destination.name || "",
            description: destination.description || "",
            category_id: destination.category?.id || destination.category_id || 0,
            location: destination.location || "",
            latitude: latitude,
            longitude: longitude,
            facilities: Array.isArray(destination.facilities) ? destination.facilities.join(", ") : destination.facilities || "",
            operating_hours: Array.isArray(destination.operating_hours) ? destination.operating_hours.join(", ") : destination.operating_hours || "",
            entrance_fee: destination.entrance_fee || "",
            contact_info: destination.contact_info || "",
            is_active: destination.is_active !== undefined ? destination.is_active : true,
          });

          // Handle images - can be string, array, or other format
          if (destination.images) {
            let imageUrls: string[] = [];
            const images = destination.images as unknown;
            
            if (typeof images === 'string') {
              // If it's a string, try to parse as JSON or treat as single URL
              try {
                const parsed = JSON.parse(images);
                if (Array.isArray(parsed)) {
                  imageUrls = parsed;
                } else {
                  imageUrls = [images];
                }
              } catch {
                // If not JSON, treat as single URL
                imageUrls = [images];
              }
            } else if (Array.isArray(images)) {
              // If it's already an array
              imageUrls = images.map((img: unknown) => 
                typeof img === 'string' ? img : (img as { image?: string; url?: string }).image || (img as { image?: string; url?: string }).url || ''
              ).filter((url: string) => url);
            }
            
            console.log('Processed image URLs:', imageUrls);
            setExistingImages(imageUrls);
          }

          // Set coordinates for display
          if (latitude && longitude) {
            setCoordinates(`${latitude}, ${longitude}`);
          }
          
          console.log('Form populated with:', {
            name: destination.name,
            description: destination.description,
            category_id: destination.category?.id,
            location: destination.location,
            coordinates: `${latitude}, ${longitude}`,
            facilities: destination.facilities,
            operating_hours: destination.operating_hours,
            entrance_fee: destination.entrance_fee,
            contact_info: destination.contact_info,
            is_active: destination.is_active
          });
        }
      } catch (error: unknown) {
        console.error("Error loading data:", error);
        addNotification({
          type: 'error',
          title: getErrorTitle(error),
          message: getErrorMessage(error)
        });
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [destinationId, addNotification]);

  // Sync coordinates field when lat/lng changes externally
  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const coordString = `${formData.latitude}, ${formData.longitude}`;
      if (coordString !== coordinates) {
        setCoordinates(coordString);
      }
    }
  }, [formData.latitude, formData.longitude, coordinates]);

  const handleInputChange = (
    field: keyof CreateDestination,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Parse coordinates from single input (lat, lng)
  const parseCoordinates = (coordString: string) => {
    const parts = coordString.split(",").map((part) => part.trim());
    if (parts.length === 2) {
      const lat = parts[0];
      const lng = parts[1];
      return { lat, lng };
    }
    return null;
  };

  const handleCoordinateChange = (value: string) => {
    setCoordinates(value);
    const parsed = parseCoordinates(value);
    if (parsed) {
      setFormData((prev) => ({
        ...prev,
        latitude: parsed.lat,
        longitude: parsed.lng,
      }));
    }
  };

  // Note: MapPicker is read-only, location selection is handled by coordinate input

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeSelectedImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category_id || !formData.location || !formData.latitude || !formData.longitude) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please fill in all required fields'
        });
        return;
      }

      // Create FormData for multipart/form-data submission
      const submitData = new FormData();
      
      // Append form fields with proper formatting
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle numeric fields
          if (key === 'category_id') {
            submitData.append(key, value.toString());
          }
          // Convert certain fields to JSON arrays if they contain text
          else if (key === 'facilities' || key === 'operating_hours') {
            if (value.toString().trim()) {
              // If the field has content, wrap it in a JSON array
              const jsonValue = JSON.stringify([value.toString()]);
              submitData.append(key, jsonValue);
            } else {
              // If empty, send empty JSON array
              submitData.append(key, JSON.stringify([]));
            }
          } else {
            submitData.append(key, value.toString());
          }
        }
      });
      
      // Validate that category_id is not 0
      if (!formData.category_id || formData.category_id === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please select a destination category'
        });
        return;
      }
      
      // Append new image files if any
      selectedImages.forEach((file) => {
        submitData.append(`images`, file);
      });

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (const [key, value] of submitData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
          // Show JSON conversion for specific fields
          if (key === 'facilities' || key === 'operating_hours') {
            console.log(`  → JSON converted from: "${formData[key as keyof CreateDestination]}"`);
          }
        }
      }

      await updateDestination(parseInt(destinationId), submitData);
      
      addNotification({
        type: 'success',
        title: 'Destination updated',
        message: `Destination "${formData.name}" has been updated successfully`
      });
      
      router.push("/destination");
    } catch (error: unknown) {
      console.error("Error updating destination:", error);
      
      // Debug: Log the error structure
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown; status?: number } };
        console.log("Error response data:", axiosError.response?.data);
        console.log("Error status:", axiosError.response?.status);
      }
      
      addNotification({
        type: 'error',
        title: getErrorTitle(error),
        message: getErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/destination");
  };

  if (pageLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading destination data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Edit Destination</h1>
              <p className="text-gray-600 mt-1">
                Update destination information
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>


        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Destination Name * 
                
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter destination name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">
                  Category * 
                </Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value) => handleInputChange("category_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="description">
                Description *
                {formData.description && (
                  <span className="text-sm text-gray-500 font-normal">
                    {" "}(Current: {formData.description.length > 50 ? formData.description.substring(0, 50) + '...' : formData.description})
                  </span>
                )}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter destination description"
                rows={4}
                required
              />
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">
                  Address *
                
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="Enter destination address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coordinates">
                  Coordinates (Latitude, Longitude) *
                  {coordinates && (
                    <span className="text-sm text-gray-500 font-normal">
                      {" "}(Current: {coordinates})
                    </span>
                  )}
                </Label>
                <Input
                  id="coordinates"
                  value={coordinates}
                  onChange={(e) => handleCoordinateChange(e.target.value)}
                  placeholder="e.g., -8.4095, 115.1889"
                  required
                />
              </div>
              <div>
                <Label>Map Location Preview</Label>
                <MapPicker
                  selectedLat={formData.latitude ? parseFloat(formData.latitude) : undefined}
                  selectedLng={formData.longitude ? parseFloat(formData.longitude) : undefined}
                />
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facilities">
                  Facilities
                  
                </Label>
                <Textarea
                  id="facilities"
                  value={formData.facilities}
                  onChange={(e) => handleInputChange("facilities", e.target.value)}
                  placeholder="e.g., Parking, Restaurant, Toilet"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="operating_hours">
                  Operating Hours
           
                </Label>
                <Textarea
                  id="operating_hours"
                  value={formData.operating_hours}
                  onChange={(e) => handleInputChange("operating_hours", e.target.value)}
                  placeholder="e.g., 08:00 - 17:00"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="entrance_fee">
                  Entrance Fee
                  
                </Label>
                <Input
                  id="entrance_fee"
                  value={formData.entrance_fee}
                  onChange={(e) => handleInputChange("entrance_fee", e.target.value)}
                  placeholder="e.g., IDR 10,000"
                />
              </div>
              <div>
                <Label htmlFor="contact_info">
                  Contact Information
                
                </Label>
                <Input
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) => handleInputChange("contact_info", e.target.value)}
                  placeholder="Phone number or email"
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Images
            </h2>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <Label>Current Images</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={imageUrl}
                        alt={`Current ${index + 1}`}
                        width={200}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Current
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* New Images Upload */}
            <div>
              <Label htmlFor="images">Add New Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1"
              />
            </div>

            {/* Preview Selected Images */}
            {selectedImages.length > 0 && (
              <div className="mt-4">
                <Label>New Images to Upload</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        width={200}
                        height={96}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeSelectedImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Destination
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
