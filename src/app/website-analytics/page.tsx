'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, BarChart3 } from 'lucide-react';

export default function WebsiteAnalyticsPage() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Website Analytics</h1>
          <p className="text-gray-600 mt-2">
            Monitor your website traffic and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('https://umami-sigma-ashen.vercel.app/share/TAquwr3D0uOM0kWh/umami-test-chi.vercel.app', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Full Dashboard
          </Button>
        </div>
      </div>

      

      {/* Main Analytics Dashboard */}
      <Card className="min-h-[600px]">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Embedded Umami dashboard with real-time data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full h-[600px] relative">
            <iframe
              src="https://umami-sigma-ashen.vercel.app/share/TAquwr3D0uOM0kWh/umami-test-chi.vercel.app"
              className="w-full h-full border-0 rounded-b-lg"
              title="Umami Analytics Dashboard"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            <div className="absolute inset-0 pointer-events-none border border-gray-200 rounded-b-lg"></div>
          </div>
        </CardContent>
      </Card>

   
    </div>
  );
}
