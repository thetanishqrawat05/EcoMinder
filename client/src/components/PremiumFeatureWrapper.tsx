import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PremiumFeatureWrapperProps {
  children: ReactNode;
  featureName: string;
  onUpgradeClick?: () => void;
}

export function PremiumFeatureWrapper({ 
  children, 
  featureName, 
  onUpgradeClick 
}: PremiumFeatureWrapperProps) {
  const { data: premiumStatus, isLoading } = useQuery({
    queryKey: ['/api/premium/status'],
    queryFn: () => apiRequest('/api/premium/status'),
    staleTime: 10 * 1000, // 10 seconds for instant response
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Checking access...</p>
        </CardContent>
      </Card>
    );
  }

  const hasAccess = premiumStatus?.hasAccess;
  const isPremium = premiumStatus?.isPremium;
  const trialDaysRemaining = premiumStatus?.trialDaysRemaining || 0;

  if (!hasAccess) {
    return (
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{featureName} - Premium Feature</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This feature requires a premium subscription. Your free trial has expired.
          </p>
          <Button 
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show trial warning if close to expiration
  if (!isPremium && hasAccess && trialDaysRemaining <= 3) {
    return (
      <div className="space-y-4">
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-900/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-600">
                <Crown className="w-5 h-5" />
                <span className="font-semibold">
                  Trial expires in {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''}
                </span>
              </div>
              <Button 
                size="sm"
                onClick={onUpgradeClick}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}