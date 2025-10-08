"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  Calendar,
  Download,
  ChevronDown
} from 'lucide-react';

// Mock data - in a real app, this would come from an API
const MOCK_DATA = {
  currentFollowers: 711217,
  followerChange: 27607,
  followerChangePercent: 3.89,
  maxFollowerChange: 3507,
  maxChangeDate: 'Oct 18, 2021',
  avgFollowerChange: 8.87,
  
  followerHistory: [
    { date: '1 OCT', followers: 683610 },
    { date: '3 OCT', followers: 685200 },
    { date: '5 OCT', followers: 687500 },
    { date: '7 OCT', followers: 689691 },
    { date: '9 OCT', followers: 692800 },
    { date: '11 OCT', followers: 695200 },
    { date: '13 OCT', followers: 697500 },
    { date: '15 OCT', followers: 699800 },
    { date: '17 OCT', followers: 702300 },
    { date: '19 OCT', followers: 705800 },
    { date: '21 OCT', followers: 707600 },
    { date: '23 OCT', followers: 708900 },
    { date: '25 OCT', followers: 709800 },
    { date: '27 OCT', followers: 710500 },
    { date: '29 OCT', followers: 711217 },
  ],
  
  gainedLostData: [
    { date: '1 OCT', gained: 800, lost: 200 },
    { date: '3 OCT', gained: 1200, lost: 300 },
    { date: '5 OCT', gained: 1100, lost: 250 },
    { date: '7 OCT', gained: 450, lost: 150 },
    { date: '9 OCT', gained: 3200, lost: 400 },
    { date: '11 OCT', gained: 1900, lost: 350 },
    { date: '13 OCT', gained: 800, lost: 200 },
    { date: '15 OCT', gained: 450, lost: 150 },
    { date: '17 OCT', gained: 950, lost: 180 },
    { date: '19 OCT', gained: 1600, lost: 280 },
    { date: '21 OCT', gained: 1200, lost: 350 },
    { date: '23 OCT', gained: 1800, lost: 300 },
    { date: '25 OCT', gained: 4500, lost: 650 },
    { date: '27 OCT', gained: 2200, lost: 450 },
    { date: '29 OCT', gained: 1100, lost: 280 },
    { date: '1 NOV', gained: 1500, lost: 320 },
    { date: '3 NOV', gained: 1750, lost: 410 },
    { date: '5 NOV', gained: 3100, lost: 380 },
    { date: '7 NOV', gained: 900, lost: 220 },
    { date: '9 NOV', gained: 1050, lost: 280 },
    { date: '11 NOV', gained: 950, lost: 240 },
    { date: '13 NOV', gained: 1850, lost: 420 },
    { date: '15 NOV', gained: 1100, lost: 310 },
  ],
};

export default function SocmedAnalyticsPage() {
  const [dateRange] = useState('October 1, 2021 - October 30, 2021');
  const [viewType, setViewType] = useState('Day');

  // Calculate max value for chart scaling
  const maxFollowers = Math.max(...MOCK_DATA.followerHistory.map(d => d.followers));
  const minFollowers = Math.min(...MOCK_DATA.followerHistory.map(d => d.followers));
  const maxGained = Math.max(...MOCK_DATA.gainedLostData.map(d => d.gained));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Analytics</h1>
          <p className="text-gray-600">Track and analyze your social media performance</p>
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

      {/* Date Range Selector */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" className="justify-between min-w-[300px]">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange}
          </div>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
        <div className="flex border rounded-md">
          {['Day', 'Week', 'Month'].map((type) => (
            <button
              key={type}
              onClick={() => setViewType(type)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewType === type
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Audience Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Audience</h2>
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="flex space-x-4">
            {/* Followers Card */}
            <Card className="flex-1 p-6">
              <div className="text-sm text-gray-600 mb-1">Followers</div>
              <div className="text-3xl font-bold mb-2">
                {MOCK_DATA.currentFollowers.toLocaleString()}
              </div>
            </Card>

            {/* Follower Change Card */}
            <Card className="flex-1 p-6">
              <div className="text-sm text-gray-600 mb-1">Follower Change</div>
              <div className="flex items-baseline space-x-2 mb-2">
                <span className="text-3xl font-bold text-green-600">
                  {MOCK_DATA.followerChange.toLocaleString()}
                </span>
                <span className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {MOCK_DATA.followerChangePercent}%
                </span>
              </div>
            </Card>

            {/* Max Follower Change Card */}
            <Card className="flex-1 p-6">
              <div className="text-sm text-gray-600 mb-1">Max. Follower Change</div>
              <div className="text-3xl font-bold mb-1">
                {MOCK_DATA.maxFollowerChange.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{MOCK_DATA.maxChangeDate}</div>
            </Card>

            {/* Avg Follower Change Card */}
            <Card className="flex-1 p-6">
              <div className="text-sm text-gray-600 mb-1">Avg. Follower Change</div>
              <div className="text-3xl font-bold">
                +{MOCK_DATA.avgFollowerChange}
              </div>
            </Card>
          </div>
        </div>

        {/* Followers Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Followers</h3>
              <span className="text-sm text-gray-500">
                Oct 1, 2021 → Oct 30, 2021
              </span>
            </div>
            <Button variant="outline" size="sm">
              CSV
            </Button>
          </div>
          
          {/* Line Chart */}
          <div className="relative h-64">
            <svg className="w-full h-full" viewBox="0 0 900 200" preserveAspectRatio="none">
              {/* Y-axis labels */}
              <text x="10" y="15" className="text-xs fill-gray-500">715k</text>
              <text x="10" y="50" className="text-xs fill-gray-500">710k</text>
              <text x="10" y="85" className="text-xs fill-gray-500">705k</text>
              <text x="10" y="120" className="text-xs fill-gray-500">700k</text>
              <text x="10" y="155" className="text-xs fill-gray-500">695k</text>
              <text x="10" y="190" className="text-xs fill-gray-500">690k</text>
              <text x="10" y="200" className="text-xs fill-gray-500">685k</text>
              
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <line
                  key={i}
                  x1="60"
                  y1={i * 33}
                  x2="900"
                  y2={i * 33}
                  stroke="#f0f0f0"
                  strokeWidth="1"
                />
              ))}
              
              {/* Line path */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                points={MOCK_DATA.followerHistory.map((d, i) => {
                  const x = 60 + (i * (840 / (MOCK_DATA.followerHistory.length - 1)));
                  const y = 200 - ((d.followers - minFollowers) / (maxFollowers - minFollowers)) * 180;
                  return `${x},${y}`;
                }).join(' ')}
              />
              
              {/* Hover points */}
              {MOCK_DATA.followerHistory.map((d, i) => {
                const x = 60 + (i * (840 / (MOCK_DATA.followerHistory.length - 1)));
                const y = 200 - ((d.followers - minFollowers) / (maxFollowers - minFollowers)) * 180;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3"
                    fill="#3b82f6"
                    className="hover:r-5 cursor-pointer"
                  />
                );
              })}
            </svg>
            
            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-12 text-xs text-gray-500">
              {MOCK_DATA.followerHistory.filter((_, i) => i % 2 === 0).map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Gained and Lost Followers Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold">Gained and Lost Followers</h3>
            <span className="text-sm text-gray-500">
              Oct 1, 2021 → Oct 30, 2021
            </span>
          </div>
          <Button variant="outline" size="sm">
            CSV
          </Button>
        </div>
        
        {/* Bar Chart */}
        <div className="relative h-64">
          <svg className="w-full h-full" viewBox="0 0 900 250" preserveAspectRatio="none">
            {/* Y-axis labels */}
            <text x="10" y="15" className="text-xs fill-gray-500">5k</text>
            <text x="10" y="55" className="text-xs fill-gray-500">4k</text>
            <text x="10" y="95" className="text-xs fill-gray-500">3k</text>
            <text x="10" y="135" className="text-xs fill-gray-500">2k</text>
            <text x="10" y="175" className="text-xs fill-gray-500">1k</text>
            <text x="10" y="215" className="text-xs fill-gray-500">0</text>
            <text x="10" y="245" className="text-xs fill-gray-500">-1k</text>
            
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <line
                key={i}
                x1="60"
                y1={i * 40}
                x2="900"
                y2={i * 40}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
            ))}
            
            {/* Bars */}
            {MOCK_DATA.gainedLostData.map((d, i) => {
              const x = 60 + (i * (840 / MOCK_DATA.gainedLostData.length));
              const barWidth = 25;
              const gainedHeight = (d.gained / maxGained) * 120;
              const lostHeight = (d.lost / maxGained) * 120;
              
              return (
                <g key={i}>
                  {/* Gained (blue bar) */}
                  <rect
                    x={x}
                    y={215 - gainedHeight}
                    width={barWidth}
                    height={gainedHeight}
                    fill="#3b82f6"
                    className="hover:opacity-80 cursor-pointer"
                  />
                  {/* Lost (red bar) */}
                  <rect
                    x={x}
                    y={215}
                    width={barWidth}
                    height={lostHeight}
                    fill="#ef4444"
                    className="hover:opacity-80 cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>
          
          {/* X-axis labels */}
          <div className="flex justify-between mt-2 px-12 text-xs text-gray-500">
            {MOCK_DATA.gainedLostData.filter((_, i) => i % 2 === 0).map((d, i) => (
              <span key={i}>{d.date}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Additional Sections Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Posts</h3>
          <div className="text-2xl font-bold">127</div>
          <p className="text-sm text-gray-500 mt-1">Total posts this period</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Stories</h3>
          <div className="text-2xl font-bold">43</div>
          <p className="text-sm text-gray-500 mt-1">Stories posted</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Engagement Rate</h3>
          <div className="text-2xl font-bold">4.2%</div>
          <p className="text-sm text-gray-500 mt-1">Average engagement</p>
        </Card>
      </div>
    </div>
  );
}
