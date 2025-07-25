import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import Layout from '@/components/Layout';
import Timer from '@/components/Timer';
import AmbientSounds from '@/components/AmbientSounds';
import StreakCard from '@/components/StreakCard';
import QuickStats from '@/components/QuickStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Coffee, Clock } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
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

  const { data: recentSessions } = useQuery({
    queryKey: ['/api/timer/sessions'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Timer Section */}
          <div className="lg:col-span-2 space-y-8">
            <Timer />
            <AmbientSounds />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StreakCard />
            <QuickStats />
            
            {/* Premium CTA */}
            <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-600 text-sm">👑</span>
                  </div>
                  <h3 className="text-lg font-semibold">Go Premium</h3>
                </div>
                <p className="text-sm opacity-90 mb-4">
                  Unlock unlimited timers, premium sounds, and detailed analytics.
                </p>
                <button 
                  onClick={() => window.location.href = '/subscribe'}
                  className="w-full bg-white text-purple-600 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Try Free for 7 Days
                </button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold">Recent Sessions</CardTitle>
                <button 
                  onClick={() => window.location.href = '/history'}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions && recentSessions.length > 0 ? (
                  recentSessions.slice(0, 3).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          session.isCompleted 
                            ? session.type === 'focus' 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {session.isCompleted ? (
                            session.type === 'focus' ? (
                              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Coffee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )
                          ) : (
                            <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium capitalize">
                            {session.type === 'focus' ? 'Focus Session' : 'Break'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.startedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {Math.floor(session.completedDuration / 60)}:{(session.completedDuration % 60).toString().padStart(2, '0')}
                        </div>
                        <Badge variant={session.isCompleted ? 'default' : 'secondary'} className="text-xs">
                          {session.isCompleted ? 'Completed' : 'Incomplete'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No sessions yet. Start your first timer!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
