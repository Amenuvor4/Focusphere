export const AIAssistantSkeleton = () => (
  <div className="flex h-[calc(100vh-4rem)] gap-4 animate-pulse">
    <div className="w-64 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-slate-700">
        <div className="w-full h-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-2 border-b border-gray-200 dark:border-slate-700">
        <div className="w-full h-8 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
      </div>
      
      <div className="flex-1 overflow-hidden p-2 space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="p-2.5 rounded-lg bg-gray-100 dark:bg-slate-700/50 space-y-2"
          >
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Main Chat Area Skeleton */}
    <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
        <div className="h-5 w-5 bg-gray-200 dark:bg-slate-700 rounded"></div>
        <div className="h-6 w-40 bg-gray-200 dark:bg-slate-700 rounded"></div>
      </div>

      {/* Messages Area Skeleton */}
      <div className="flex-1 overflow-hidden p-6 space-y-8">
        {/* Welcome Section Skeleton */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center opacity-20"></div>

          <div className="text-center space-y-2 w-full max-w-md">
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mx-auto"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded mx-auto"></div>
            <div className="h-4 w-4/5 bg-gray-200 dark:bg-slate-700 rounded mx-auto"></div>
          </div>

          {/* Suggestion Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-gray-100 dark:bg-slate-700/50 border-2 border-gray-200 dark:border-slate-700 rounded-lg p-4 space-y-2"
              >
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Messages Skeleton (Alternative view) */}
        <div className="space-y-6 hidden">
          {/* User Message */}
          <div className="flex justify-end">
            <div className="max-w-[70%] h-16 w-2/3 bg-gray-200 dark:bg-slate-700 rounded-2xl"></div>
          </div>

          {/* Assistant Message */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-4/5 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>

          {/* Action Card */}
          <div className="ml-12 border-2 border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-gray-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 rounded-lg p-4 space-y-2">
              <div className="h-4 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
              <div className="flex-1 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900/50">
        <div className="flex gap-2 items-center">
          <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="flex-1 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
          <div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);
