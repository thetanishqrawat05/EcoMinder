import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Coffee, Clock, Search, Filter } from 'lucide-react';

export default function History() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'focus' | 'break'>('all');

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

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/timer/sessions', { limit: 100 }],
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
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString([], { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const filteredSessions = sessions?.filter((session: any) => {
    const matchesSearch = session.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         new Date(session.startedAt).toLocaleDateString().includes(searchTerm);
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'focus' && session.type === 'focus') ||
                         (filterType === 'break' && session.type !== 'focus');
    return matchesSearch && matchesFilter;
  }) || [];

  const groupedSessions = filteredSessions.reduce((groups: any, session: any) => {
    const date = new Date(session.startedAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Session History</h1>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'focus' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('focus')}
              >
                Focus
              </Button>
              <Button
                variant={filterType === 'break' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('break')}
              >
                Break
              </Button>
            </div>
          </div>
        </div>

        {sessionsLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="flex justify-between">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedSessions).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSessions)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([date, sessions]: [string, any]) => (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {new Date(date).toDateString() === new Date().toDateString() 
                        ? 'Today' 
                        : new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                        ? 'Yesterday'
                        : new Date(date).toLocaleDateString([], { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessions.map((session: any) => (
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
                                {session.type === 'focus' ? 'Focus Session' : 
                                 session.type === 'break' ? 'Short Break' :
                                 session.type === 'long_break' ? 'Long Break' : session.type}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(session.startedAt)}
                              </div>
                              {session.ambientSound && (
                                <div className="text-xs text-muted-foreground">
                                  🎵 {session.ambientSound}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatTime(session.completedDuration)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              of {formatTime(session.duration)}
                            </div>
                            <Badge variant={session.isCompleted ? 'default' : 'secondary'} className="text-xs mt-1">
                              {session.isCompleted ? 'Completed' : 'Incomplete'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Sessions Found</h3>
                <p className="mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Start your first timer session to see your history here.'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <Button onClick={() => window.location.href = '/'}>
                    Start Timer
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
