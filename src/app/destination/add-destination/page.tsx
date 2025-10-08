"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  createDestination,
  getDestinationCategoriesList,
} from "@/lib/api/destinations";
import { DestinationCategory, CreateDestination } from "@/lib/types";
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
const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function AddDestinationPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [coordinates, setCoordinates] = useState(""); // Single coordinate input
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

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

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getDestinationCategoriesList();
        setCategories(categoriesData);
      } catch (error: unknown) {
        console.error("Error loading categories:", error);
        addNotification({
          type: 'error',
          title: getErrorTitle(error),
          message: getErrorMessage(error)
        });
      }
    };

    loadCategories();
  }, [addNotification]);

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
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  };

  // Handle coordinate input change
  const handleCoordinateChange = (value: string) => {
    setCoordinates(value);
    const parsed = parseCoordinates(value);
    if (parsed) {
      handleInputChange("latitude", parsed.lat.toString());
      handleInputChange("longitude", parsed.lng.toString());
    } else {
      // Clear lat/lng if invalid format
      handleInputChange("latitude", "");
      handleInputChange("longitude", "");
    }
  };

  const getCoordinateValidationMessage = () => {
    if (!coordinates.trim()) return null;

    const parsed = parseCoordinates(coordinates);
    if (!parsed) {
      return {
        type: "error",
        message:
          "Please enter coordinates in format: latitude, longitude (e.g., 1.2206168, 118.7451760)",
      };
    }

    return { type: "success", message: "Coordinates are valid" };
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  // Remove selected file
  const removeImage = (index: number) => {
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

      if (selectedImages.length === 0) {
        addNotification({
          type: 'error',
          title: 'Validation Error',
          message: 'Please select at least one image'
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
      
      // Append image files
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

      await createDestination(submitData);
      
      addNotification({
        type: 'success',
        title: 'Destination created',
        message: `Destination "${formData.name}" has been created successfully`
      });
      
      router.push("/destination");
    } catch (error: unknown) {
      console.error("Error creating destination:", error);
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Add New Destination</h1>
              <p className="text-gray-600 mt-1">
                Create a new tourist destination
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
                <Label htmlFor="name">Destination Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter destination name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={(value: string) =>
                    handleInputChange("category_id", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Enter destination description"
                  rows={4}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Location & Map */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location & Map
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Location Address *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Enter location address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="coordinates">
                  Coordinates (Latitude, Longitude) *
                </Label>
                <Input
                  id="coordinates"
                  value={coordinates}
                  onChange={(e) => handleCoordinateChange(e.target.value)}
                  placeholder="Enter coordinates (e.g., 1.2206168313617975, 118.74517600037646)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: latitude, longitude (separated by comma)
                </p>
              </div>

              {/* Coordinate Validation Message */}
              {coordinates &&
                (() => {
                  const validation = getCoordinateValidationMessage();
                  if (!validation) return null;

                  const bgColor =
                    validation.type === "error"
                      ? "bg-red-50 border-red-200"
                      : "bg-green-50 border-green-200";
                  const textColor =
                    validation.type === "error"
                      ? "text-red-700"
                      : "text-green-700";

                  return (
                    <div className={`p-3 rounded-lg border ${bgColor}`}>
                      <p className={`text-sm ${textColor}`}>
                        {validation.message}
                      </p>
                      {validation.type === "success" &&
                        formData.latitude &&
                        formData.longitude && (
                          <p className="text-xs text-green-600 mt-1">
                            Parsed → Latitude: {formData.latitude}, Longitude:{" "}
                            {formData.longitude}
                          </p>
                        )}
                    </div>
                  );
                })()}

              {/* Coordinate Input Instructions */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">
                  Coordinate Input Guidelines
                </h4>
                <p className="text-sm text-blue-700">
                  Enter the coordinates as latitude and longitude separated by a
                  comma.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Example: 1.2206168313617975, 118.74517600037646
                </p>
                <p className="text-xs text-blue-600">
                  Preview shows the exact location using Google Maps.
                </p>
              </div>

              {/* Location Preview Map */}
              {formData.latitude &&
                formData.longitude &&
                !isNaN(parseFloat(formData.latitude)) &&
                !isNaN(parseFloat(formData.longitude)) && (
                  <div>
                    <Label>Location Preview</Label>
                    <p className="text-sm text-gray-600 mb-2">
                      Preview of entered coordinates
                    </p>
                    <div className="border rounded-lg overflow-hidden h-64">
                      <MapPicker
                        selectedLat={parseFloat(formData.latitude)}
                        selectedLng={parseFloat(formData.longitude)}
                      />
                    </div>
                  </div>
                )}
            </div>
          </Card>

          {/* Additional Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="operating_hours">Operating Hours</Label>
                <Input
                  id="operating_hours"
                  value={formData.operating_hours}
                  onChange={(e) =>
                    handleInputChange("operating_hours", e.target.value)
                  }
                  placeholder="e.g., 08:00 - 17:00"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter operating hours (will be stored as structured data)
                </p>
              </div>

              <div>
                <Label htmlFor="entrance_fee">Entrance Fee</Label>
                <Input
                  id="entrance_fee"
                  value={formData.entrance_fee}
                  onChange={(e) =>
                    handleInputChange("entrance_fee", e.target.value)
                  }
                  placeholder="e.g., Rp 15,000"
                />
              </div>

              <div>
                <Label htmlFor="contact_info">Contact Information</Label>
                <Input
                  id="contact_info"
                  value={formData.contact_info}
                  onChange={(e) =>
                    handleInputChange("contact_info", e.target.value)
                  }
                  placeholder="Phone number or email"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="images" className="flex items-center gap-2 ">
                  <Upload className="h-4 w-4" />
                  Images *
                </Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="file:mr-2 py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select one or more image files (JPG, PNG, GIF, WebP). Maximum file size: 10MB per image.
                </p>
                
                {/* Display selected files */}
                {selectedImages.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected files:</p>
                    <div className="space-y-1">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="facilities">Facilities</Label>
                <Textarea
                  id="facilities"
                  value={formData.facilities}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleInputChange("facilities", e.target.value)
                  }
                  placeholder="List available facilities (parking, restroom, restaurant, etc.)"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter facilities description (will be stored as structured data)
                </p>
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? "Creating..." : "Create Destination"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
