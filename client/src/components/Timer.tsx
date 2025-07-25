import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/contexts/TimerContext';
import { Play, Pause, RotateCcw, FastForward, Crown } from 'lucide-react';

export default function Timer() {
  const { timerState, startTimer, pauseTimer, resumeTimer, resetTimer, skipSession } = useTimer();
  const [selectedPreset, setSelectedPreset] = useState<'25/5' | '50/10' | '90/15' | 'custom'>('25/5');

  const presets = {
    '25/5': { focus: 1500, break: 300 }, // 25min focus, 5min break
    '50/10': { focus: 3000, break: 600 }, // 50min focus, 10min break
    '90/15': { focus: 5400, break: 900 }, // 90min focus, 15min break
    'custom': { focus: 1500, break: 300 }, // Default, but customizable
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSessionTypeDisplay = () => {
    if (timerState.type === 'focus') return 'Focus Session';
    if (timerState.type === 'break') return 'Short Break';
    if (timerState.type === 'long_break') return 'Long Break';
    return 'Session';
  };

  const handleStartTimer = () => {
    if (!timerState.isRunning && timerState.timeRemaining === timerState.duration) {
      // Starting a new session
      const preset = presets[selectedPreset];
      const duration = timerState.type === 'focus' ? preset.focus : preset.break;
      startTimer(timerState.type, duration);
    } else {
      // Resume existing session
      resumeTimer();
    }
  };

  const handlePresetChange = (preset: '25/5' | '50/10' | '90/15' | 'custom') => {
    if (timerState.isRunning) return; // Don't change presets while timer is running
    setSelectedPreset(preset);
  };

  // Calculate progress for the circle
  const progress = timerState.duration > 0 ? (timerState.duration - timerState.timeRemaining) / timerState.duration : 0;
  const circumference = 2 * Math.PI * 150; // radius = 150
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <Card className="p-8">
      <CardContent className="p-0">
        {/* Timer Presets */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button
            variant={selectedPreset === '25/5' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('25/5')}
            disabled={timerState.isRunning}
          >
            25/5 min
          </Button>
          <Button
            variant={selectedPreset === '50/10' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('50/10')}
            disabled={timerState.isRunning}
          >
            50/10 min
          </Button>
          <Button
            variant={selectedPreset === '90/15' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('90/15')}
            disabled={timerState.isRunning}
          >
            90/15 min
          </Button>
          <Button
            variant={selectedPreset === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('custom')}
            disabled={timerState.isRunning}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 hover:from-yellow-500 hover:to-yellow-700"
          >
            <Crown className="w-4 h-4 mr-1" />
            Custom
          </Button>
        </div>

        {/* Timer Circle */}
        <div className="flex flex-col items-center">
          <div className="relative w-80 h-80 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 340 340">
              {/* Background circle */}
              <circle
                cx="170"
                cy="170"
                r="150"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted-foreground/20"
              />
              {/* Progress circle */}
              <circle
                cx="170"
                cy="170"
                r="150"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-primary transition-all duration-300 ease-in-out"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-bold mb-2">
                {formatTime(timerState.timeRemaining)}
              </div>
              <div className="text-lg text-muted-foreground">
                {getSessionTypeDisplay()}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Session {timerState.currentCycle} of 4
              </div>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-6">
            <Button
              variant="outline"
              size="icon"
              onClick={resetTimer}
              disabled={timerState.timeRemaining === timerState.duration}
              className="w-12 h-12 rounded-full"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            <Button
              size="lg"
              onClick={timerState.isRunning ? pauseTimer : handleStartTimer}
              className="w-16 h-16 rounded-full text-2xl"
            >
              {timerState.isRunning ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={skipSession}
              disabled={!timerState.sessionId}
              className="w-12 h-12 rounded-full"
            >
              <FastForward className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
