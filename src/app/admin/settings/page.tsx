import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, User, Shield, Globe, Bell, Database } from 'lucide-react'

const settingsCategories = [
  {
    title: "Pengaturan Umum",
    description: "Konfigurasi dasar situs dan preferensi",
    icon: Settings,
    items: [
      { label: "Nama Situs", value: "BidukBiduk CMS" },
      { label: "Deskripsi Situs", value: "Manajemen konten perahu tradisional" },
      { label: "Email Admin", value: "admin@bidukbiduk.com" },
      { label: "Zona Waktu", value: "UTC+7 (Jakarta)" }
    ]
  },
  {
    title: "Manajemen Pengguna",
    description: "Kelola peran dan izin pengguna",
    icon: User,
    items: [
      { label: "Peran Pengguna Default", value: "Kontributor" },
      { label: "Registrasi", value: "Persetujuan Admin Diperlukan" },
      { label: "Kebijakan Kata Sandi", value: "Kuat (8+ karakter, campuran huruf)" },
      { label: "Waktu Habis Sesi", value: "24 jam" }
    ]
  },
  {
    title: "Keamanan",
    description: "Pengaturan keamanan dan privasi",
    icon: Shield,
    items: [
      { label: "Autentikasi Dua Faktor", value: "Diaktifkan" },
      { label: "Percobaan Masuk", value: "Maksimal 5 percobaan" },
      { label: "Daftar Putih IP", value: "Dinonaktifkan" },
      { label: "Sertifikat SSL", value: "Aktif" }
    ]
  },
  {
    title: "Pengaturan Konten",
    description: "Penerbitan konten dan moderasi",
    icon: Globe,
    items: [
      { label: "Terbitkan Otomatis", value: "Dinonaktifkan" },
      { label: "Moderasi Konten", value: "Tinjauan Manual" },
      { label: "Optimasi SEO", value: "Diaktifkan" },
      { label: "Sistem Komentar", value: "Diaktifkan dengan Moderasi" }
    ]
  }
]

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
          <p className="text-gray-600">
            Konfigurasi pengaturan dan preferensi CMS Anda
          </p>
        </div>
        
        <div className="grid gap-6">
          {settingsCategories.map((category) => (
            <Card key={category.title}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {category.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm text-gray-600">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" size="sm">
                    Edit {category.title}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <CardTitle className="text-lg">Notifikasi</CardTitle>
                  <CardDescription>Kelola notifikasi email dan sistem</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notifikasi Email</p>
                    <p className="text-xs text-gray-500">Terima pembaruan melalui email</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Konfigurasi
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Notifikasi Push</p>
                    <p className="text-xs text-gray-500">Notifikasi push browser</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Konfigurasi
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Laporan Mingguan</p>
                    <p className="text-xs text-gray-500">Laporan analitik otomatis</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Konfigurasi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle className="text-lg">Manajemen Data</CardTitle>
                  <CardDescription>Opsi backup dan ekspor data</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Backup Otomatis</p>
                    <p className="text-xs text-gray-500">Harian pukul 2:00 AM UTC</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Backup Terakhir</p>
                    <p className="text-xs text-gray-500">Hari ini pukul 2:00 AM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Unduh
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Ekspor Data</p>
                    <p className="text-xs text-gray-500">Ekspor semua konten sebagai JSON/CSV</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ekspor
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Zona Berbahaya</CardTitle>
            <CardDescription>
              Tindakan yang tidak dapat dibatalkan dan merusak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="text-sm font-medium text-red-800">Reset Semua Pengaturan</p>
                  <p className="text-xs text-red-600">Kembalikan semua pengaturan ke nilai default</p>
                </div>
                <Button variant="destructive" size="sm">
                  Reset Pengaturan
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <p className="text-sm font-medium text-red-800">Hapus Semua Konten</p>
                  <p className="text-xs text-red-600">Hapus permanen semua artikel dan media</p>
                </div>
                <Button variant="destructive" size="sm">
                  Hapus Konten
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
