"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageCarouselProps {
  images: { id: number; image_url: string }[] | string[];
  alt?: string;
  className?: string;
  showFullscreen?: boolean;
}

export default function ImageCarousel({ 
  images, 
  alt = "Hotel image", 
  className = "",
  showFullscreen = true 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalize images to consistent format and filter out invalid ones
  const normalizedImages = React.useMemo(() => {
    if (!images || images.length === 0) return [];
    
    return images
      .map((img, index) => {
        if (typeof img === 'string') {
          return { id: index, image_url: img };
        }
        return img;
      })
      .filter(img => img && img.image_url && img.image_url.trim() !== '');
  }, [images]);

  if (normalizedImages.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  // Handle single image
  if (normalizedImages.length === 1) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={normalizedImages[0].image_url}
          alt={alt}
          fill
          className="object-cover cursor-pointer"
          onClick={() => showFullscreen && setIsFullscreen(true)}
        />
        
        {/* Fullscreen Modal */}
        {isFullscreen && showFullscreen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <Image
                src={normalizedImages[0].image_url}
                alt={alt}
                width={800}
                height={600}
                className="max-w-full max-h-full object-contain"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === normalizedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? normalizedImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Main Carousel */}
      <div className={`relative ${className}`}>
        {/* Main Image */}
        <div className="relative w-full h-full">
          <Image
            src={normalizedImages[currentIndex].image_url}
            alt={`${alt} ${currentIndex + 1}`}
            fill
            className="object-cover cursor-pointer"
            onClick={() => showFullscreen && setIsFullscreen(true)}
          />
        </div>

        {/* Navigation Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={prevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={nextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {normalizedImages.length}
        </div>

        {/* Thumbnail Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {normalizedImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? "bg-white" 
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && showFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
          <div className="relative max-w-6xl max-h-[95vh] w-full h-full flex items-center justify-center">
            {/* Main Fullscreen Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={normalizedImages[currentIndex].image_url}
                alt={`${alt} ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Fullscreen Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white border-white/40"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white border-white/40"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Close Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Fullscreen Image Counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded">
              {currentIndex + 1} / {normalizedImages.length}
            </div>

            {/* Fullscreen Thumbnail Navigation */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto">
              {normalizedImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 w-16 h-12 relative rounded border-2 transition-colors ${
                    index === currentIndex 
                      ? "border-white" 
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}