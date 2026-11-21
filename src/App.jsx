import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { BillTab } from './components/BillTab';
import { PasswordModal } from './components/PasswordModal';
import { 
  getStoredProjects, 
  saveStoredProjects, 
  resetStoredProjects, 
  getAuthStatus, 
  setAuthStatus, 
  clearAllAuth, 
  parseNum 
} from './utils/storage';
import { LayoutDashboard, ReceiptText, ShieldCheck, Lock, Unlock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  // Stored Projects Data
  const [projects, setProjects] = useState([]);
  
  // Active Tab: 'dashboard' | 'bill' | 'home'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth state for tabs
  const [authStatus, setAuthStatusState] = useState({
    dashboard: false,
    bill: false
  });

  // Password Modal State
  const [pendingTab, setPendingTab] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Pre-fill bill data if initiated from dashboard
  const [billPrefillData, setBillPrefillData] = useState(null);

  // Load projects & session auth on initial mount
  useEffect(() => {
    const loaded = getStoredProjects();
    setProjects(loaded);

    const isDashAuth = getAuthStatus('dashboard');
    const isBillAuth = getAuthStatus('bill');

    setAuthStatusState({
      dashboard: isDashAuth,
      bill: isBillAuth
    });

    if (isDashAuth) {
      setActiveTab('dashboard');
    } else if (isBillAuth) {
      setActiveTab('bill');
    } else {
      setActiveTab('home'); // Welcoming portal if neither unlocked yet
    }
  }, []);

  // Save projects to localStorage whenever changed
  const handleSaveProject = (updatedProject) => {
    setProjects(prev => {
      const existsIndex = prev.findIndex(p => p.id === updatedProject.id);
      let newProjects;
      if (existsIndex >= 0) {
        newProjects = [...prev];
        newProjects[existsIndex] = updatedProject;
      } else {
        newProjects = [updatedProject, ...prev];
      }
      saveStoredProjects(newProjects);
      return newProjects;
    });
  };

  // Delete project
  const handleDeleteProject = (projectId) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== projectId);
      saveStoredProjects(filtered);
      return filtered;
    });
  };

  // Reset to default 2025/2026 data
  const handleResetData = () => {
    const defaultData = resetStoredProjects();
    setProjects(defaultData);
  };

  // Tab Selection with Password Verification
  const handleSelectTab = (tab) => {
    if (authStatus[tab]) {
      setActiveTab(tab);
    } else {
      setPendingTab(tab);
      setIsPasswordModalOpen(true);
    }
  };

  // On successful password entry
  const handleAuthSuccess = (tab) => {
    setAuthStatus(tab, true);
    setAuthStatusState(prev => ({ ...prev, [tab]: true }));
    setIsPasswordModalOpen(false);
    setActiveTab(tab);
    setPendingTab(null);
  };

  // Lock all sessions
  const handleLockAll = () => {
    clearAllAuth();
    setAuthStatusState({ dashboard: false, bill: false });
    setActiveTab('home');
  };

  // Quick Action: generate customer bill from existing dashboard row
  const handleGenerateBillFromProject = (project) => {
    setBillPrefillData(project);
    if (authStatus.bill) {
      setActiveTab('bill');
    } else {
      setPendingTab('bill');
      setIsPasswordModalOpen(true);
    }
  };

  // Total income for navbar
  const totalIncome = projects.reduce((acc, curr) => {
    if ((curr.type || 'Income').toLowerCase() === 'expenditure') return acc;
    const tot = parseNum(curr.total);
    const act = parseNum(curr.actualPrice);
    return acc + (tot > 0 ? tot : act);
  }, 0);

  const totalExpense = projects.reduce((acc, curr) => {
    if ((curr.type || 'Income').toLowerCase() !== 'expenditure') return acc;
    const tot = parseNum(curr.total);
    const act = parseNum(curr.actualPrice);
    return acc + (act > 0 ? act : tot);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Sleek Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        authStatus={authStatus}
        onLockAll={handleLockAll}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME / PORTAL (When neither tab is active or unlocked) */}
        {activeTab === 'home' && (
          <div className="max-w-4xl mx-auto py-12 space-y-12 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> ProtoHub Central Management System
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Project Tracker & <span className="text-cyan-400">Customer Invoicing</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Secure access portal for ProtoHub financial management, customer billing, and multi-year project records.
              </p>
            </div>

            {/* Two Portal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Dashboard */}
              <div 
                onClick={() => handleSelectTab('dashboard')}
                className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 p-7 rounded-3xl shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LayoutDashboard className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Project Dashboard
                      </h3>
                      {authStatus.dashboard ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
                          <Unlock className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs flex items-center gap-1 font-mono">
                          <Lock className="w-3.5 h-3.5" /> Protected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Track 2025 & 2026 sales, dynamic income vs expenditure charts, client growth, profit ratio, and full CRUD project editing.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Card 2: Bill Generator */}
              <div 
                onClick={() => handleSelectTab('bill')}
                className="group relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 p-7 rounded-3xl shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ReceiptText className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                        Customer Bill Generator
                      </h3>
                      {authStatus.bill ? (
                        <span className="text-emerald-400 text-xs flex items-center gap-1 font-mono">
                          <Unlock className="w-3.5 h-3.5" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-amber-400 text-xs flex items-center gap-1 font-mono">
                          <Lock className="w-3.5 h-3.5" /> Protected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Issue professional invoices for customers with project name, price, discount price, and instant download as both PNG and PDF.
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                  <span>Open Billing Tab</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            </div>

            {/* Quick credentials hint note */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Protected with secure passkeys:</span>
              </div>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span>Dashboard: <strong className="text-cyan-400">ProtoHub@Dashboard</strong></span>
                <span>Bill: <strong className="text-cyan-400">ProtoHub@Bill</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <DashboardTab
            projects={projects}
            onSaveProject={handleSaveProject}
            onDeleteProject={handleDeleteProject}
            onResetData={handleResetData}
            onGenerateBillFromProject={handleGenerateBillFromProject}
          />
        )}

        {/* VIEW 3: BILL TAB */}
        {activeTab === 'bill' && (
          <BillTab
            initialBillData={billPrefillData}
            onSaveToDashboard={handleSaveProject}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} ProtoHub. All rights reserved.</p>
          <p className="font-mono text-[11px]">Vercel & Git Ready • Dynamic Financial Management</p>
        </div>
      </footer>

      {/* Password Prompt Modal */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        tabName={pendingTab}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPendingTab(null);
        }}
        onSuccess={handleAuthSuccess}
      />

    </div>
  );
}

export default App;
