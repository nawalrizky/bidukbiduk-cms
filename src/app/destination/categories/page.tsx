'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/contexts/NotificationContext';
import { getErrorMessage, getErrorTitle } from '@/lib/utils/errorUtils';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Save,
  X,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { 
  getDestinationCategories,
  createDestinationCategory,
  updateDestinationCategory,
  deleteDestinationCategory
} from '@/lib/api/destinations';
import { DestinationCategory, CreateDestinationCategory } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DestinationCategoriesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DestinationCategory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateDestinationCategory>({
    name: '',
    description: ''
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getDestinationCategories();
      setCategories(response.data || []);
    } catch (error: unknown) {
      console.error('Error loading categories:', error);
      addNotification({
        type: 'error',
        title: getErrorTitle(error),
        message: getErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleInputChange = (field: keyof CreateDestinationCategory, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setShowAddForm(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (editingCategory) {
        await updateDestinationCategory(editingCategory.id, formData);
        addNotification({
          type: 'success',
          title: 'Category updated',
          message: `Category "${formData.name}" has been updated successfully`
        });
      } else {
        await createDestinationCategory(formData);
        addNotification({
          type: 'success',
          title: 'Category created',
          message: `Category "${formData.name}" has been created successfully`
        });
      }
      
      await loadCategories();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving category:', error);
      addNotification({
        type: 'error',
        title: getErrorTitle(error),
        message: getErrorMessage(error)
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: DestinationCategory) => {
    setFormData({
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDestinationCategory(id);
      await loadCategories();
      setDeleteConfirm(null);
      addNotification({
        type: 'success',
        title: 'Category deleted',
        message: 'Category has been deleted successfully'
      });
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      addNotification({
        type: 'error',
        title: getErrorTitle(error),
        message: getErrorMessage(error)
      });
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    router.push("/destination");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Destination Categories</h1>
            <p className="text-gray-600 mt-2">Loading categories...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destination Categories</h1>
          <p className="text-gray-600 mt-2">
            Manage destination categories ({categories.length} total)
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </Button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center space-x-2"
                >
                  {formLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{formLoading ? 'Saving...' : 'Save Category'}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📂</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first destination category.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="relative">
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  Created: {new Date(category.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                  
                  {deleteConfirm === category.id ? (
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="flex items-center space-x-1"
                      >
                        <span>Confirm</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        <span>Cancel</span>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteConfirm(category.id)}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
