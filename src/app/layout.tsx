import type { Metadata } from "next";
import "./globals.css";
import { AdminLayout } from '@/components/layout/AdminLayout'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: "CMS Dashboard",
  description: "Content Management System for BidukBiduk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AdminLayout>
            {children}
          </AdminLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
