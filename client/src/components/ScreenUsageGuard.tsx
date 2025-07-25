import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, EyeOff, Clock, AlertTriangle } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTimerContext } from '@/contexts/TimerContext';
import { StatsSkeleton, TableSkeleton } from './LoadingSkeleton';

interface ScreenUsageStats {
  totalDistractions: number;
  totalFocusTime: number;
  totalAwayTime: number;
  focusRatio: number;
  logs: Array<{
    id: string;
    distractionCount: number;
    focusTime: number;
    awayTime: number;
    createdAt: string;
  }>;
}

export function ScreenUsageGuard() {
  const { isRunning, currentSessionId } = useTimerContext();
  const [isAppVisible, setIsAppVisible] = useState(true);
  const [distractionCount, setDistractionCount] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [awayStartTime, setAwayStartTime] = useState<number | null>(null);
  const [totalAwayTime, setTotalAwayTime] = useState(0);
  const [showDistractionsNotice, setShowDistractionsNotice] = useState(false);

  const { data: screenStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/screen-usage/stats', currentSessionId],
    queryFn: () => apiRequest(`/api/screen-usage/stats?sessionId=${currentSessionId}`),
    enabled: !!currentSessionId,
    staleTime: 30 * 1000, // 30 seconds
  });

  const saveScreenUsageMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/screen-usage', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      refetchStats();
    },
  });

  // Track app visibility
  const handleVisibilityChange = useCallback(() => {
    const isVisible = !document.hidden;
    setIsAppVisible(isVisible);

    if (isRunning && currentSessionId) {
      const now = Date.now();

      if (!isVisible) {
        // User left the app
        setAwayStartTime(now);
        setDistractionCount(prev => prev + 1);
        setShowDistractionsNotice(true);
        
        // Hide notice after 3 seconds
        setTimeout(() => setShowDistractionsNotice(false), 3000);
      } else {
        // User returned to the app
        if (awayStartTime) {
          const awayDuration = now - awayStartTime;
          setTotalAwayTime(prev => prev + awayDuration);
          setAwayStartTime(null);
        }
      }
    }
  }, [isRunning, currentSessionId, awayStartTime]);

  // Initialize session tracking
  useEffect(() => {
    if (isRunning && currentSessionId && !sessionStartTime) {
      setSessionStartTime(Date.now());
      setDistractionCount(0);
      setTotalAwayTime(0);
    } else if (!isRunning && sessionStartTime) {
      // Session ended, save data
      const totalFocusTime = Date.now() - sessionStartTime - totalAwayTime;
      
      saveScreenUsageMutation.mutate({
        sessionId: currentSessionId,
        distractionCount,
        focusTime: Math.max(0, Math.floor(totalFocusTime / 1000)),
        awayTime: Math.floor(totalAwayTime / 1000),
      });

      setSessionStartTime(null);
      setDistractionCount(0);
      setTotalAwayTime(0);
    }
  }, [isRunning, currentSessionId, sessionStartTime, totalAwayTime, distractionCount]);

  // Set up visibility change listener
  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleVisibilityChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stats: ScreenUsageStats = screenStats || {
    totalDistractions: 0,
    totalFocusTime: 0,
    totalAwayTime: 0,
    focusRatio: 0,
    logs: [],
  };

  const currentFocusRatio = sessionStartTime 
    ? ((Date.now() - sessionStartTime - totalAwayTime) / (Date.now() - sessionStartTime)) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Distraction Notice */}
      {showDistractionsNotice && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <Card className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Stay focused! 😤</span>
              </div>
              <p className="text-sm text-red-500 mt-1">
                You left the app during your session
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Session Monitoring */}
      {isRunning && currentSessionId && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              Session Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {distractionCount}
                </div>
                <div className="text-xs text-gray-500">Distractions</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {currentFocusRatio.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-500">Focus Ratio</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {formatTime(Math.floor(totalAwayTime / 1000))}
                </div>
                <div className="text-xs text-gray-500">Away Time</div>
              </div>
              
              <div className="text-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full mx-auto ${
                  isAppVisible ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isAppVisible ? 
                    <Eye className="w-4 h-4 text-white" /> : 
                    <EyeOff className="w-4 h-4 text-white" />
                  }
                </div>
                <div className="text-xs text-gray-500 mt-1">Status</div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Session Focus Quality</span>
                <span>{currentFocusRatio.toFixed(1)}%</span>
              </div>
              <Progress value={currentFocusRatio} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Screen Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {stats.totalDistractions}
              </div>
              <div className="text-xs text-gray-500">Total Distractions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">
                {formatTime(stats.totalFocusTime)}
              </div>
              <div className="text-xs text-gray-500">Focus Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">
                {formatTime(stats.totalAwayTime)}
              </div>
              <div className="text-xs text-gray-500">Away Time</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">
                {(stats.focusRatio * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Avg Focus Ratio</div>
            </div>
          </div>

          {/* Recent Sessions */}
          {stats.logs.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Recent Sessions</h4>
              <div className="space-y-2">
                {stats.logs.slice(0, 5).map((log, index) => {
                  const focusRatio = log.focusTime / (log.focusTime + log.awayTime) * 100;
                  const sessionQuality = focusRatio >= 80 ? 'excellent' : 
                                        focusRatio >= 60 ? 'good' : 
                                        focusRatio >= 40 ? 'fair' : 'poor';
                  const qualityColor = focusRatio >= 80 ? 'text-green-600' : 
                                      focusRatio >= 60 ? 'text-blue-600' : 
                                      focusRatio >= 40 ? 'text-yellow-600' : 'text-red-600';

                  return (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className={qualityColor}>
                          {sessionQuality}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span>{log.distractionCount} distractions</span>
                        <span>{formatTime(log.focusTime)} focus</span>
                        <span className={qualityColor}>
                          {focusRatio.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}