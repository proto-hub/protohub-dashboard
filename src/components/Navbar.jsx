import React from 'react';
import { LayoutDashboard, ReceiptText, Lock, Unlock, LogOut, TrendingUp, Sparkles } from 'lucide-react';

export const Navbar = ({ 
  activeTab, 
  onSelectTab, 
  authStatus, 
  onLockAll,
  totalIncome,
  totalExpense
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={() => onSelectTab(activeTab)}>
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shadow-md shadow-cyan-500/10 group-hover:border-cyan-500 transition-colors">
                <img 
                  src="/logo.png" 
                  alt="ProtoHub Logo" 
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 ring-1 ring-emerald-500/50"></span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  ProtoHub
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  2025 - 2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Project Tracker & Customer Billing Console
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner">
            
            {/* Dashboard Tab Button */}
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
              {authStatus.dashboard ? (
                <span className="flex items-center gap-1 text-[11px] font-normal px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 ml-1">
                  <Unlock className="w-3 h-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-normal px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 ml-1">
                  <Lock className="w-3 h-3" />
                </span>
              )}
            </button>

            {/* Bill Tab Button */}
            <button
              onClick={() => onSelectTab('bill')}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === 'bill'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ReceiptText className="w-4 h-4 shrink-0" />
              <span>Bill (Customer)</span>
              {authStatus.bill ? (
                <span className="flex items-center gap-1 text-[11px] font-normal px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 ml-1">
                  <Unlock className="w-3 h-3" />
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-normal px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 ml-1">
                  <Lock className="w-3 h-3" />
                </span>
              )}
            </button>
          </div>

          {/* Right Section: Quick Metric & Security Lock */}
          <div className="flex items-center gap-3">
            {/* Quick Income Badge */}
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400" /> All-Time Revenue
              </span>
              <span className="text-sm font-bold text-white font-mono">
                ₹{Number(totalIncome || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Lock All Button */}
            {(authStatus.dashboard || authStatus.bill) && (
              <button
                onClick={onLockAll}
                title="Lock all authenticated tabs"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-2 rounded-xl border border-slate-800 hover:border-rose-500/30 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lock All</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
