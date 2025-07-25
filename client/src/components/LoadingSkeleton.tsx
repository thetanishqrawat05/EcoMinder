import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-4/6"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-3/4"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mx-auto"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mx-auto"></div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}