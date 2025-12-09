import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'

const mockContent = [
  {
    id: 1,
    title: "Pengenalan Perahu Tradisional",
    type: "Artikel",
    status: "Diterbitkan",
    author: "John Doe",
    date: "2024-03-15",
    views: 1250
  },
  {
    id: 2,
    title: "Panduan Perawatan Perahu",
    type: "Panduan",
    status: "Draf",
    author: "Jane Smith",
    date: "2024-03-14",
    views: 0
  },
  {
    id: 3,
    title: "Teknik Memancing",
    type: "Tutorial",
    status: "Diterbitkan",
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
            <h2 className="text-3xl font-bold tracking-tight">Manajemen Konten</h2>
            <p className="text-gray-600">
              Kelola artikel, panduan, dan tutorial Anda
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Konten Baru
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Perpustakaan Konten</CardTitle>
            <CardDescription>
              Semua konten yang diterbitkan dan draf Anda
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
                        item.status === 'Diterbitkan' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                      <span>Oleh {item.author}</span>
                      <span>{item.date}</span>
                      <span>{item.views} tayangan</span>
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
              <CardTitle className="text-lg">Statistik Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Artikel</span>
                  <span className="font-semibold">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Diterbitkan</span>
                  <span className="font-semibold">142</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Draf</span>
                  <span className="font-semibold">14</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jenis Konten</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Artikel</span>
                  <span className="font-semibold">89</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Panduan</span>
                  <span className="font-semibold">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tutorial</span>
                  <span className="font-semibold">22</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Aktivitas Terkini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Artikel diterbitkan</div>
                  <div className="text-gray-500">2 jam yang lalu</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Draf disimpan</div>
                  <div className="text-gray-500">4 jam yang lalu</div>
                </div>
                <div className="text-sm">
                  <div className="font-medium">Konten diperbarui</div>
                  <div className="text-gray-500">1 hari yang lalu</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
