'use client';

interface MapPickerProps {
  selectedLat?: number;
  selectedLng?: number;
  zoom?: number;
}

const MapPicker: React.FC<MapPickerProps> = ({ selectedLat, selectedLng, zoom = 16 }) => {
  // If no coordinates provided, show placeholder
  if (!selectedLat || !selectedLng) {
    return (
      <div className="h-96 w-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">📍</div>
          <p className="text-sm">Enter coordinates to see location preview</p>
        </div>
      </div>
    );
  }

  // Google Maps URL for iframe (no API key required for basic embed)
  const googleMapsUrl = `https://maps.google.com/maps?q=${selectedLat},${selectedLng}&hl=en&z=${zoom}&output=embed`;

  return (
    <div className="h-96 w-full">
      <iframe
        src={googleMapsUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="rounded-lg"
        title={`Location preview: ${selectedLat}, ${selectedLng}`}
      />
    </div>
  );
};

export default MapPicker;
