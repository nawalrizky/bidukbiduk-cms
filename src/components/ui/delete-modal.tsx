'use client'

import React from 'react'
import { Button } from './button'
import { Trash2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  itemName: string
  itemType?: string
  isDeleting?: boolean
  customMessage?: string
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType = 'item',
  isDeleting = false,
  customMessage
}) => {
  if (!isOpen) return null

  const defaultTitle = `Delete ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`
  const defaultMessage = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
  
  return (
    <div 
      className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white shadow-xl rounded-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">
          {title || defaultTitle}
        </h3>
        <p className="text-gray-600 mb-6">
          {customMessage || defaultMessage}
        </p>
        <div className="flex space-x-4 justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook untuk menggunakan delete modal dengan state management
export const useDeleteModal = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState<{
    id: string | number
    name: string
  } | null>(null)

  const openModal = (id: string | number, name: string) => {
    setItemToDelete({ id, name })
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
    setItemToDelete(null)
  }

  return {
    isOpen,
    itemToDelete,
    openModal,
    closeModal
  }
}