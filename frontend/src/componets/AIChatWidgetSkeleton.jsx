export const AIChatWidgetSkeleton = () => (
  <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[420px] flex-col rounded-lg bg-white dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 bg-white/20 rounded"></div>
        <div className="h-5 w-32 bg-white/20 rounded"></div>
      </div>
      <div className="h-5 w-5 bg-white/20 rounded-full"></div>
    </div>

    {/* Messages Area Skeleton */}
    <div className="flex-1 overflow-hidden p-4 space-y-4">
      {/* Assistant Message */}
      <div className="flex justify-start">
        <div className="max-w-[85%] bg-gray-200 dark:bg-slate-700 rounded-lg px-4 py-2 h-16 w-3/4"></div>
      </div>

      {/* User Message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-gray-200 dark:bg-slate-700 rounded-lg px-4 py-2 h-12 w-2/3"></div>
      </div>

      {/* Assistant Message */}
      <div className="flex justify-start">
        <div className="max-w-[85%] bg-gray-200 dark:bg-slate-700 rounded-lg px-4 py-2 h-20 w-4/5"></div>
      </div>

      {/* Action Card Skeleton */}
      <div className="mt-3 border-2 border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-2">
          <div className="h-3 w-full bg-gray-200 dark:bg-slate-700 rounded"></div>
          <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
          <div className="flex-1 h-10 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        </div>
      </div>
    </div>

    {/* Input Area Skeleton */}
    <div className="border-t border-gray-200 dark:border-slate-700 p-4">
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
        <div className="h-10 w-10 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
      </div>
      <div className="h-3 w-3/4 bg-gray-200 dark:bg-slate-700 rounded mt-2 mx-auto"></div>
    </div>
  </div>
);
