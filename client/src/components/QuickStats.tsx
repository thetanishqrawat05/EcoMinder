import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Clock, Target, Coffee } from 'lucide-react';

export default function QuickStats() {
  const { data: analytics } = useQuery({
    queryKey: ['/api/analytics/summary', '1d'], // Today's stats
    retry: false,
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Focus Time</span>
            </div>
            <span className="font-semibold">
              {analytics ? formatTime(analytics.totalFocusTime) : '0m'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Sessions</span>
            </div>
            <span className="font-semibold">
              {analytics?.completedSessions || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coffee className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Breaks</span>
            </div>
            <span className="font-semibold">
              {analytics?.completedBreaks || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
