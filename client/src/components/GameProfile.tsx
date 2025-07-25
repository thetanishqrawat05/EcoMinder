import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Zap, Target, Medal, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CardSkeleton, StatsSkeleton } from './LoadingSkeleton';

interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  icon: string;
  category: string;
  requirement: number;
  isActive: boolean;
}

interface GameData {
  totalXp: number;
  currentLevel: number;
  xpToNextLevel: number;
  completedAchievements: string[];
}

export function GameProfile() {
  const [showAnimation, setShowAnimation] = useState(false);

  const { data: gameProfile, isLoading } = useQuery({
    queryKey: ['/api/game/profile'],
    queryFn: () => apiRequest('/api/game/profile'),
  });

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      trophy: Trophy,
      star: Star,
      zap: Zap,
      target: Target,
      medal: Medal,
      award: Award,
    };
    const IconComponent = icons[iconName] || Trophy;
    return <IconComponent className="w-5 h-5" />;
  };

  const triggerLevelUpAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <StatsSkeleton />
          </CardContent>
        </Card>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const gameData: GameData = gameProfile?.gameData || {
    totalXp: 0,
    currentLevel: 1,
    xpToNextLevel: 100,
    completedAchievements: [],
  };

  const achievements: Achievement[] = gameProfile?.achievements || [];
  const xpProgress = ((100 - gameData.xpToNextLevel) / 100) * 100;

  const unlockedAchievements = achievements.filter(a => 
    gameData.completedAchievements.includes(a.id)
  );

  const availableAchievements = achievements.filter(a => 
    !gameData.completedAchievements.includes(a.id)
  );

  return (
    <div className="space-y-6">
      {/* Level Up Animation */}
      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center animate-bounce">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-yellow-500">LEVEL UP!</h2>
            <p className="text-lg">You reached Level {gameData.currentLevel}!</p>
          </div>
        </div>
      )}

      {/* Player Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Level & XP */}
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">
                Level {gameData.currentLevel}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {gameData.totalXp} Total XP
              </div>
            </div>

            {/* XP Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {gameData.currentLevel + 1}</span>
                <span>{100 - gameData.xpToNextLevel}/100 XP</span>
              </div>
              <Progress value={xpProgress} className="h-3" />
              <div className="text-xs text-gray-500">
                {gameData.xpToNextLevel} XP until next level
              </div>
            </div>

            {/* Achievements Count */}
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {unlockedAchievements.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Achievements Unlocked
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-gold-500" />
              Unlocked Achievements ({unlockedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    {getIconComponent(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-700 dark:text-green-300">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {achievement.description}
                    </p>
                    <Badge variant="outline" className="mt-1 text-green-600">
                      +{achievement.xpReward} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Available Achievements ({availableAchievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
              >
                <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white">
                  {getIconComponent(achievement.icon)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">+{achievement.xpReward} XP</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {achievement.requirement} required
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug: Test Level Up */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={triggerLevelUpAnimation} variant="outline" size="sm">
            Preview Level Up Animation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}