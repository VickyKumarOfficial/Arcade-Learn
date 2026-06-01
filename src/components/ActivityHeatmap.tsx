import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar } from 'lucide-react';
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

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activeWeekDays = stats ? Math.min(stats.currentStreak, 7) : 0;

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
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,1fr)] lg:items-stretch">
          {/* Heatmap Container */}
          <div className="relative">
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

          {/* Expanded Dark Weekly Streak Panel */}
          {stats && (
            <div className="self-stretch h-full min-h-[220px] overflow-hidden rounded-xl border border-slate-700/90 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-3 text-slate-100 shadow-sm">
              <div className="flex h-full flex-col justify-between">
                <div className="space-y-1.5 text-center">
                  <p className="text-5xl font-extrabold leading-none text-violet-400">
                    {stats.currentStreak}
                  </p>
                  <p className="text-base font-semibold text-violet-300">Day Streak</p>
                </div>

                <p className="px-2 text-center text-sm text-slate-300">
                  {stats.currentStreak >= stats.longestStreak && stats.currentStreak > 0
                    ? "This is the longest streak you've ever had"
                    : `${Math.max(stats.longestStreak - stats.currentStreak, 0)} days to match your best streak`}
                </p>

                <div className="grid grid-cols-7 gap-1.5">
                  {weekDays.map((day, index) => {
                    const active = index >= 7 - activeWeekDays;
                    return (
                      <div key={day} className="text-center">
                      <div
                        className={`mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full border ${
                          active
                            ? 'border-violet-400/60 bg-violet-500/20'
                            : 'border-slate-700 bg-slate-800/80'
                        }`}
                      >
                        <Flame
                          className={`h-3.5 w-3.5 ${active ? 'text-violet-300' : 'text-slate-500'}`}
                        />
                      </div>
                      <p
                        className={`text-[10px] leading-tight ${
                          active ? 'text-slate-200' : 'text-slate-500'
                        }`}
                      >
                        {day}
                      </p>
                      <span
                        className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${
                          active ? 'bg-violet-400' : 'bg-slate-700'
                        }`}
                      />
                    </div>
                    );
                  })}
                </div>

                <p className="text-center text-xs text-slate-400">
                  {stats.totalActivities} total activities
                </p>
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
