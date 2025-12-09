"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { getDestinations, partialUpdateDestination } from "@/lib/api/destinations";
import { Destination } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Edit, Save, X } from "lucide-react";
import { useNotifications } from '@/contexts/NotificationContext';

// Dynamically import the map component to avoid SSR issues
const MapPicker = dynamic(() => import("../destination/add-destination/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
      Memuat peta...
    </div>
  ),
});

export default function GISPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [editCoordinates, setEditCoordinates] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setLoading(true);
        const response = await getDestinations();
        setDestinations(response.data || []);
      } catch (error) {
        console.error('Error loading destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, []);

  // Extract coordinates from destination data
  const getCoordinates = (destination: Destination) => {
    const destWithCoords = destination as Destination & { coordinates?: { latitude: number; longitude: number } };
    if (destWithCoords.coordinates) {
      return {
        lat: destWithCoords.coordinates.latitude,
        lng: destWithCoords.coordinates.longitude
      };
    }
    // Fallback to direct latitude/longitude if available
    if (destination.latitude && destination.longitude) {
      return {
        lat: parseFloat(destination.latitude),
        lng: parseFloat(destination.longitude)
      };
    }
    return null;
  };

  // Handle edit button click
  const handleEditClick = (destination: Destination) => {
    setEditingDestination(destination);
    const coords = getCoordinates(destination);
    if (coords) {
      setEditCoordinates(`${coords.lat}, ${coords.lng}`);
    } else {
      setEditCoordinates("");
    }
    setIsModalOpen(true);
  };

  // Handle coordinate change
  const parseCoordinates = (coordString: string) => {
    const parts = coordString.split(',').map(part => part.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  };

  // Handle save coordinates
  const handleSaveCoordinates = async () => {
    if (!editingDestination) return;

    const coords = parseCoordinates(editCoordinates);
    if (!coords) {
      addNotification({
        type: 'error',
        title: 'Koordinat Tidak Valid',
        message: 'Silakan masukkan koordinat yang valid dalam format: lintang, bujur'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Update destination with new coordinates
      await partialUpdateDestination(editingDestination.id, {
        latitude: coords.lat.toString(),
        longitude: coords.lng.toString()
      });

      // Update local state
      setDestinations(prev => prev.map(dest => 
        dest.id === editingDestination.id 
          ? { ...dest, latitude: coords.lat.toString(), longitude: coords.lng.toString() }
          : dest
      ));

      addNotification({
        type: 'success',
        title: 'Koordinat Diperbarui',
        message: `Koordinat untuk "${editingDestination.name}" telah berhasil diperbarui`
      });

      // Close modal
      setIsModalOpen(false);
      setEditingDestination(null);
      setEditCoordinates("");
    } catch (error) {
      console.error('Error updating coordinates:', error);
      addNotification({
        type: 'error',
        title: 'Pembaruan Gagal',
        message: 'Gagal memperbarui koordinat. Silakan coba lagi.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingDestination(null);
    setEditCoordinates("");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen GIS</h1>
          <p className="text-gray-600 mt-2">Sistem Informasi Geografis - Pemetaan Destinasi</p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Memuat destinasi...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">GIS Management</h1>
        <p className="text-gray-600 mt-2">Geographic Information System - Destination Mapping</p>
      </div>

      {/* Destinations List */}
      <div className="space-y-4">
        {destinations.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Destinasi Ditemukan</h3>
            <p className="text-gray-500">Tidak ada data destinasi tersedia untuk pemetaan.</p>
          </Card>
        ) : (
          destinations.map((destination) => {
            const coordinates = getCoordinates(destination);
            
            return (
              <Card key={destination.id} className="p-6">
                <div className="flex justify-between items-start gap-6">
                  {/* Left side - Destination info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{destination.name}</h3>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{destination.location}</span>
                      </div>
                    </div>
                    
                    {coordinates && (
                      <div className="text-sm text-gray-500">
                        <span className="font-medium">Koordinat:</span>{" "}
                        {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                      </div>
                    )}
                    
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(destination)}
                        className="flex items-center gap-2 "
                      >
                        <Edit className="h-4 w-4" />
                        Edit Koordinat
                      </Button>
                    </div>
                  </div>

                  {/* Right side - Map preview */}
                  <div className="w-80 h-48 rounded-lg overflow-hidden border border-gray-200">
                    {coordinates ? (
                      <div className="w-full h-full">
                        <MapPicker
                          selectedLat={coordinates.lat}
                          selectedLng={coordinates.lng}
                          zoom={12}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Tidak ada koordinat tersedia</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Coordinates Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900 ">
                Edit Koordinat
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="p-1"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              {editingDestination && (
                <>
                  <div>
                    <h3 className="font-medium text-gray-900">{editingDestination.name}</h3>
                    <p className="text-sm text-gray-600">{editingDestination.location}</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="coordinates">
                      Koordinat (Lintang, Bujur) *
                    </Label>
                    <Input
                      id="coordinates"
                      value={editCoordinates}
                      onChange={(e) => setEditCoordinates(e.target.value)}
                      placeholder="contoh: -8.4095, 115.1889"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Masukkan koordinat dalam format derajat desimal
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={handleModalClose}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveCoordinates}
                disabled={saving || !editCoordinates.trim()}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Koordinat
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
