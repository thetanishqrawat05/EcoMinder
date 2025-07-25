import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, Trophy, Target } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { CardSkeleton } from './LoadingSkeleton';

interface Challenge {
  id: string;
  title: string;
  description: string;
  targetSessions: number;
  startDate: string;
  endDate: string;
  xpReward: number;
  isActive: boolean;
}

interface ChallengeProgress {
  challenge: Challenge;
  progress: {
    currentSessions: number;
    isCompleted: boolean;
    joinedAt: string;
  };
}

export function CommunityChallenge() {
  const queryClient = useQueryClient();

  const { data: challenges = [], isLoading: challengesLoading } = useQuery({
    queryKey: ['/api/challenges'],
    queryFn: () => apiRequest('/api/challenges'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: userProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['/api/challenges/progress'],
    queryFn: () => apiRequest('/api/challenges/progress'),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const joinChallengeMutation = useMutation({
    mutationFn: (challengeId: string) => apiRequest(`/api/challenges/${challengeId}/join`, {
      method: 'POST',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/challenges/progress'] });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getUserChallengeProgress = (challengeId: string) => {
    return userProgress.find((p: ChallengeProgress) => 
      p.challenge.id === challengeId
    )?.progress;
  };

  const isUserJoined = (challengeId: string) => {
    return getUserChallengeProgress(challengeId) !== undefined;
  };

  if (challengesLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-blue-500" />
        <h2 className="text-2xl font-bold">Community Challenges</h2>
      </div>

      {/* Active Challenges */}
      <div className="grid gap-4">
        {challenges.map((challenge: Challenge) => {
          const userChallengeProgress = getUserChallengeProgress(challenge.id);
          const isJoined = isUserJoined(challenge.id);
          const progressPercentage = userChallengeProgress 
            ? (userChallengeProgress.currentSessions / challenge.targetSessions) * 100
            : 0;
          const daysRemaining = getDaysRemaining(challenge.endDate);

          return (
            <Card key={challenge.id} className={`${userChallengeProgress?.isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      {challenge.title}
                      {userChallengeProgress?.isCompleted && (
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      )}
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      {challenge.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant={daysRemaining > 3 ? "default" : "destructive"}>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ended'}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Challenge Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-500">
                        {challenge.targetSessions}
                      </div>
                      <div className="text-xs text-gray-500">Target Sessions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">
                        {userChallengeProgress?.currentSessions || 0}
                      </div>
                      <div className="text-xs text-gray-500">Your Progress</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-500">
                        +{challenge.xpReward}
                      </div>
                      <div className="text-xs text-gray-500">XP Reward</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isJoined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{userChallengeProgress?.currentSessions || 0}/{challenge.targetSessions}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      {userChallengeProgress?.isCompleted && (
                        <div className="text-center text-green-600 font-semibold">
                          🎉 Challenge Completed!
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-center">
                    {!isJoined ? (
                      <Button
                        onClick={() => joinChallengeMutation.mutate(challenge.id)}
                        disabled={joinChallengeMutation.isPending || daysRemaining === 0}
                        className="w-full sm:w-auto"
                      >
                        {daysRemaining === 0 ? 'Challenge Ended' : 'Join Challenge'}
                      </Button>
                    ) : userChallengeProgress?.isCompleted ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Participating
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {challenges.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active challenges at the moment.</p>
            <p className="text-sm text-gray-400 mt-2">
              Check back later for new community challenges!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Your Progress Summary */}
      {userProgress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Challenge History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userProgress.map((progress: ChallengeProgress) => (
                <div
                  key={progress.challenge.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{progress.challenge.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Joined {formatDate(progress.progress.joinedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {progress.progress.currentSessions}/{progress.challenge.targetSessions} sessions
                    </div>
                    {progress.progress.isCompleted ? (
                      <Badge className="bg-green-500">Completed</Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}