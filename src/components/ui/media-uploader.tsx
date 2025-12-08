'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Video } from 'lucide-react'
import { Button } from './button'

export type MediaFile = {
  file: File
  preview: string
  type: 'image' | 'video'
  id: string
}

export interface MediaUploaderProps {
  /** Accept image files */
  acceptImages?: boolean
  /** Accept video files */
  acceptVideos?: boolean
  /** Allow multiple files */
  multiple?: boolean
  /** Maximum number of files (only applies when multiple=true) */
  maxFiles?: number
  /** Maximum file size in MB */
  maxSizeMB?: number
  /** Current selected files */
  value?: MediaFile[]
  /** Callback when files change */
  onChange?: (files: MediaFile[]) => void
  /** Custom class name */
  className?: string
  /** Label text */
  label?: string
  /** Helper text */
  helperText?: string
  /** Disable the uploader */
  disabled?: boolean
  /** Show preview thumbnails */
  showPreview?: boolean
  /** Preview size (for grid layout) */
  previewSize?: 'sm' | 'md' | 'lg'
}

export function MediaUploader({
  acceptImages = true,
  acceptVideos = false,
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 10,
  value = [],
  onChange,
  className = '',
  label,
  helperText,
  disabled = false,
  showPreview = true,
  previewSize = 'md'
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate accept string for input
  const getAcceptString = () => {
    const accepts: string[] = []
    if (acceptImages) accepts.push('image/*')
    if (acceptVideos) accepts.push('video/*')
    return accepts.join(',')
  }

  // Get file type
  const getFileType = (file: File): 'image' | 'video' | null => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    return null
  }

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    const fileType = getFileType(file)
    
    if (!fileType) {
      return 'File type not supported'
    }

    if (fileType === 'image' && !acceptImages) {
      return 'Image files are not allowed'
    }

    if (fileType === 'video' && !acceptVideos) {
      return 'Video files are not allowed'
    }

    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    return null
  }, [acceptImages, acceptVideos, maxSizeMB])

  // Process files
  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newMediaFiles: MediaFile[] = []

    for (const file of fileArray) {
      // Validate file
      const error = validateFile(file)
      if (error) {
        console.warn(`Skipping file ${file.name}: ${error}`)
        continue
      }

      // Check if we've reached max files
      if (!multiple && newMediaFiles.length >= 1) {
        break
      }

      if (multiple && value.length + newMediaFiles.length >= maxFiles) {
        console.warn(`Maximum ${maxFiles} files allowed`)
        break
      }

      const fileType = getFileType(file)
      if (!fileType) continue

      // Create preview URL
      const preview = URL.createObjectURL(file)
      
      newMediaFiles.push({
        file,
        preview,
        type: fileType,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })
    }

    // Update value
    if (newMediaFiles.length > 0) {
      const updatedFiles = multiple ? [...value, ...newMediaFiles] : newMediaFiles
      onChange?.(updatedFiles)
    }
  }, [value, multiple, maxFiles, validateFile, onChange])

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFiles(files)
    }
  }

  // Remove file
  const removeFile = (id: string) => {
    const updatedFiles = value.filter(f => f.id !== id)
    // Revoke preview URL
    const fileToRemove = value.find(f => f.id === id)
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    onChange?.(updatedFiles)
  }

  // Open file picker
  const openFilePicker = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // Get preview size classes
  const getPreviewSizeClasses = () => {
    switch (previewSize) {
      case 'sm': return 'w-20 h-20'
      case 'md': return 'w-32 h-32'
      case 'lg': return 'w-48 h-48'
      default: return 'w-32 h-32'
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}

      {/* Upload Area */}
      {(!multiple || value.length === 0 || value.length < maxFiles) && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : disabled
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFilePicker}
        >
          <div className="flex flex-col items-center justify-center py-4">
            <Upload
              className={`w-10 h-10 mb-3 ${
                isDragging ? 'text-blue-500' : disabled ? 'text-gray-300' : 'text-gray-400'
              }`}
            />
            <p className="mb-2 text-sm text-gray-600">
              <span className="font-semibold">
                {isDragging ? 'Drop file di sini' : 'Klik untuk upload'}
              </span>
              {!isDragging && !disabled && ' atau drag and drop'}
            </p>
            <p className="text-xs text-gray-500">
              {acceptImages && acceptVideos
                ? `Gambar atau Video hingga ${maxSizeMB}MB`
                : acceptImages
                ? `PNG, JPG, GIF hingga ${maxSizeMB}MB`
                : `Video hingga ${maxSizeMB}MB`}
              {multiple && ` (Max ${maxFiles} file)`}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptString()}
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* Preview Grid */}
      {showPreview && value.length > 0 && (
        <div className={`grid gap-4 ${
          multiple 
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
            : 'grid-cols-1'
        }`}>
          {value.map((mediaFile) => (
            <div
              key={mediaFile.id}
              className={`relative ${multiple ? getPreviewSizeClasses() : 'w-full h-64'} rounded-lg overflow-hidden border-2 border-gray-200 group`}
            >
              {/* Media Preview */}
              {mediaFile.type === 'image' ? (
                <Image
                  src={mediaFile.preview}
                  alt={mediaFile.file.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                  <Video className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 px-2 text-center truncate w-full">
                    {mediaFile.file.name}
                  </p>
                </div>
              )}

              {/* Remove Button */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(mediaFile.id)
                  }}
                  className="bg-white shadow-lg"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* File Info Overlay */}
              {multiple && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs truncate">{mediaFile.file.name}</p>
                  <p className="text-xs text-gray-300">
                    {(mediaFile.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File Count Info */}
      {multiple && value.length > 0 && (
        <p className="text-sm text-gray-600">
          {value.length} file{value.length !== 1 ? 's' : ''} dipilih
          {maxFiles && ` (Max ${maxFiles})`}
        </p>
      )}
    </div>
  )
}

export default MediaUploader
