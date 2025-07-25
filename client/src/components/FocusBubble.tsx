import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, X } from 'lucide-react';
import { useTimerContext } from '@/contexts/TimerContext';

interface FocusBubbleProps {
  onClose: () => void;
}

export function FocusBubble({ onClose }: FocusBubbleProps) {
  const { timeRemaining, isRunning, toggleTimer, currentSessionType } = useTimerContext();
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <Card 
      className="fixed z-50 p-3 bg-white dark:bg-gray-800 shadow-lg border-2 border-blue-500 cursor-move select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        minWidth: '100px',
        maxWidth: '120px'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col items-center space-y-2 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </Button>
        
        <div className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
          {currentSessionType}
        </div>
        
        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
          {formatTime(timeRemaining)}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleTimer();
          }}
          className="w-full"
        >
          {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </Button>
      </div>
    </Card>
  );
}