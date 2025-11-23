import React from "react"

export function AppFooter() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-sm text-slate-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
            <span className="text-white text-[10px] font-semibold">T</span>
          </div>
          <span>Taskara</span>
        </div>
        <div className="flex items-center gap-4">
          <span>&copy; {new Date().getFullYear()} Taskara</span>
          <span className="hidden sm:inline">All rights reserved</span>
        </div>
      </div>
    </footer>
  )
}

