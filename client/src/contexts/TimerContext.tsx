import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequestLegacy } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface TimerState {
  sessionId: string | null;
  type: 'focus' | 'break' | 'long_break';
  duration: number; // in seconds
  timeRemaining: number;
  isRunning: boolean;
  isCompleted: boolean;
  sessionCount: number;
  currentCycle: number;
}

interface TimerContextType {
  timerState: TimerState;
  startTimer: (type: 'focus' | 'break' | 'long_break', duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const DEFAULT_TIMER_STATE: TimerState = {
  sessionId: null,
  type: 'focus',
  duration: 1500, // 25 minutes
  timeRemaining: 1500,
  isRunning: false,
  isCompleted: false,
  sessionCount: 0,
  currentCycle: 1,
};

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>(DEFAULT_TIMER_STATE);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: async (data: { type: string; duration: number; ambientSound?: string }) => {
      const response = await apiRequestLegacy('POST', '/api/timer/session', data);
      return response.json();
    },
    onSuccess: (session) => {
      setTimerState(prev => ({ ...prev, sessionId: session.id }));
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequestLegacy('PATCH', `/api/timer/session/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timer/sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics/summary'] });
    },
  });

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerState.isRunning && timerState.timeRemaining > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.isRunning, timerState.timeRemaining]);

  // Handle timer completion
  useEffect(() => {
    if (timerState.timeRemaining === 0 && timerState.isRunning) {
      completeSession();
    }
  }, [timerState.timeRemaining, timerState.isRunning]);

  const completeSession = useCallback(() => {
    if (timerState.sessionId) {
      updateSessionMutation.mutate({
        id: timerState.sessionId,
        updates: {
          isCompleted: true,
          completedDuration: timerState.duration,
          completedAt: new Date().toISOString(),
        },
      });
    }

    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
    }));

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusZen Timer Complete!', {
        body: `Your ${timerState.type} session is complete!`,
        icon: '/favicon.ico',
      });
    }

    // Show toast
    toast({
      title: 'Session Complete!',
      description: `Your ${timerState.type} session is finished.`,
    });

  }, [timerState.sessionId, timerState.duration, timerState.type, updateSessionMutation, toast]);

  const startTimer = useCallback((type: 'focus' | 'break' | 'long_break', duration: number) => {
    createSessionMutation.mutate({
      type,
      duration,
    });

    setTimerState(prev => ({
      ...prev,
      type,
      duration,
      timeRemaining: duration,
      isRunning: true,
      isCompleted: false,
      sessionCount: type === 'focus' ? prev.sessionCount + 1 : prev.sessionCount,
    }));
  }, [createSessionMutation]);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const resetTimer = useCallback(() => {
    if (timerState.sessionId) {
      updateSessionMutation.mutate({
        id: timerState.sessionId,
        updates: {
          completedDuration: timerState.duration - timerState.timeRemaining,
        },
      });
    }

    setTimerState(prev => ({
      ...prev,
      timeRemaining: prev.duration,
      isRunning: false,
    }));
  }, [timerState.sessionId, timerState.duration, timerState.timeRemaining, updateSessionMutation]);

  const skipSession = useCallback(() => {
    if (timerState.sessionId) {
      updateSessionMutation.mutate({
        id: timerState.sessionId,
        updates: {
          completedDuration: timerState.duration - timerState.timeRemaining,
        },
      });
    }

    setTimerState(DEFAULT_TIMER_STATE);
  }, [timerState.sessionId, timerState.duration, timerState.timeRemaining, updateSessionMutation]);

  return (
    <TimerContext.Provider value={{
      timerState,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      skipSession,
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

// Additional interface for premium components
export interface EnhancedTimerContextType extends TimerContextType {
  toggleTimer: () => void;
  timeRemaining: number;
  isRunning: boolean;
  currentSessionType: string;
  currentSessionId: string | null;
}

// Enhanced hook with additional utilities for premium components
export function useTimerContext(): EnhancedTimerContextType {
  const context = useTimer();
  
  const toggleTimer = useCallback(() => {
    if (context.timerState.isRunning) {
      context.pauseTimer();
    } else {
      context.resumeTimer();
    }
  }, [context]);

  return {
    ...context,
    toggleTimer,
    timeRemaining: context.timerState.timeRemaining,
    isRunning: context.timerState.isRunning,
    currentSessionType: context.timerState.type,
    currentSessionId: context.timerState.sessionId,
  };
}
