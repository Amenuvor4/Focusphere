export const AnalyticsSkeleton = () => (
  <div className="w-full animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
        <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>
      <div className="h-10 w-40 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
    </div>

    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="h-8 w-20 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="p-4">
            <div className="h-64 bg-gray-100 dark:bg-slate-900/50 rounded flex items-center justify-center">
              <div className="h-32 w-32 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Recent Activity Skeleton */}
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
