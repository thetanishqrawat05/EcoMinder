import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Crown, Check, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  onClose: () => void;
}

export function SubscriptionModal({ onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const plans = {
    monthly: {
      price: '$9.99',
      period: 'month',
      savings: null,
    },
    yearly: {
      price: '$99.99',
      period: 'year',
      savings: 'Save 17%',
    },
  };

  const features = [
    'Focus Bubble - Floating timer',
    'AI Distraction Coach',
    'Advanced Task Management',
    'Screen Usage Analytics',
    'Gamification & XP System',
    'Community Challenges',
    'Premium Ambient Sounds',
    'Detailed Analytics Export',
    'Priority Support',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upgrade to Premium
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Unlock all productivity features
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Plan Selection */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col ${
                selectedPlan === 'monthly' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : ''
              }`}
              onClick={() => setSelectedPlan('monthly')}
            >
              <div className="text-lg font-bold">{plans.monthly.price}</div>
              <div className="text-sm opacity-80">per {plans.monthly.period}</div>
            </Button>
            
            <Button
              variant={selectedPlan === 'yearly' ? 'default' : 'outline'}
              className={`h-auto p-4 flex flex-col relative ${
                selectedPlan === 'yearly' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : ''
              }`}
              onClick={() => setSelectedPlan('yearly')}
            >
              {plans.yearly.savings && (
                <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs">
                  {plans.yearly.savings}
                </Badge>
              )}
              <div className="text-lg font-bold">{plans.yearly.price}</div>
              <div className="text-sm opacity-80">per {plans.yearly.period}</div>
            </Button>
          </div>

          {/* Features List */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Premium Features
            </h4>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscribe Button */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
            onClick={() => {
              // This would integrate with Stripe payment
              alert(`Selected ${selectedPlan} plan. Payment integration would go here.`);
              onClose();
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Subscribe {selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'}
          </Button>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500">
            <p>Cancel anytime • Secure payment via Stripe</p>
            <p className="mt-1">7-day free trial for new users</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}