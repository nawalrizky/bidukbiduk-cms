'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DeleteModal, useDeleteModal } from '@/components/ui/delete-modal'
import { ArrowLeft, Edit, Trash2, Calendar, User, Tag, FileText } from 'lucide-react'
import { getArticle, deleteArticle } from '@/lib/api/articles'
import { Article } from '@/lib/types'
import { useNotifications } from '@/contexts/NotificationContext'

export default function ArticleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  const deleteModal = useDeleteModal()
  const { addNotification } = useNotifications()

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true)
        const articleId = Number(params.id)
        const data = await getArticle(articleId)
        setArticle(data)
      } catch (error) {
        console.error('Error loading article:', error)
        addNotification({
          type: 'error',
          title: 'Failed to load article',
          message: 'Unable to load article details. Please try again.'
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadArticle()
    }
  }, [params.id, addNotification])

  const handleDelete = () => {
    if (article) {
      deleteModal.openModal(article.id, article.title)
    }
  }

  const confirmDelete = async () => {
    if (!article) return

    try {
      setDeleteLoading(true)
      await deleteArticle(article.id)
      
      addNotification({
        type: 'success',
        title: 'Article deleted',
        message: `Article "${article.title}" has been deleted successfully`
      })
      
      deleteModal.closeModal()
      router.push('/articles')
    } catch (error: unknown) {
      console.error('Error deleting article:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      addNotification({
        type: 'error',
        title: 'Failed to delete article',
        message: errorMessage
      })
    } finally {
      setDeleteLoading(false)
      deleteModal.closeModal()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <FileText className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Artikel tidak ditemukan</h3>
        <p className="text-gray-600 mb-4">Artikel yang Anda cari tidak ditemukan.</p>
        <Button onClick={() => router.push('/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Artikel
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.push('/articles')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Artikel
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/articles/edit-article/${article.id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Sunting
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Article Content */}
      <Card className="p-8">
        {/* Status Badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article.status)}`}>
            {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6 pb-6 border-b">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{article.author_name || 'Unknown Author'}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(article.publish_date || article.created_at)}</span>
          </div>
          {article.category_name && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span>{article.category_name}</span>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={article.featured_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags_list && article.tags_list.length > 0 && (
          <div className="pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Tag:</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags_list.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Meta */}
        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Dibuat: {formatDate(article.created_at)}</span>
            <span>Terakhir diperbarui: {formatDate(article.updated_at)}</span>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        onConfirm={confirmDelete}
        itemName={article.title}
        title="Hapus Artikel"
        customMessage={`Apakah Anda yakin ingin menghapus "${article.title}"? Tindakan ini tidak dapat dibatalkan.`}
        isDeleting={deleteLoading}
      />
    </div>
  )
}
