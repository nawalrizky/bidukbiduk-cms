import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: "Total Konten",
    value: "156",
    description: "Artikel yang diterbitkan",
    icon: FileText,
    trend: "+12% dari bulan lalu"
  },
  {
    title: "Tayangan Halaman",
    value: "24,567",
    description: "Bulan ini",
    icon: BarChart3,
    trend: "+18% dari bulan lalu"
  },
  {
    title: "Pengguna Aktif",
    value: "1,234",
    description: "Pengguna aktif bulanan",
    icon: Users,
    trend: "+8% dari bulan lalu"
  },
  {
    title: "Tingkat Keterlibatan",
    value: "68%",
    description: "Keterlibatan rata-rata",
    icon: TrendingUp,
    trend: "+5% dari bulan lalu"
  }
]

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-gray-600">
            Ringkasan sistem manajemen konten Anda
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-gray-600">
                  {stat.description}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terkini</CardTitle>
              <CardDescription>
                Pembaruan konten dan aksi pengguna terbaru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Artikel baru diterbitkan: &ldquo;Tips Keselamatan Perahu&rdquo;</p>
                    <p className="text-xs text-gray-500">2 jam yang lalu</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Profil pengguna diperbarui</p>
                    <p className="text-xs text-gray-500">4 jam yang lalu</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Moderasi konten diperlukan</p>
                    <p className="text-xs text-gray-500">6 jam yang lalu</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
              <CardDescription>
                Tugas umum dan pintasan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Buat Artikel Baru</div>
                  <div className="text-sm text-gray-500">Mulai menulis postingan blog baru</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Kelola Pengguna</div>
                  <div className="text-sm text-gray-500">Lihat dan edit akun pengguna</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="font-medium">Lihat Analitik</div>
                  <div className="text-sm text-gray-500">Periksa metrik performa detail</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
