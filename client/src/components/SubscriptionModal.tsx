import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const features = [
    'Unlimited custom timer durations',
    'Premium ambient sound library',
    'Detailed analytics & insights',
    'Cloud sync across devices',
    'Ad-free experience',
    'Priority customer support',
  ];

  const plans = {
    monthly: {
      price: '$4.99',
      period: 'month',
      savings: null,
    },
    yearly: {
      price: '$29.99',
      period: 'year',
      savings: 'Save 50%',
    }
  };

  const handleStartTrial = () => {
    window.location.href = '/subscribe';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">
              Unlock Premium
            </DialogTitle>
            <p className="text-muted-foreground">
              Get access to all premium features
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          <Card 
            className={`cursor-pointer transition-colors ${
              selectedPlan === 'yearly' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPlan('yearly')}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Yearly Plan</div>
                  <div className="text-sm text-muted-foreground">Best value</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{plans.yearly.price}/year</div>
                  <Badge variant="default" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Save 50%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-colors ${
              selectedPlan === 'monthly' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Monthly Plan</div>
                  <div className="text-sm text-muted-foreground">Pay as you go</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{plans.monthly.price}/month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleStartTrial}
          >
            Start Trial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
