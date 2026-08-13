import React from 'react';
import { Plus, UserPlus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group">
      
      {/* Hover Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
        <Plus className="w-3.5 h-3.5 text-violet-400" />
        <span>Add Employee or Image</span>
      </div>

      {/* Glowing FAB Button */}
      <button
        onClick={onClick}
        aria-label="Add Employee"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-violet-700 via-violet-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 hover:scale-108 active:scale-95 transition-all duration-200 ring-4 ring-white border border-violet-300 cursor-pointer"
        id="add-employee-fab-btn"
      >
        <Plus className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
        
        {/* Subtle Ring Glow Pulse */}
        <span className="absolute inset-0 rounded-full bg-violet-400/30 animate-ping pointer-events-none -z-10" />
      </button>

    </div>
  );
};
