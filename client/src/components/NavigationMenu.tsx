import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, BarChart3, History, Settings, LogOut, Crown, Sparkles } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function NavigationMenu() {
  const [location] = useLocation();

  // Fetch premium status for navigation enhancement
  const { data: premiumStatus } = useQuery({
    queryKey: ['/api/premium/status'],
    queryFn: () => apiRequest('/api/premium/status'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const isPremium = premiumStatus?.isPremium;
  const hasAccess = premiumStatus?.hasAccess;
  const trialDaysRemaining = premiumStatus?.trialDaysRemaining || 0;

  const navigationItems = [
    {
      icon: Home,
      label: 'Timer',
      href: '/',
      active: location === '/',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      href: '/analytics',
      active: location === '/analytics',
    },
    {
      icon: History,
      label: 'History',
      href: '/history',
      active: location === '/history',
    },
    {
      icon: Crown,
      label: 'Premium',
      href: '/premium',
      active: location === '/premium',
      special: true,
      badge: isPremium ? 'ACTIVE' : hasAccess ? `${trialDaysRemaining}d` : 'LOCKED'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      active: location === '/settings',
    },
  ];

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <nav className="space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isSpecial = item.special;
            
            return (
              <div key={item.href} className="relative">
                <Button
                  variant={item.active ? 'default' : 'ghost'}
                  className={`w-full justify-start space-x-3 transition-all duration-200 ${
                    item.active 
                      ? isSpecial 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105 border-0' 
                        : 'bg-primary text-primary-foreground shadow-md scale-105'
                      : isSpecial
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40'
                        : 'hover:bg-accent/50 hover:scale-102'
                  } ${isSpecial ? 'font-semibold' : 'font-medium'}`}
                  onClick={() => handleNavigation(item.href)}
                >
                  <Icon className={`w-5 h-5 ${isSpecial && !item.active ? 'text-purple-500' : ''}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  
                  {/* Premium badge */}
                  {isSpecial && item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0.5 ${
                        item.active
                          ? 'bg-white/20 text-white'
                          : isPremium 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : hasAccess
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Button>
                
                {/* Glow effect for premium when active */}
                {isSpecial && item.active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md blur-sm opacity-30 -z-10"></div>
                )}
                
                {/* Trial warning indicator */}
                {isSpecial && !isPremium && hasAccess && trialDaysRemaining <= 3 && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse">
                      <div className="w-full h-full bg-orange-400 rounded-full animate-ping"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </nav>
      </CardContent>
    </Card>
  );
}
