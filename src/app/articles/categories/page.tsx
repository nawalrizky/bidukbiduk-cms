'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Tag, Save } from 'lucide-react'
import { 
  getArticleCategories, 
  createArticleCategory, 
  updateArticleCategory, 
  deleteArticleCategory 
} from '@/lib/api/articles'
import { ArticleCategory } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function ArticleCategoriesPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const deleteModal = useDeleteModal()
  
  const [categories, setCategories] = useState<ArticleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getArticleCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
      addNotification({
        type: 'error',
        title: 'Failed to load categories',
        message: 'Unable to load article categories.'
      })
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  const resetForm = () => {
    setFormData({ name: '', description: '' })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleEdit = (category: ArticleCategory) => {
    setFormData({
      name: category.name,
      description: category.description || ''
    })
    setEditingId(category.id)
    setShowAddForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Category name is required'
      })
      return
    }

    try {
      setSubmitting(true)
      
      if (editingId) {
        // Update existing category
        await updateArticleCategory(editingId, {
          name: formData.name,
          description: formData.description || undefined
        })
        
        addNotification({
          type: 'success',
          title: 'Category Updated',
          message: 'Category has been updated successfully'
        })
      } else {
        // Create new category
        await createArticleCategory({
          name: formData.name,
          description: formData.description || undefined
        })
        
        addNotification({
          type: 'success',
          title: 'Category Created',
          message: 'Category has been created successfully'
        })
      }
      
      resetForm()
      await loadCategories()
    } catch (error: unknown) {
      console.error('Error saving category:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: `Failed to ${editingId ? 'update' : 'create'} category`,
        message: errorMessage
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (categoryId: number, categoryName: string) => {
    deleteModal.openModal(categoryId, categoryName)
  }

  const confirmDelete = async () => {
    if (!deleteModal.itemToDelete) return

    try {
      setDeleteLoading(Number(deleteModal.itemToDelete.id))
      await deleteArticleCategory(Number(deleteModal.itemToDelete.id))
      
      addNotification({
        type: 'success',
        title: 'Category Deleted',
        message: `Category "${deleteModal.itemToDelete.name}" has been deleted successfully`
      })
      
      deleteModal.closeModal()
      await loadCategories()
    } catch (error: unknown) {
      console.error('Error deleting category:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to delete category',
        message: errorMessage
      })
    } finally {
      setDeleteLoading(null)
      deleteModal.closeModal()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Article Categories</h1>
          <p className="text-gray-600">Manage article categories</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push('/articles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          {!showAddForm && !editingId && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddForm || editingId !== null}
        onClose={resetForm}
        title={editingId ? 'Edit Category' : 'Add New Category'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              disabled={submitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter category description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              disabled={submitting}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Categories List */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">All Categories ({categories.length})</h2>
          
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Tag className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    editingId === category.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 ml-6">{category.description}</p>
                    )}
                    {category.created_at && (
                      <p className="text-xs text-gray-400 ml-6 mt-1">
                        Created: {new Date(category.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      disabled={submitting || editingId === category.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={deleteLoading === category.id || submitting}
                    >
                      {deleteLoading === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.itemToDelete?.name || ''}
        itemType="Category"
        isDeleting={deleteLoading !== null}
      />
    </div>
  )
}
