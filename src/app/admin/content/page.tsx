import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

const mockContent = [
  {
    id: 1,
    title: "Introduction to Traditional Boats",
    type: "Article",
    status: "Published",
    author: "John Doe",
    date: "2024-03-15",
    views: 1250
  },
  {
    id: 2,
    title: "Boat Maintenance Guide",
    type: "Guide",
    status: "Draft",
    author: "Jane Smith",
    date: "2024-03-14",
    views: 0
  },
  {
    id: 3,
    title: "Fishing Techniques",
    type: "Tutorial",
    status: "Published",
    author: "Mike Johnson",
    date: "2024-03-13",
    views: 890
  }
]

export default function ContentPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
            <p className="text-gray-600">
              Manage your articles, guides, and tutorials
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Content
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Content Library</CardTitle>
            <CardDescription>
              All your published and draft content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockContent.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span className="bg-gray-100 px-2 py-1 rounded">{item.type}</span>
                      <span className={`px-2 py-1 rounded ${
                        item.status === 'Published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                      <span>By {item.author}</span>
                      <span>{item.date}</span>
                      <span>{item.views} views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Articles</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Published</span>
                  <span className="font-semibold">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Drafts</span>
                  <span className="font-semibold">14</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Articles</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Guides</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tutorials</span>
                  <span className="font-semibold">22</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Article published</div>
                  <div className="text-gray-500">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Draft saved</div>
                  <div className="text-gray-500">4 hours ago</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Content updated</div>
                  <div className="text-gray-500">1 day ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
