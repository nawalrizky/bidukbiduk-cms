'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { Plus, Search, FileText, Edit, Trash2, Loader2, Calendar, User, Tag } from 'lucide-react'
import { getArticles, deleteArticle } from '@/lib/api/articles'
import { Article } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'
import { useRouter } from 'next/navigation'

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)
  
  const deleteModal = useDeleteModal()
  const { addNotification } = useNotifications()
  const router = useRouter()

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getArticles()
      
      const articlesList = Array.isArray(response.results) ? response.results : []
      setArticles(articlesList)
    } catch (error) {
      console.error('Error loading articles:', error)
      addNotification({
        type: 'error',
        title: 'Failed to load articles',
        message: 'Unable to load articles. Please try again.'
      })
      setArticles([])
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const handleDelete = async (articleId: number, articleTitle: string) => {
    deleteModal.openModal(articleId, articleTitle)
  }

  const confirmDelete = async () => {
    if (!deleteModal.itemToDelete) return

    try {
      setDeleteLoading(Number(deleteModal.itemToDelete.id))
      await deleteArticle(Number(deleteModal.itemToDelete.id))
      
      addNotification({
        type: 'success',
        title: 'Article deleted',
        message: `Article "${deleteModal.itemToDelete.name}" has been deleted successfully`
      })
      
      deleteModal.closeModal()
      await loadArticles()
    } catch (error: unknown) {
      console.error('Error deleting article:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to delete article',
        message: errorMessage
      })
    } finally {
      setDeleteLoading(null)
      deleteModal.closeModal()
    }
  }

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || article.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News & Articles</h1>
            <p className="text-gray-600">Manage news articles and blog posts</p>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">News & Articles</h1>
          <p className="text-gray-600">Manage news articles and blog posts</p>
        </div>
        <Button onClick={() => router.push('/articles/add-article')}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Article
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Articles List */}
      {filteredArticles.length === 0 ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter ? 'No articles found' : 'No articles yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by creating your first article.'}
            </p>
            {!searchTerm && !statusFilter && (
              <Button onClick={() => router.push('/articles/add-article')}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Article
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              {/* Article Image */}
              <Link href={`/articles/${article.id}`}>
                <div className="aspect-video bg-gray-200 relative cursor-pointer">
                  {article.featured_image_url ? (
                    <Image
                      src={article.featured_image_url}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                  </div>
                </div>
              </Link>
              
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1 space-y-3">
                  {/* Article Title */}
                  <div>
                    <Link href={`/articles/${article.id}`}>
                      <h3 className="font-semibold text-lg cursor-pointer hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                  </div>

                  {/* Article Meta */}
                  <div className="space-y-2">
                    {/* Category */}
                    {article.category_name && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Tag className="h-4 w-4 mr-1" />
                        <span>{article.category_name}</span>
                      </div>
                    )}
                    
                    {/* Author and Date */}
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-3">{article.author_name || 'Unknown'}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(article.publish_date || article.created_at)}</span>
                    </div>

                    {/* Tags */}
                    {article.tags_list && article.tags_list.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {article.tags_list.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {article.tags_list.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            +{article.tags_list.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.content.replace(/<[^>]*>/g, '')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/articles/edit-article/${article.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={deleteLoading === article.id}
                  >
                    {deleteLoading === article.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={deleteModal.itemToDelete?.name || ''}
        itemType="Article"
        isDeleting={deleteLoading !== null}
      />
    </div>
  )
}
