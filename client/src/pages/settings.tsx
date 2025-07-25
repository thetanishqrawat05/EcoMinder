import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useTheme } from '@/contexts/ThemeContext';
import { Settings as SettingsIcon, Bell, Volume2, Clock, Palette } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/user/settings'],
    enabled: isAuthenticated,
    retry: false,
  });

  const [formData, setFormData] = useState({
    dailyReminders: true,
    reminderTime: '09:00',
    soundVolume: 0.5,
    hapticFeedback: true,
    defaultSessionDuration: 1500, // 25 minutes
    defaultBreakDuration: 300, // 5 minutes
    longBreakDuration: 900, // 15 minutes
    sessionsUntilLongBreak: 4,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        dailyReminders: settings.dailyReminders ?? true,
        reminderTime: settings.reminderTime ?? '09:00',
        soundVolume: parseFloat(settings.soundVolume ?? '0.5'),
        hapticFeedback: settings.hapticFeedback ?? true,
        defaultSessionDuration: settings.defaultSessionDuration ?? 1500,
        defaultBreakDuration: settings.defaultBreakDuration ?? 300,
        longBreakDuration: settings.longBreakDuration ?? 900,
        sessionsUntilLongBreak: settings.sessionsUntilLongBreak ?? 4,
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/user/settings', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/settings'] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleSave = () => {
    updateSettingsMutation.mutate(formData);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
            <SettingsIcon className="w-8 h-8" />
            <span>Settings</span>
          </h1>
          <p className="text-muted-foreground">Customize your FocusZen experience</p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          {/* Timer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Timer Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="focusSession">Focus Session Duration</Label>
                  <div className="space-y-2">
                    <Slider
                      id="focusSession"
                      min={300} // 5 minutes
                      max={7200} // 2 hours
                      step={300} // 5 minute increments
                      value={[formData.defaultSessionDuration]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, defaultSessionDuration: value[0] }))}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {formatTime(formData.defaultSessionDuration)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Break Duration</Label>
                  <div className="space-y-2">
                    <Slider
                      id="breakDuration"
                      min={300} // 5 minutes
                      max={1800} // 30 minutes
                      step={300} // 5 minute increments
                      value={[formData.defaultBreakDuration]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, defaultBreakDuration: value[0] }))}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {formatTime(formData.defaultBreakDuration)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longBreak">Long Break Duration</Label>
                  <div className="space-y-2">
                    <Slider
                      id="longBreak"
                      min={900} // 15 minutes
                      max={3600} // 1 hour
                      step={300} // 5 minute increments
                      value={[formData.longBreakDuration]}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, longBreakDuration: value[0] }))}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground text-center">
                      {formatTime(formData.longBreakDuration)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longBreakInterval">Sessions Until Long Break</Label>
                  <Select
                    value={formData.sessionsUntilLongBreak.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sessionsUntilLongBreak: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 sessions</SelectItem>
                      <SelectItem value="3">3 sessions</SelectItem>
                      <SelectItem value="4">4 sessions</SelectItem>
                      <SelectItem value="5">5 sessions</SelectItem>
                      <SelectItem value="6">6 sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <span>Audio & Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="volume">Sound Volume</Label>
                <div className="space-y-2">
                  <Slider
                    id="volume"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[formData.soundVolume]}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, soundVolume: value[0] }))}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground text-center">
                    {Math.round(formData.soundVolume * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Haptic Feedback</Label>
                  <p className="text-sm text-muted-foreground">Vibration feedback on mobile devices</p>
                </div>
                <Switch
                  checked={formData.hapticFeedback}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hapticFeedback: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Daily Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to start your focus sessions</p>
                </div>
                <Switch
                  checked={formData.dailyReminders}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dailyReminders: checked }))}
                />
              </div>

              {formData.dailyReminders && (
                <div className="space-y-2">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, reminderTime: e.target.value }))}
                    className="w-full md:w-48"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={updateSettingsMutation.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
