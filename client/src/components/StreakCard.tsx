import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Flame, Target } from 'lucide-react';

export default function StreakCard() {
  const { data: streakData } = useQuery({
    queryKey: ['/api/user/streak/current'],
    retry: false,
  });

  const { data: todayStats } = useQuery({
    queryKey: ['/api/analytics/summary', '1d'],
    retry: false,
  });

  const currentStreak = streakData?.currentStreak || 0;
  const dailyGoal = 5; // sessions per day
  const completedToday = todayStats?.completedSessions || 0;
  const progress = Math.min((completedToday / dailyGoal) * 100, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <span>Daily Streak</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold text-orange-500 mb-2">
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            Days in a row
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mb-3">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Target className="w-4 h-4" />
            <span>
              {completedToday} of {dailyGoal} sessions today
            </span>
          </div>
          
          {progress === 100 && (
            <div className="mt-3 text-sm text-green-600 dark:text-green-400 font-medium">
              🎉 Daily goal achieved!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
