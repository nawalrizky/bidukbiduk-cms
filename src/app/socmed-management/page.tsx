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
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isVideoPreview, setIsVideoPreview] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<InstagramPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [imageFallbacks, setImageFallbacks] = useState<{ [key: number]: string }>({});
  
  const [formData, setFormData] = useState({
    post_type: 'photo',
    caption: '',
    media: null as File | null,
    scheduled_at: '',
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
        const response = await getInstagramPosts({ page: currentPage });
        console.log('Loaded posts:', response.results);
        setPosts(response.results || []);
        setTotalCount(response.count);
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
  }, [isAuthenticated, currentPage, addNotification]);

  const loadPosts = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await getInstagramPosts({ page: currentPage });
      setPosts(response.results || []);
      setTotalCount(response.count);
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

  const handleLogout = async () => {
    await logout();
    router.push('/instagram-login');
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));

      // Revoke previous object URL if any
      if (mediaPreview && mediaPreview.startsWith('blob:')) {
        URL.revokeObjectURL(mediaPreview);
      }

      const objectUrl = URL.createObjectURL(file);
      setMediaPreview(objectUrl);
      setIsVideoPreview(file.type.startsWith('video/'));
    }
  };

  const resetForm = () => {
    setFormData({
      post_type: 'photo',
      caption: '',
      media: null,
      scheduled_at: '',
    });
    setMediaPreview(null);
    setIsVideoPreview(false);
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
    });
    
    // Extract media URL from array or string
    let mediaUrl = null;
    if (Array.isArray(post.media) && post.media.length > 0) {
      mediaUrl = post.media[0].url;
    } else if (typeof post.media === 'string' && post.media.trim() !== '') {
      mediaUrl = post.media;
    }
    
    // Build full URL if it's a relative path
    if (mediaUrl && !mediaUrl.startsWith('http')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'https://backend.bidukbiduk.com';
      // Encode the filename part to handle spaces and special characters
      const urlParts = mediaUrl.split('/');
      const filename = urlParts.pop();
      const encodedFilename = encodeURIComponent(filename || '');
      const path = urlParts.join('/');
      mediaUrl = `${baseUrl}${path}/${encodedFilename}`;
    }
    
    setMediaPreview(mediaUrl);
    setIsVideoPreview(post.post_type === 'video' || post.post_type === 'reel');
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

    if (!session.id) {
      console.error('Session exists but session.id is undefined:', session);
      addNotification({
        type: 'error',
        title: 'Invalid Session',
        message: 'Instagram session is invalid. Please reconnect.',
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

    if (!formData.scheduled_at) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Scheduled date and time is required',
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
          scheduled_at: formData.scheduled_at,
          status: 'scheduled',
          session: session.id,
        });

        addNotification({
          type: 'success',
          title: 'Post Updated',
          message: 'Instagram post has been updated successfully',
        });
      } else {
        // Create new post
        const postData = {
          post_type: formData.post_type,
          caption: formData.caption,
          media: formData.media!,
          scheduled_at: formData.scheduled_at,
          status: 'scheduled',
          session: session.id,
        };
        
        console.log('Creating post with data:', {
          ...postData,
          media: postData.media ? `File: ${postData.media.name}` : 'No media',
          session: postData.session,
        });

        await createInstagramPost(postData);

        addNotification({
          type: 'success',
          title: 'Post Created',
          message: 'Instagram post has been scheduled successfully',
        });
      }

      resetForm();
      setViewMode('list');
      loadPosts();
    } catch (error: unknown) {
      console.error('Error saving post:', error);
      
      const axiosError = error as { response?: { data?: unknown } };
      console.error('Error response:', axiosError.response?.data);
      
      let errorMessage = 'An error occurred';
      
      if (axiosError.response?.data) {
        const data = axiosError.response.data as Record<string, unknown>;
        // Handle different error formats
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          errorMessage = String(data.detail);
        } else if (data.message) {
          errorMessage = String(data.message);
        } else if (data.error) {
          errorMessage = String(data.error);
        } else {
          // If it's an object with field errors
          const errors = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join('; ');
          errorMessage = errors || JSON.stringify(data);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      addNotification({
        type: 'error',
        title: 'Failed to save post',
        message: errorMessage,
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
            <p className="text-gray-600">
              Create, schedule, and manage your Instagram posts
              {totalCount > 0 && (
                <span className="ml-2 text-sm font-medium text-blue-600">
                  • {totalCount} total posts
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {session && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">@{session.instagram_username}</p>
                  <p className="text-xs text-gray-500">{session.name || 'Instagram Account'}</p>
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
            {posts.map((post) => {
              // Extract media URL from array
              const mediaUrl = Array.isArray(post.media) && post.media.length > 0 
                ? post.media[0].url 
                : typeof post.media === 'string' 
                ? post.media 
                : null;
              
              // Build full URL if it's a relative path
              const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'https://backend.bidukbiduk.com';
              let fullMediaUrl = null;
              if (mediaUrl && !mediaUrl.startsWith('http')) {
                // Simply concatenate base URL with media path
                // Backend already sanitizes filenames (removes spaces, etc.)
                fullMediaUrl = `${baseUrl}${mediaUrl}`;
              } else {
                fullMediaUrl = mediaUrl;
              }

              // Use our media URL as primary source
              // Only fallback to Instagram thumbnail if our media is not available
              const imageUrl = fullMediaUrl;

              return (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-64 bg-gray-100">
                    {imageUrl && !imageFallbacks[post.id] ? (
                      <Image
                        src={imageUrl}
                        alt={post.caption || 'Instagram post'}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={() => {
                          // Mark this image as failed and show placeholder
                          setImageFallbacks(prev => ({ ...prev, [post.id]: 'failed' }));
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full flex-col">
                        <ImageIcon className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Image not available</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {post.status === 'scheduled' ? 'Scheduled post' : 'Posted'}
                        </p>
                      </div>
                    )}
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
            );
            })}
          </div>
        )}

        {/* Pagination - Simple version for now */}
        {totalCount > 0 && (
          <div className="flex items-center justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={posts.length === 0}
            >
              Next
            </Button>
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
              <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                disabled={submitting}
                required
                className="mt-1"
              />
            </div>
          </div>

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
                  <div className="relative h-64 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {isVideoPreview ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <Image
                        src={mediaPreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          console.error('Preview image load error:', {
                            src: mediaPreview,
                            error: e
                          });
                        }}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setMediaPreview(null);
                      setIsVideoPreview(false);
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
