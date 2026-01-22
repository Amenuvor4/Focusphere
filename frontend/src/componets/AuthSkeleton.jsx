export function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md animate-pulse">
        {/* Logo skeleton */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Title skeleton */}
        <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded mx-auto mb-8"></div>

        {/* Input fields skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
          <div className="h-12 w-full bg-gray-100 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-12 w-full bg-gray-200 dark:bg-slate-700 rounded-lg mt-6"></div>

        {/* Divider skeleton */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
          <div className="h-4 w-8 bg-gray-200 dark:bg-slate-700 rounded mx-4"></div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
        </div>

        {/* OAuth button skeleton */}
        <div className="h-12 w-full bg-gray-200 dark:bg-slate-700 rounded-lg"></div>

        {/* Footer skeleton */}
        <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded mx-auto mt-6"></div>
      </div>
    </div>
  );
}

export function AuthLoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-slate-700 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
          Authenticating...
        </p>
      </div>
    </div>
  );
}

export default AuthSkeleton;
