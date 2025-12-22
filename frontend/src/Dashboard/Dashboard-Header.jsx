import React, { useState } from "react";
import { Bell } from "lucide-react";

export function DashboardHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-blue px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <h1 className="text-xl font-bold color-blue">Focusphere</h1>
        <div className="hidden md:flex md:w-80">
          <div className="relative w-full">
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Bell className="h-5 w-5 text-gray-700" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500"></span>
          <span className="sr-only">Notifications</span>
        </button>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="User"
              className="h-8 w-8 rounded-full"
            />
            <span className="sr-only">User menu</span>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-2">
                <span className="block text-sm font-medium text-gray-700">My Account</span>
              </div>
              <div className="border-t border-gray-100"></div>
              <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">
                Profile
              </button>
              <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">
                Settings
              </button>
              <div className="border-t border-gray-100"></div>
              <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}