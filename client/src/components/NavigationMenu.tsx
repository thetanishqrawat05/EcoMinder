import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, BarChart3, History, Settings, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';

export default function NavigationMenu() {
  const [location] = useLocation();

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
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                variant={item.active ? 'default' : 'ghost'}
                className={`w-full justify-start space-x-3 ${
                  item.active ? 'bg-primary/10 text-primary' : ''
                }`}
                onClick={() => handleNavigation(item.href)}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Button>
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
