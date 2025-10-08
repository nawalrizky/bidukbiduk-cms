"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { getInstagramAnalytics } from '@/lib/api/instagram';
import { useNotifications } from '@/contexts/NotificationContext';

interface AnalyticsData {
  id: number;
  username: string;
  full_name: string;
  follower: number;
  following: number;
  media_count: number;
  total_like: number;
  total_comment: number;
  avg_engagement_rate: number;
  snapshot_date: string;
  created_at: string;
}

type ViewType = 'daily' | 'weekly' | 'monthly';

export default function SocmedAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<ViewType>('daily');
  const { addNotification } = useNotifications();

  const loadAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await getInstagramAnalytics();
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load analytics',
        message: 'Unable to load Instagram analytics data'
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Calculate metrics based on view type
  const calculateMetrics = () => {
    if (analyticsData.length === 0) return null;

    const sortedData = [...analyticsData].sort((a, b) => 
      new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime()
    );

    const latest = sortedData[0];
    
    let comparisonIndex = 1; // Default: compare with previous day
    if (viewType === 'weekly') {
      comparisonIndex = Math.min(7, sortedData.length - 1);
    } else if (viewType === 'monthly') {
      comparisonIndex = Math.min(30, sortedData.length - 1);
    }
    
    const previous = sortedData[comparisonIndex];
    
    const followerChange = latest.follower - previous.follower;
    const followerChangePercent = previous.follower > 0 
      ? ((followerChange / previous.follower) * 100).toFixed(2)
      : '0';

    // Find max follower change
    let maxChange = 0;
    let maxChangeDate = '';
    for (let i = 0; i < sortedData.length - 1; i++) {
      const change = sortedData[i].follower - sortedData[i + 1].follower;
      if (change > maxChange) {
        maxChange = change;
        maxChangeDate = sortedData[i].snapshot_date;
      }
    }

    // Calculate average daily change
    const totalDays = sortedData.length - 1;
    const totalChange = latest.follower - sortedData[sortedData.length - 1].follower;
    const avgChange = totalDays > 0 ? (totalChange / totalDays).toFixed(2) : '0';

    return {
      currentFollowers: latest.follower,
      followerChange,
      followerChangePercent: parseFloat(followerChangePercent),
      maxFollowerChange: maxChange,
      maxChangeDate,
      avgFollowerChange: parseFloat(avgChange),
      currentEngagement: latest.avg_engagement_rate,
      currentLikes: latest.total_like,
      currentComments: latest.total_comment,
      currentPosts: latest.media_count
    };
  };

  const metrics = calculateMetrics();

  // Prepare chart data
  const getChartData = () => {
    const sortedData = [...analyticsData].sort((a, b) => 
      new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );

    if (viewType === 'daily') {
      return sortedData.slice(-30); // Last 30 days
    } else if (viewType === 'weekly') {
      // Group by week
      const weekly: AnalyticsData[] = [];
      for (let i = 0; i < sortedData.length; i += 7) {
        const weekData = sortedData.slice(i, i + 7);
        if (weekData.length > 0) {
          weekly.push(weekData[weekData.length - 1]);
        }
      }
      return weekly;
    } else {
      // Monthly - take one data point per month
      const monthly: AnalyticsData[] = [];
      let currentMonth = '';
      sortedData.forEach(data => {
        const month = data.snapshot_date.substring(0, 7);
        if (month !== currentMonth) {
          monthly.push(data);
          currentMonth = month;
        }
      });
      return monthly;
    }
  };

  const chartData = getChartData();

  // Calculate gained/lost data
  const getGainedLostData = () => {
    const sortedData = [...analyticsData].sort((a, b) => 
      new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    );

    const result = [];
    for (let i = 1; i < sortedData.length; i++) {
      const change = sortedData[i].follower - sortedData[i - 1].follower;
      result.push({
        date: sortedData[i].snapshot_date,
        gained: change > 0 ? change : 0,
        lost: change < 0 ? Math.abs(change) : 0
      });
    }
    return result.slice(-30);
  };

  const gainedLostData = getGainedLostData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  const maxFollowers = Math.max(...chartData.map(d => d.follower));
  const minFollowers = Math.min(...chartData.map(d => d.follower));
  const maxGained = Math.max(...gainedLostData.map(d => Math.max(d.gained, d.lost)));
  const maxEngagement = Math.max(...chartData.map(d => d.avg_engagement_rate));
  const minEngagement = Math.min(...chartData.map(d => d.avg_engagement_rate));

  // Helper function to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Analytics</h1>
          <p className="text-gray-600">Track and analyze your Instagram performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="px-3">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Type Selector */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">View by:</span>
        </div>
        <div className="flex border rounded-md">
          <button
            onClick={() => setViewType('daily')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewType === 'daily'
                ? 'bg-blue-50 text-blue-600 rounded-l-md'
                : 'text-gray-600 hover:bg-gray-50 hover:rounded-l-md'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewType('weekly')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-x ${
              viewType === 'weekly'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewType('monthly')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewType === 'monthly'
                ? 'bg-blue-50 text-blue-600 rounded-r-md'
                : 'text-gray-600 hover:bg-gray-50 hover:rounded-r-md'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Audience Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Audience</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Followers Card */}
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Followers</div>
            <div className="text-3xl font-bold mb-2">
              {metrics.currentFollowers.toLocaleString()}
            </div>
          </Card>

          {/* Follower Change Card */}
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Follower Change</div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className={`text-3xl font-bold ${
                metrics.followerChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.followerChange >= 0 ? '+' : ''}{metrics.followerChange.toLocaleString()}
              </span>
              <span className={`flex items-center text-sm font-medium ${
                metrics.followerChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {metrics.followerChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metrics.followerChangePercent)}%
              </span>
            </div>
          </Card>

          {/* Max Follower Change Card */}
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Max. Follower Change</div>
            <div className="text-3xl font-bold mb-1">
              {metrics.maxFollowerChange.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(metrics.maxChangeDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </Card>

          {/* Avg Follower Change Card */}
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">Avg. Follower Change</div>
            <div className="text-3xl font-bold">
              {metrics.avgFollowerChange >= 0 ? '+' : ''}{metrics.avgFollowerChange}
            </div>
          </Card>
        </div>
         {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Posts</h3>
          <div className="text-2xl font-bold">{metrics.currentPosts}</div>
          <p className="text-sm text-gray-500 mt-1">Total media posts</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Total Engagement</h3>
          <div className="text-2xl font-bold">
            {(metrics.currentLikes + metrics.currentComments).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {metrics.currentLikes.toLocaleString()} likes, {metrics.currentComments.toLocaleString()} comments
          </p>
        </Card>
      </div>

        {/* Followers Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Followers Growth</h3>
            
          </div>
          
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 900 220" preserveAspectRatio="none">
              {/* Y-axis labels */}
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const value = maxFollowers - (i * (maxFollowers - minFollowers) / 5);
                return (
                  <text 
                    key={i} 
                    x="5" 
                    y={i * 40 + 15} 
                    className="text-xs fill-gray-500"
                    fontSize="12"
                  >
                    {formatNumber(Math.round(value))}
                  </text>
                );
              })}
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={i}
                  x1="60"
                  y1={i * 40 + 10}
                  x2="890"
                  y2={i * 40 + 10}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              ))}
              
              {/* Line path */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={chartData.map((d, i) => {
                  const x = 60 + (i * (830 / Math.max(1, chartData.length - 1)));
                  const y = 210 - ((d.follower - minFollowers) / Math.max(1, maxFollowers - minFollowers)) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Data points */}
              {chartData.map((d, i) => {
                const x = 60 + (i * (830 / Math.max(1, chartData.length - 1)));
                const y = 210 - ((d.follower - minFollowers) / Math.max(1, maxFollowers - minFollowers)) * 180;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#3b82f6"
                    className="hover:r-5 cursor-pointer"
                  >
                    <title>{`${d.snapshot_date}: ${d.follower.toLocaleString()} followers`}</title>
                  </circle>
                );
              })}
            </svg>
            
            <div className="flex justify-between px-12 text-xs text-gray-500">
              {chartData.filter((_, i) => i % Math.ceil(chartData.length / 8) === 0).map((d, i) => (
                <span key={i}>
                  {new Date(d.snapshot_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Gained and Lost Followers Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Gained and Lost Followers</h3>
     
        </div>
        
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 900 270" preserveAspectRatio="none">
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const value = maxGained - (i * maxGained / 3);
              return (
                <text 
                  key={i} 
                  x="5" 
                  y={i * 40 + 15} 
                  className="text-xs fill-gray-500"
                  fontSize="12"
                >
                  {i === 3 ? '0' : (i < 3 ? '+' : '-')}{formatNumber(Math.abs(Math.round(value)))}
                </text>
              );
            })}
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={i}
                x1="60"
                y1={i * 40 + 10}
                x2="890"
                y2={i * 40 + 10}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Zero line */}
            <line
              x1="60"
              y1="130"
              x2="890"
              y2="130"
              stroke="#666"
              strokeWidth="1"
            />
            
            {/* Bars */}
            {gainedLostData.map((d, i) => {
              const x = 60 + (i * (830 / gainedLostData.length));
              const barWidth = Math.max(8, 830 / gainedLostData.length - 2);
              const gainedHeight = (d.gained / Math.max(1, maxGained)) * 110;
              const lostHeight = (d.lost / Math.max(1, maxGained)) * 110;
              
              return (
                <g key={i}>
                  {/* Gained (blue bar) */}
                  <rect
                    x={x}
                    y={130 - gainedHeight}
                    width={barWidth}
                    height={gainedHeight}
                    fill="#3b82f6"
                    className="hover:opacity-80 cursor-pointer"
                  >
                    <title>{`${d.date}: +${d.gained} followers`}</title>
                  </rect>
                  {/* Lost (red bar) */}
                  <rect
                    x={x}
                    y={130}
                    width={barWidth}
                    height={lostHeight}
                    fill="#ef4444"
                    className="hover:opacity-80 cursor-pointer"
                  >
                    <title>{`${d.date}: -${d.lost} followers`}</title>
                  </rect>
                </g>
              );
            })}
          </svg>
          
          <div className="flex justify-between px-12 text-xs text-gray-500">
            {gainedLostData.filter((_, i) => i % Math.ceil(gainedLostData.length / 8) === 0).map((d, i) => (
              <span key={i}>
                {new Date(d.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            ))}
          </div>
        </div>
      </Card>

     

      {/* Engagement Rate Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Average Engagement Rate</h3>
   
        </div>
        
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 900 220" preserveAspectRatio="none">
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const value = maxEngagement - (i * (maxEngagement - minEngagement) / 5);
              return (
                <text 
                  key={i} 
                  x="5" 
                  y={i * 40 + 15} 
                  className="text-xs fill-gray-500"
                  fontSize="12"
                >
                  {value.toFixed(1)}%
                </text>
              );
            })}
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1="60"
                y1={i * 40 + 10}
                x2="890"
                y2={i * 40 + 10}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Area under line */}
            <polygon
              fill="url(#engagementGradient)"
              opacity="0.3"
              points={`60,210 ${chartData.map((d, i) => {
                const x = 60 + (i * (830 / Math.max(1, chartData.length - 1)));
                const y = 210 - ((d.avg_engagement_rate - minEngagement) / Math.max(1, maxEngagement - minEngagement)) * 180;
                return `${x},${y}`;
              }).join(' ')} ${60 + ((chartData.length - 1) * (830 / Math.max(1, chartData.length - 1)))},210`}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="engagementGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            
            {/* Line path */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              points={chartData.map((d, i) => {
                const x = 60 + (i * (830 / Math.max(1, chartData.length - 1)));
                const y = 210 - ((d.avg_engagement_rate - minEngagement) / Math.max(1, maxEngagement - minEngagement)) * 180;
                return `${x},${y}`;
              }).join(' ')}
            />
            
            {/* Data points */}
            {chartData.map((d, i) => {
              const x = 60 + (i * (830 / Math.max(1, chartData.length - 1)));
              const y = 210 - ((d.avg_engagement_rate - minEngagement) / Math.max(1, maxEngagement - minEngagement)) * 180;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#10b981"
                  className="hover:r-5 cursor-pointer"
                >
                  <title>{`${d.snapshot_date}: ${d.avg_engagement_rate.toFixed(2)}% engagement`}</title>
                </circle>
              );
            })}
          </svg>
          
          <div className="flex justify-between  px-12 text-xs text-gray-500">
            {chartData.filter((_, i) => i % Math.ceil(chartData.length / 8) === 0).map((d, i) => (
              <span key={i}>
                {new Date(d.snapshot_date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
