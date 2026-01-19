export const GoalsListSkeleton = () => (
  <div className="w-full animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-6 flex justify-between items-center">
      <div>
        <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-4 w-56 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
    </div>

    {/* Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="border-b border-gray-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          <div className="p-4">
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            
            <div className="h-2 w-full bg-gray-200 dark:bg-slate-700 rounded-full mb-4"></div>
            
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);