export function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 animate-pulse">
      {/* Header */}
      <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-6"></div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-4"
          ></div>
        ))}
      </div>

      {/* Profile Tab Content */}
      <div className="space-y-6">
        {/* Input Field 1 */}
        <div>
          <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-11 w-full bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Input Field 2 */}
        <div>
          <div className="h-4 w-28 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-11 w-full bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Additional setting row */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-600 rounded"></div>
            <div className="h-3 w-40 bg-gray-200 dark:bg-slate-600 rounded"></div>
          </div>
          <div className="h-6 w-12 bg-gray-200 dark:bg-slate-600 rounded-full"></div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 mt-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
        <div className="h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export default SettingsSkeleton;
