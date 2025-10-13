"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  Calendar,
  Image as ImageIcon,
  Loader2,
  Plus,
  Edit,
  Trash2,
  LogOut
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useInstagramAuth } from '@/contexts/InstagramAuthContext';
import {
  getInstagramPosts,
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
  InstagramPost
} from '@/lib/api/instagram';
import { DeleteModal } from '@/components/ui/delete-modal';

type ViewMode = 'list' | 'create' | 'edit';

export default function SocmedManagementPage() {
  const router = useRouter();
  const { session, isAuthenticated, logout, loading: authLoading } = useInstagramAuth();
  const { addNotification } = useNotifications();
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<InstagramPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    post_type: 'photo',
    caption: '',
    media: null as File | null,
    scheduled_at: '',
    status: 'scheduled',
    extras: '',
  });

  // Redirect to Instagram login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/instagram-login?returnUrl=/socmed-management');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load posts
  useEffect(() => {
    const loadPostsData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const response = await getInstagramPosts();
        setPosts(response.data || []);
      } catch (error) {
        console.error('Error loading posts:', error);
        addNotification({
          type: 'error',
          title: 'Failed to load posts',
          message: 'Unable to load Instagram posts',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPostsData();
  }, [isAuthenticated, addNotification]);

  const loadPosts = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await getInstagramPosts();
      setPosts(response.data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load posts',
        message: 'Unable to load Instagram posts',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/instagram-login');
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      post_type: 'photo',
      caption: '',
      media: null,
      scheduled_at: '',
      status: 'scheduled',
      extras: '',
    });
    setMediaPreview(null);
    setEditingPost(null);
  };

  const handleCreate = () => {
    resetForm();
    setViewMode('create');
  };

  const handleEdit = (post: InstagramPost) => {
    setEditingPost(post);
    setFormData({
      post_type: post.post_type,
      caption: post.caption,
      media: null,
      scheduled_at: post.scheduled_at || '',
      status: post.status,
      extras: post.extras || '',
    });
    setMediaPreview(post.media_url);
    setViewMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      addNotification({
        type: 'error',
        title: 'Not Authenticated',
        message: 'Please login to Instagram first',
      });
      return;
    }

    if (!formData.caption.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Caption is required',
      });
      return;
    }

    if (!editingPost && !formData.media) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Media file is required',
      });
      return;
    }

    if (formData.status === 'scheduled' && !formData.scheduled_at) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Scheduled date/time is required for scheduled posts',
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingPost) {
        // Update existing post
        await updateInstagramPost(editingPost.id, {
          post_type: formData.post_type,
          caption: formData.caption,
          media: formData.media || undefined,
          scheduled_at: formData.scheduled_at || undefined,
          status: formData.status,
          extras: formData.extras || undefined,
          session: session.id,
        });

        addNotification({
          type: 'success',
          title: 'Post Updated',
          message: 'Instagram post has been updated successfully',
        });
      } else {
        // Create new post
        await createInstagramPost({
          post_type: formData.post_type,
          caption: formData.caption,
          media: formData.media!,
          scheduled_at: formData.scheduled_at || undefined,
          status: formData.status,
          extras: formData.extras || undefined,
          session: session.id,
        });

        addNotification({
          type: 'success',
          title: 'Post Created',
          message: `Instagram post has been ${formData.status === 'scheduled' ? 'scheduled' : 'created'} successfully`,
        });
      }

      resetForm();
      setViewMode('list');
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      addNotification({
        type: 'error',
        title: 'Failed to save post',
        message: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (post: InstagramPost) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      setDeleting(true);
      await deleteInstagramPost(postToDelete.id);
      addNotification({
        type: 'success',
        title: 'Post Deleted',
        message: 'Instagram post has been deleted successfully',
      });
      setDeleteModalOpen(false);
      setPostToDelete(null);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      addNotification({
        type: 'error',
        title: 'Failed to delete post',
        message: 'Unable to delete the Instagram post',
      });
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'published':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Published</span>;
      case 'scheduled':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Scheduled</span>;
      case 'draft':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Draft</span>;
      default:
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // List view
  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instagram Management</h1>
            <p className="text-gray-600">Create, schedule, and manage your Instagram posts</p>
          </div>
          <div className="flex items-center space-x-3">
            {session && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">@{session.username}</p>
                  <p className="text-xs text-gray-500">{session.full_name || 'Instagram Account'}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            )}
            <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading posts...</p>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">Create your first Instagram post to get started</p>
            <Button onClick={handleCreate} className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={post.media_url}
                    alt={post.caption}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(post.status)}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {post.caption}
                  </p>
                  {post.scheduled_at && (
                    <div className="flex items-center text-xs text-gray-500 mb-3">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(post.scheduled_at).toLocaleString()}
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(post)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(post)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        <DeleteModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          title="Delete Instagram Post"
          itemName={postToDelete?.caption.substring(0, 50) + '...' || ''}
          itemType="post"
          isDeleting={deleting}
        />
      </div>
    );
  }

  // Create/Edit Form
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600">
            {editingPost ? 'Update your Instagram post' : 'Create and schedule a new Instagram post'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            resetForm();
            setViewMode('list');
          }}
        >
          Cancel
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="post_type">Post Type</Label>
              <select
                id="post_type"
                value={formData.post_type}
                onChange={(e) => handleInputChange('post_type', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="reel">Reel</option>
                <option value="story">Story</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitting}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {formData.status === 'scheduled' && (
            <div>
              <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                disabled={submitting}
                required={formData.status === 'scheduled'}
              />
            </div>
          )}

          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={formData.caption}
              onChange={(e) => handleInputChange('caption', e.target.value)}
              placeholder="Write your caption here..."
              rows={5}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="media">Media</Label>
            <div className="mt-1">
              {mediaPreview ? (
                <div className="relative">
                  <div className="relative h-64 bg-gray-100 rounded-md overflow-hidden">
                    <Image
                      src={mediaPreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setMediaPreview(null);
                      setFormData(prev => ({ ...prev, media: null }));
                    }}
                    disabled={submitting}
                  >
                    Change Media
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    id="media"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                    className="hidden"
                    disabled={submitting}
                  />
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, MP4 up to 100MB
                    </p>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="extras">Additional Notes (Optional)</Label>
            <Textarea
              id="extras"
              value={formData.extras}
              onChange={(e) => handleInputChange('extras', e.target.value)}
              placeholder="Add any additional notes or metadata..."
              rows={3}
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setViewMode('list');
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingPost ? 'Update Post' : 'Create Post'}
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Instagram Post"
        itemName={postToDelete?.caption.substring(0, 50) + '...' || ''}
        itemType="post"
        isDeleting={deleting}
      />
    </div>
  );
}
