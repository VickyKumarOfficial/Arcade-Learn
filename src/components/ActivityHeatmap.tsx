import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, TrendingUp, Calendar, Award } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URL } from '@/config/env';
import './ActivityHeatmap.css';

interface ActivityStats {
  totalActivities: number;
  currentStreak: number;
  longestStreak: number;
  mostActiveMonth: string;
  mostActiveCount: number;
  avgActivitiesPerWeek: number;
}

interface ActivityHeatmapProps {
  userId: string;
  year?: number;
}

// Declare Heat.js global
declare global {
  interface Window {
    $heat: any;
  }
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ userId, year }) => {
  const heatmapRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const heatJsLoadedRef = useRef(false);
  const [mounted, setMounted] = useState(false);

  // First useEffect: Mark component as mounted
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Second useEffect: Fetch and render heatmap after mount
  useEffect(() => {
    if (!mounted || !userId) return;
    const loadHeatJs = async (): Promise<boolean> => {
      // Check if already loaded globally
      if (window.$heat && heatJsLoadedRef.current) {
        console.log('✅ Heat.js already loaded');
        return true;
      }

      try {
        console.log('📦 Attempting to load Heat.js library...');
        
        // Dynamically import Heat.js library
        await import('jheat.js');
        console.log('📦 Heat.js module imported');
        
        // Import Heat.js CSS if not already imported
        if (!document.querySelector('link[href*="heat.js"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/gh/williamtroup/Heat.js@4.3.1/dist/heat.js.min.css';
          document.head.appendChild(link);
          console.log('📦 Heat.js CSS added');
        }

        // Wait for $heat to be available with improved logging
        const heatAvailable = await new Promise<boolean>((resolve) => {
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds (50 * 100ms)
          
          const checkHeat = setInterval(() => {
            attempts++;
            if (window.$heat) {
              console.log(`✅ Heat.js global object found after ${attempts} attempts`);
              clearInterval(checkHeat);
              heatJsLoadedRef.current = true;
              resolve(true);
            } else if (attempts >= maxAttempts) {
              console.error('❌ Heat.js global object not found after 5 seconds');
              clearInterval(checkHeat);
              resolve(false);
            }
          }, 100);
        });

        return heatAvailable;
      } catch (err) {
        console.error('❌ Failed to load Heat.js:', err);
        return false;
      }
    };

    const onDayClick = (date: Date) => {
      toast({
        title: "Activity on " + date.toLocaleDateString(),
        description: "Check your learning activities for this day",
      });
    };

    const fetchActivityData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Starting activity heatmap initialization...');
        console.log('🔗 Backend URL:', BACKEND_URL);

        const currentYear = year || new Date().getFullYear();

        // Load Heat.js first
        console.log('📦 Loading Heat.js library...');
        const heatLoaded = await loadHeatJs();
        
        if (!heatLoaded || !window.$heat) {
          console.error('❌ Heat.js failed to load');
          setError('Failed to load heatmap library');
          setLoading(false);
          return;
        }
        
        console.log('✅ Heat.js loaded successfully');

        // Fetch heatmap data
        console.log('📊 Fetching activity data for user:', userId);
        const heatmapResponse = await axios.get(
          `${BACKEND_URL}/api/user/${userId}/activity/heatmap`,
          {
            params: {
              startDate: `${currentYear}-01-01`,
              endDate: `${currentYear}-12-31`
            }
          }
        );

        // Fetch statistics
        const statsResponse = await axios.get(
          `${BACKEND_URL}/api/user/${userId}/activity/stats`,
          {
            params: { year: currentYear }
          }
        );

        console.log('📈 Data fetched:', {
          heatmapSuccess: heatmapResponse.data.success,
          statsSuccess: statsResponse.data.success,
          dataPoints: Object.keys(heatmapResponse.data.heatmapData || {}).length
        });

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }

        // Wait for the DOM element to be ready with retry mechanism
        const renderHeatmap = async () => {
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            if (heatmapRef.current && window.$heat) {
              console.log('🎨 Rendering heatmap... (attempt', attempts + 1, ')');
              const $heat = window.$heat;

              // Clean up existing instance
              const existingIds = $heat.getIds();
              if (existingIds && existingIds.includes('activity-heatmap')) {
                $heat.destroy('activity-heatmap');
              }

              break; // Element found, exit loop
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
          }
          
          if (!heatmapRef.current || !window.$heat) {
            console.error('❌ Heatmap element not ready after', maxAttempts, 'attempts');
            setError('Failed to initialize heatmap display');
            return false;
          }
          
          return true;
        };

        const isReady = await renderHeatmap();
        if (!isReady) return;

        // Now we can safely render
        if (heatmapRef.current && window.$heat) {
          const $heat = window.$heat;

          // Render heatmap with proper configuration following Heat.js best practices
          $heat.render(heatmapRef.current, {
            views: {
              map: {
                showMonthDayGaps: true,
                showDayNumbers: false,
                placeMonthNamesOnTheBottom: false,
                showDayNames: true,
                showMonthNames: true
              },
              chart: { enabled: false },
              days: { enabled: false },
              statistics: { enabled: false }
            },
            title: {
              showText: false,
              showYearSelector: true,
              showRefreshButton: false,
              showExportButton: false,
              showImportButton: false,
              showConfigurationButton: false
            },
            description: {
              showText: false
            },
            colorRanges: [
              { 
                minimum: 1, 
                cssClassName: 'activity-level-1',
                tooltipText: '1-2 activities'
              },
              { 
                minimum: 3, 
                cssClassName: 'activity-level-2',
                tooltipText: '3-4 activities'
              },
              { 
                minimum: 5, 
                cssClassName: 'activity-level-3',
                tooltipText: '5-7 activities'
              },
              { 
                minimum: 8, 
                cssClassName: 'activity-level-4',
                tooltipText: '8-9 activities'
              },
              { 
                minimum: 10, 
                cssClassName: 'activity-level-5',
                tooltipText: '10+ activities'
              }
            ],
            tooltip: {
              enabled: true,
              delay: 500
            },
            year: currentYear,
            events: {
              onDayClick: onDayClick
            }
          });

          // Add activity data to heatmap
          if (heatmapResponse.data.success && heatmapResponse.data.heatmapData) {
            Object.entries(heatmapResponse.data.heatmapData).forEach(([dateStr, count]) => {
              try {
                const date = new Date(dateStr);
                // Add date multiple times based on activity count
                // This is the correct way per Heat.js documentation
                const activityCount = typeof count === 'number' ? count : 0;
                for (let i = 0; i < activityCount; i++) {
                  $heat.addDate('activity-heatmap', date, null, false);
                }
              } catch (dateErr) {
                console.warn('Invalid date:', dateStr, dateErr);
              }
            });

            // Refresh to display all added dates
            $heat.refresh('activity-heatmap');
            console.log('✨ Heatmap rendered with data!');
          } else {
            console.log('ℹ️ No activity data to display');
          }
        } else {
          console.error('❌ Heatmap element not ready or $heat not available');
        }

      } catch (err) {
        console.error('💥 Error fetching activity data:', err);
        setError('Failed to load activity data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivityData();
    }

    // Cleanup function
    return () => {
      if (window.$heat) {
        const $heat = window.$heat;
        const existingIds = $heat.getIds();
        if (existingIds && existingIds.includes('activity-heatmap')) {
          try {
            $heat.destroy('activity-heatmap');
          } catch (err) {
            console.warn('Error destroying heatmap:', err);
          }
        }
      }
    };
  }, [userId, year, toast, mounted]);

  // Don't render if no userId - show debug message
  if (!userId) {
    console.warn('⚠️ ActivityHeatmap: No userId provided, component will not render');
    return null;
  }

  console.log('✅ ActivityHeatmap: Rendering with userId:', userId);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Your Learning Activity
        </CardTitle>
        <CardDescription>
          Track your daily learning progress and maintain your streak
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Grid Layout: Heatmap on left, Stats on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Heatmap Container - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 relative">
            {/* Always render heatmap div for Heat.js to find */}
            <div 
              ref={heatmapRef} 
              id="activity-heatmap"
              className="w-full overflow-x-auto overflow-y-visible min-h-[200px] lg:min-h-[220px] z-10"
              data-heat-js="{}"
            />

            {/* Loading State Overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground">Loading heatmap...</p>
                </div>
              </div>
            )}

            {/* Error State Overlay */}
            {error && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="text-center text-destructive p-4 border border-destructive/50 rounded-lg bg-background">
                  <p className="font-medium">{error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check console (F12) for details
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Statistics Grid - 2x2 on right side */}
          {stats && (
            <div className="grid grid-cols-2 gap-4">
              {/* Current Streak */}
              <div className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.currentStreak}
                  </span>
                </div>
                <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  Day Streak
                </span>
              </div>

              {/* Total Activities */}
              <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalActivities}
                  </span>
                </div>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Total Activities
                </span>
              </div>

              {/* Longest Streak */}
              <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.longestStreak}
                  </span>
                </div>
                <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  Best Streak
                </span>
              </div>

              {/* Most Active Month */}
              <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {stats.mostActiveMonth}
                  </span>
                </div>
                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Most Active ({stats.mostActiveCount})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Badge */}
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="text-xs">
            Keep learning daily to maintain your streak! 🔥
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
