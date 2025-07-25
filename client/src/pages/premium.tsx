import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Zap, Target, Users, Bot, Timer, BarChart3, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Import premium components
import { TaskManager } from '@/components/TaskManager';
import { GameProfile } from '@/components/GameProfile';
import { CommunityChallenge } from '@/components/CommunityChallenge';
import { AiChat } from '@/components/AiChat';
import { ScreenUsageGuard } from '@/components/ScreenUsageGuard';
import { FocusBubble } from '@/components/FocusBubble';
import { SubscriptionModal } from '@/components/SubscriptionModal';

export function PremiumPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showFocusBubble, setShowFocusBubble] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const { data: premiumStatus, isLoading } = useQuery({
    queryKey: ['/api/premium/status'],
    queryFn: () => apiRequest('/api/premium/status'),
    staleTime: 10 * 1000, // 10 seconds for instant response
  });

  const handleTaskSessionStart = (taskId: string) => {
    // This would integrate with the timer context to start a session for a specific task
    console.log('Starting session for task:', taskId);
  };

  const features = [
    {
      id: 'tasks',
      title: 'Task Manager',
      icon: Target,
      description: 'Create and manage tasks with Pomodoro tracking',
      component: <TaskManager onStartTaskSession={handleTaskSessionStart} />,
    },
    {
      id: 'gamification',
      title: 'XP & Achievements',
      icon: Zap,
      description: 'Level up and unlock achievements',
      component: <GameProfile />,
    },
    {
      id: 'community',
      title: 'Community Challenges',
      icon: Users,
      description: 'Join weekly productivity challenges',
      component: <CommunityChallenge />,
    },
    {
      id: 'ai-coach',
      title: 'AI Focus Coach',
      icon: Bot,
      description: 'Get personalized productivity advice',
      component: <AiChat />,
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      icon: BarChart3,
      description: 'Detailed insights and data export',
      component: <ScreenUsageGuard />,
    },
    {
      id: 'focus-bubble',
      title: 'Focus Bubble',
      icon: Timer,
      description: 'Floating timer that stays on top',
      component: (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Timer className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Focus Bubble</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                A draggable floating timer that stays visible while you work in other apps
              </p>
              <Button 
                onClick={() => setShowFocusBubble(!showFocusBubble)}
                variant={showFocusBubble ? "destructive" : "default"}
              >
                {showFocusBubble ? 'Hide Focus Bubble' : 'Show Focus Bubble'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading premium features...</div>;
  }

  const hasAccess = premiumStatus?.hasAccess;
  const isPremium = premiumStatus?.isPremium;
  const trialDaysRemaining = premiumStatus?.trialDaysRemaining || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Premium Features
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Supercharge your productivity with advanced tools
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-right">
            {isPremium ? (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
                <Crown className="w-4 h-4 mr-2" />
                Premium Active
              </Badge>
            ) : hasAccess ? (
              <Badge variant="outline" className="border-blue-500 text-blue-600 px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Free Trial ({trialDaysRemaining} days left)
              </Badge>
            ) : (
              <Button 
                onClick={() => setShowSubscriptionModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </div>

        {/* Trial Warning */}
        {!isPremium && hasAccess && trialDaysRemaining <= 3 && (
          <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-600">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">
                    Your free trial expires in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}
                  </span>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setShowSubscriptionModal(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Access Check */}
      {!hasAccess ? (
        <Card className="text-center py-12">
          <CardContent>
            <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Premium Features Locked</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your free trial has expired. Upgrade to premium to access all features.
            </p>
            <Button 
              onClick={() => setShowSubscriptionModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Premium Features */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Enhanced Navigation */}
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600"
            >
              <Crown className="w-5 h-5" />
              <span className="text-xs font-medium">Overview</span>
            </TabsTrigger>
            
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <TabsTrigger 
                  key={feature.id}
                  value={feature.id}
                  className="flex flex-col items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-purple-600"
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {feature.title.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => {
                const IconComponent = feature.icon;
                return (
                  <Card 
                    key={feature.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200"
                    onClick={() => setActiveTab(feature.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg">{feature.title}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                      <Button 
                        variant="outline" 
                        className="mt-4 w-full border-purple-200 hover:border-purple-300"
                      >
                        Open Feature
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Feature Tabs */}
          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="space-y-6">
              {feature.component}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Focus Bubble */}
      {showFocusBubble && hasAccess && (
        <FocusBubble onClose={() => setShowFocusBubble(false)} />
      )}

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
}