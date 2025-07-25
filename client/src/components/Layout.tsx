import { ReactNode } from 'react';
import { Bell, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import NavigationMenu from './NavigationMenu';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleNotificationToggle = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface dark:bg-surface border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-foreground">FocusZen</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationToggle}
                className="hover:bg-primary/10"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="hover:bg-primary/10"
              >
                {theme === 'dark' ? (
                  <span className="text-lg">☀️</span>
                ) : (
                  <span className="text-lg">🌙</span>
                )}
              </Button>
              {user && (
                <div className="flex items-center space-x-2">
                  {user.profileImageUrl && (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium hidden sm:inline text-foreground">
                    {user.firstName || user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 p-6">
          <NavigationMenu />
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:pl-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface border-t border-border lg:hidden p-4 backdrop-blur-sm">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/'}
            className={`flex flex-col items-center space-y-1 ${
              window.location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs">Timer</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/analytics'}
            className={`flex flex-col items-center space-y-1 ${
              window.location.pathname === '/analytics' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs">Stats</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/history'}
            className={`flex flex-col items-center space-y-1 ${
              window.location.pathname === '/history' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-xl">🕒</span>
            <span className="text-xs">History</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/settings'}
            className={`flex flex-col items-center space-y-1 ${
              window.location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>

      {/* Add bottom padding for mobile navigation */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
