import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, X } from 'lucide-react';
import Layout from '@/components/Layout';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to FocusZen Premium!",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || !elements}
        className="w-full"
        size="lg"
      >
        Subscribe Now
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const { toast } = useToast();

  useEffect(() => {
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again.",
          variant: "destructive",
        });
      });
  }, [toast]);

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

  const features = [
    'Unlimited custom timer durations',
    'Premium ambient sound library',
    'Detailed analytics & insights',
    'Cloud sync across devices',
    'Ad-free experience',
    'Priority customer support',
    'Export your data',
    'Advanced streak tracking',
  ];

  // Show configuration message if Stripe isn't set up
  if (!stripePromise) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Premium Features</h1>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-2xl mx-auto">
              <p className="text-lg text-yellow-800 dark:text-yellow-200 mb-4">
                Premium subscriptions are currently being configured.
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Contact support to enable premium features and subscription payments.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!clientSecret) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Initializing payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Unlock Premium</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take your productivity to the next level with advanced features and insights
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Plan Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPlan === 'yearly' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedPlan('yearly')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Yearly Plan</div>
                      <div className="text-sm text-muted-foreground">Best value</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{plans.yearly.price}/year</div>
                      <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                        Save 50%
                      </Badge>
                    </div>
                  </div>
                </div>

                <div 
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedPlan === 'monthly' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedPlan('monthly')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">Monthly Plan</div>
                      <div className="text-sm text-muted-foreground">Pay as you go</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{plans.monthly.price}/month</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <SubscribeForm />
                </Elements>
              </CardContent>
            </Card>

            {/* Trial Info */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">ℹ️</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      7-Day Free Trial
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Try all premium features free for 7 days. Cancel anytime during the trial period 
                      and you won't be charged. Your subscription will automatically renew after the trial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <div className="text-center text-sm text-muted-foreground">
              <p>🔒 Secure payment powered by Stripe</p>
              <p>Cancel anytime • No hidden fees</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Not ready yet? Go back
          </Button>
        </div>
      </div>
    </Layout>
  );
}
