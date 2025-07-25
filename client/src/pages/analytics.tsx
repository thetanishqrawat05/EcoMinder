import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [period, setPeriod] = useState('7d');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/analytics/summary', period],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/timer/sessions', { limit: 50 }],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Track your productivity and focus patterns</p>
          </div>
          <div className="flex space-x-2">
            {periods.map((p) => (
              <Button
                key={p.key}
                variant={period === p.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Focus Time</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics ? formatTime(analytics.totalFocusTime) : '0m'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-muted-foreground">Sessions</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics?.completedSessions || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Break Time</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics ? formatTime(analytics.totalBreakTime) : '0m'}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-muted-foreground">Avg/Day</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {analytics ? formatTime(Math.round(analytics.totalFocusTime / parseInt(period.replace('d', '')))) : '0m'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Session History Chart Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Daily Focus Time</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Chart visualization coming soon</p>
                      <p className="text-sm">Premium feature</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Session Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Focus Sessions</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${analytics ? (analytics.completedSessions / (analytics.completedSessions + analytics.completedBreaks)) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics?.completedSessions || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Break Sessions</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${analytics ? (analytics.completedBreaks / (analytics.completedSessions + analytics.completedBreaks)) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{analytics?.completedBreaks || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions && sessions.length > 0 ? (
                    sessions.slice(0, 10).map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            session.type === 'focus' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <span className="text-sm capitalize">
                            {session.type === 'focus' ? 'Focus Session' : 'Break'}
                          </span>
                          <Badge variant={session.isCompleted ? 'default' : 'secondary'} className="text-xs">
                            {session.isCompleted ? 'Completed' : 'Incomplete'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatTime(session.completedDuration)}</span>
                          <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No session data available</p>
                      <p className="text-sm">Start using the timer to see your analytics</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}
