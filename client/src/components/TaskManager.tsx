import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Play, Check, Trash2, Timer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ListSkeleton } from './LoadingSkeleton';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  tags: string[];
  isCompleted: boolean;
  totalFocusTime: number;
  sessionCount: number;
  createdAt: string;
}

interface TaskManagerProps {
  onStartTaskSession: (taskId: string) => void;
}

export function TaskManager({ onStartTaskSession }: TaskManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'general',
    tags: [] as string[],
  });

  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: () => apiRequest('/api/tasks'),
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: any) => apiRequest('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsCreating(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        tags: [],
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...updates }: any) => apiRequest(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
  });

  const handleCreateTask = () => {
    if (newTask.title.trim()) {
      createTaskMutation.mutate(newTask);
    }
  };

  const toggleTaskComplete = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? new Date().toISOString() : null,
    });
  };

  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Task Manager</h2>
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        <ListSkeleton items={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Task Manager</h2>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <div className="flex gap-4">
              <Select
                value={newTask.priority}
                onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Category"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending || !newTask.title.trim()}
              >
                Create Task
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {tasks.map((task: Task) => (
          <Card key={task.id} className={`${task.isCompleted ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTaskComplete(task)}
                      className={`w-6 h-6 p-0 rounded-full border-2 ${
                        task.isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.isCompleted && <Check className="w-3 h-3" />}
                    </Button>
                    <h3 className={`font-semibold ${task.isCompleted ? 'line-through' : ''}`}>
                      {task.title}
                    </h3>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {formatFocusTime(task.totalFocusTime)}
                    </span>
                    <span>{task.sessionCount} sessions</span>
                    <Badge variant="outline">{task.category}</Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!task.isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => onStartTaskSession(task.id)}
                      className="flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Start Session
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTaskMutation.mutate(task.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No tasks yet. Create your first task to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}