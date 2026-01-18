import React from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";

export function WelcomeBanner({ userName, stats = {totalTasks: 0, completedToday: 0, upcomingDeadlines: 0} }) {
  // Get current time to display appropriate greeting
  const currentHour = new Date().getHours();
  let greeting = "Good morning";

  if (currentHour >= 12 && currentHour < 17) {
    greeting = "Good afternoon";
  } else if (currentHour >= 17) {
    greeting = "Good evening";
  }

  return (
    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-blue-50 dark:from-blue-900/20 dark:to-slate-900 z-0"></div>

        <div className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            {/* Greeting Section */}
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold tracking-tight dark:text-white">
                {greeting}, {userName}!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Here's an overview of your tasks for today</p>
            </div>

            {/* Stats Section */}
            <div className="flex flex-wrap gap-4">
              {/* Total Tasks */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">{stats.totalTasks} Tasks</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
              </div>

              {/* Completed Today */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium dark:text-white">{stats.completedToday} Completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Today</p>
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40">
                  <CalendarClock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-mediu dark:text-white">{stats.upcomingDeadlines} Upcoming</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deadlines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}