"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader, MediaFile } from "@/components/ui/media-uploader";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      addNotification({
        type: "error",
        title: "Kesalahan Validasi",
        message: "Nama amenitas wajib diisi.",
      });
      return;
    }

    if (!formData.description.trim()) {
      addNotification({
        type: "error",
        title: "Kesalahan Validasi",
        message: "Deskripsi amenitas wajib diisi.",
      });
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      addNotification({
        type: "error",
        title: "Kesalahan Validasi",
        message: "Silakan masukkan harga yang valid.",
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
      mediaFiles.forEach((media) => {
        submitData.append("images", media.file);
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
        title: "Amenitas dibuat",
        message: `Amenitas "${formData.name}" telah berhasil dibuat`,
      });

      router.push("/hotel");
    } catch (error: unknown) {
      console.error("Error creating hotel:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      addNotification({
        type: "error",
        title: "Gagal membuat amenitas",
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
          Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Amenitas Baru</h1>
          <p className="text-gray-600">Buat listing amenitas baru (restoran, cafe, dll)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Informasi Dasar</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Amenitas *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Masukkan nama amenitas (contoh: Restoran, Cafe, dll)"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Masukkan deskripsi amenitas"
                required
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="price">Harga (IDR) per malam *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Masukkan harga dalam IDR"
                required
              />
            </div>

            <div>
              <Label htmlFor="book_url">URL Pemesanan</Label>
              <Input
                id="book_url"
                type="url"
                value={formData.book_url}
                onChange={(e) => handleInputChange("book_url", e.target.value)}
                placeholder="https://booking.example.com/hotel"
              />
            </div>

            <div>
              <Label htmlFor="maps_url">URL Peta</Label>
              <Input
                id="maps_url"
                type="url"
                value={formData.maps_url}
                onChange={(e) => handleInputChange("maps_url", e.target.value)}
                placeholder="https://maps.google.com/?q=..."
              />
            </div>

            <div>
              <Label htmlFor="price">Harga (IDR) per malam *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Masukkan harga dalam IDR"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="total_rating">Rating Rata-rata</Label>
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
                <p className="text-xs text-gray-500 mt-1">Rating dari 0.0 hingga 5.0</p>
              </div>

              <div>
                <Label htmlFor="total_rating_users">Total Ulasan</Label>
                <Input
                  id="total_rating_users"
                  type="number"
                  min="0"
                  value={formData.total_rating_users}
                  onChange={(e) => handleInputChange("total_rating_users", e.target.value)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Jumlah ulasan</p>
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
              <Label htmlFor="is_active">Aktif (terlihat untuk publik)</Label>
            </div>
          </div>
        </Card>

        {/* Hotel Images */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Gambar Amenitas</h2>
          <MediaUploader
            label=""
            acceptImages={true}
            multiple={true}
            maxFiles={10}
            maxSizeMB={5}
            value={mediaFiles}
            onChange={setMediaFiles}
          />
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Buat Amenitas
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}