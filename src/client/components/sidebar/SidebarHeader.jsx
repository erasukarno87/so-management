// SidebarHeader - Logo and header for Sidebar
import { Sparkles, ChevronLeft } from 'lucide-react';

export function SidebarHeader({ isExpanded, onToggle }) {
  return (
    <div
      className="relative h-[72px] flex items-center px-5 border-b border-white/5 cursor-pointer group hover:bg-white/[0.02] transition-all duration-300"
      onClick={onToggle}
    >
      <div className={`flex items-center gap-3 transition-all duration-500 ease-out min-w-0 ${isExpanded ? 'w-full' : 'justify-center w-full'}`}>
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <img src="/logo.png" alt="SOD Logo" className="w-7 h-7 object-contain relative z-10" />
          </div>
        </div>

        {isExpanded && (
          <div className="animate-slide-in">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Sales & Delivery
              </h1>
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Management System
            </p>
          </div>
        )}
      </div>

      {isExpanded && (
        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all duration-200 group/btn">
          <ChevronLeft className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

export default SidebarHeader;