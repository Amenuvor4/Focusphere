export const TaskListSkeleton = () => (
  <div className="w-full animate-pulse">
    {/* Banner Skeleton */}
    <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 rounded-xl p-6 border border-blue-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 w-72 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-16 bg-gray-200 dark:bg-slate-700 rounded mb-1"></div>
              <div className="h-3 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Actions Bar Skeleton */}
    <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-md"></div>

      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div className="h-10 w-full sm:w-64 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        </div>
      </div>
    </div>

    {/* Kanban Columns Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((col) => (
        <div
          key={col}
          className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-6 w-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md p-3"
              >
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="flex items-center justify-between mt-2">
                  <div className="h-3 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
