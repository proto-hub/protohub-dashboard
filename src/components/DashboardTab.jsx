import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Download, 
  Search, 
  Filter, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FolderGit2, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AnalyticsCharts } from './AnalyticsCharts';
import { ProjectModal } from './ProjectModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { exportToCSV, parseNum, formatCurrency } from '../utils/storage';

export const DashboardTab = ({ 
  projects, 
  onSaveProject, 
  onDeleteProject, 
  onResetData, 
  onGenerateBillFromProject 
}) => {
  // Filters & Search
  const [selectedYear, setSelectedYear] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Available unique years in projects
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(projects.map(p => Number(p.year) || 2025))).sort((a, b) => b - a);
    return years;
  }, [projects]);

  // Filtered dataset
  const filteredProjects = useMemo(() => {
    return projects.filter(item => {
      // Year filter
      if (selectedYear !== 'All' && Number(item.year) !== Number(selectedYear)) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'All' && (item.type || 'Income').toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'All' && (item.projectStatus || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = (item.customerName || '').toLowerCase().includes(q);
        const matchesCID = (item.customerId || '').toLowerCase().includes(q);
        const matchesPhone = (item.customerNumber || '').includes(q);
        const matchesSummary = (item.summary || '').toLowerCase().includes(q);
        const matchesCollege = (item.collegeName || '').toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        return matchesName || matchesCID || matchesPhone || matchesSummary || matchesCollege || matchesNotes;
      }
      return true;
    });
  }, [projects, selectedYear, typeFilter, statusFilter, searchTerm]);

  // Summary Metrics based on currently filtered projects
  const metrics = useMemo(() => {
    let income = 0;
    let expense = 0;
    const clientSet = new Set();

    filteredProjects.forEach(item => {
      const isExp = (item.type || 'Income').trim().toLowerCase() === 'expenditure';
      const tot = parseNum(item.total);
      const act = parseNum(item.actualPrice);

      if (isExp) {
        expense += (act > 0 ? act : tot);
      } else {
        income += (tot > 0 ? tot : act);
      }

      if (item.customerName && item.customerName !== '-') {
        clientSet.add(item.customerName.trim().toLowerCase());
      }
    });

    const netProfit = income - expense;
    const margin = income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0;

    return {
      income,
      expense,
      netProfit,
      margin,
      clientsCount: clientSet.size,
      ordersCount: filteredProjects.length
    };
  }, [filteredProjects]);

  // Paginated Rows
  const totalPages = Math.ceil(filteredProjects.length / (rowsPerPage === 'All' ? filteredProjects.length || 1 : rowsPerPage));
  const displayedProjects = useMemo(() => {
    if (rowsPerPage === 'All') return filteredProjects;
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProjects.slice(start, start + rowsPerPage);
  }, [filteredProjects, currentPage, rowsPerPage]);

  const handleOpenAddModal = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
  };

  const handleResetWithConfirm = () => {
    if (window.confirm("Are you sure you want to reset all data back to the default 2025 & 2026 records?")) {
      onResetData();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner & KPI Stat Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <FolderGit2 className="w-6 h-6 text-cyan-400" />
              Project Income & Expense Dashboard
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Real-time financial performance, client records, and multi-year tracking ({selectedYear === 'All' ? 'All Years' : `Year ${selectedYear}`})
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportToCSV(projects, `ProtoHub_Financial_Records_${selectedYear}.csv`)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 shadow flex items-center gap-1.5 transition cursor-pointer"
              title="Download Excel / CSV"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Project</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Income */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Income</span>
              <span className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg"><DollarSign className="w-3.5 h-3.5" /></span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white font-mono">
              {formatCurrency(metrics.income)}
            </p>
            <span className="text-[11px] text-cyan-400/80 flex items-center gap-1 mt-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Realized revenue
            </span>
          </div>

          {/* Card 2: Expense */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Expenditure</span>
              <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg"><TrendingDown className="w-3.5 h-3.5" /></span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
              {formatCurrency(metrics.expense)}
            </p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              Hosting, recharges & costs
            </span>
          </div>

          {/* Card 3: Net Profit */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Net Profit</span>
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp className="w-3.5 h-3.5" /></span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {formatCurrency(metrics.netProfit)}
            </p>
            <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 mt-1 font-medium">
              Margin: {metrics.margin}%
            </span>
          </div>

          {/* Card 4: Customers */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Clients</span>
              <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg"><Users className="w-3.5 h-3.5" /></span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
              {metrics.clientsCount}
            </p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              Active student base
            </span>
          </div>

          {/* Card 5: Projects Delivered */}
          <div className="bg-slate-900/80 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Total Orders</span>
              <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><CheckCircle2 className="w-3.5 h-3.5" /></span>
            </div>
            <p className="text-xl sm:text-2xl font-black text-blue-300 font-mono">
              {metrics.ordersCount}
            </p>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
              Across selected filter
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Component */}
      <AnalyticsCharts projects={projects} />

      {/* Management & Data Table Section */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md space-y-5">
        
        {/* Table Controls / Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Year Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Year:
            </span>
            <button
              onClick={() => { setSelectedYear('All'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedYear === 'All'
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Years ({projects.length})
            </button>
            {availableYears.map(yr => (
              <button
                key={yr}
                onClick={() => { setSelectedYear(yr); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  Number(selectedYear) === Number(yr)
                    ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {yr} ({projects.filter(p => Number(p.year) === Number(yr)).length})
              </button>
            ))}
          </div>

          {/* Search & Extra Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search customer, project, phone..."
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Type Selector */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 outline-none"
            >
              <option value="All">All Types</option>
              <option value="Income">Income Only</option>
              <option value="Expenditure">Expenditure Only</option>
            </select>

            {/* Reset Data to Default */}
            <button
              onClick={handleResetWithConfirm}
              title="Reset records to default 2025/2026 data"
              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-amber-500/10 border border-slate-800 rounded-xl transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Records Table with full columns */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800/90 shadow-inner">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800 sticky top-0">
              <tr>
                <th className="py-3 px-3">S.No</th>
                <th className="py-3 px-3">Cust ID</th>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">College</th>
                <th className="py-3 px-4 min-w-[200px]">Project Summary</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Actual (₹)</th>
                <th className="py-3 px-3">Disc (%)</th>
                <th className="py-3 px-3">Disc (₹)</th>
                <th className="py-3 px-3">Ref (₹)</th>
                <th className="py-3 px-3">Adv / Rem</th>
                <th className="py-3 px-3 font-bold text-cyan-400">Total (₹)</th>
                <th className="py-3 px-3">Project Status</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Mode</th>
                <th className="py-3 px-3">Year</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {displayedProjects.length === 0 ? (
                <tr>
                  <td colSpan={20} className="text-center py-12 text-slate-500 text-sm">
                    No matching project records found. Try adjusting filters or search query.
                  </td>
                </tr>
              ) : (
                displayedProjects.map((p) => {
                  const isExp = (p.type || 'Income').toLowerCase() === 'expenditure';
                  return (
                    <tr 
                      key={p.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* S.No */}
                      <td className="py-3 px-3 font-mono text-slate-400 font-semibold">
                        #{p.serialNumber}
                      </td>

                      {/* Cust ID */}
                      <td className="py-3 px-3 font-mono font-medium text-cyan-400">
                        {p.customerId || '-'}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3 px-3 font-medium text-white">
                        {p.customerName}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {p.customerNumber || '-'}
                      </td>

                      {/* College */}
                      <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate" title={p.collegeName}>
                        {p.collegeName || '-'}
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-4 font-semibold text-slate-200 max-w-[240px] truncate" title={p.summary}>
                        {p.summary}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {p.date}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2 text-center font-mono text-slate-300">
                        {p.quantity || 1}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isExp 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}>
                          {p.type || 'Income'}
                        </span>
                      </td>

                      {/* Actual Price */}
                      <td className="py-3 px-3 font-mono text-slate-300">
                        ₹{Number(p.actualPrice || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Discount % */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {p.discountPercent !== 'NA' && p.discountPercent ? `${p.discountPercent}%` : '-'}
                      </td>

                      {/* Discount Rs */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {p.discountedPrice !== 'NA' && p.discountedPrice ? `₹${p.discountedPrice}` : '-'}
                      </td>

                      {/* Referral Discount */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {p.referralDiscount !== 'NA' && p.referralDiscount ? `₹${p.referralDiscount}` : '-'}
                      </td>

                      {/* Advance / Remaining */}
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {p.advance !== '-' && p.advance ? `A: ₹${p.advance}` : ''}
                        {p.remaining !== '-' && p.remaining ? ` | R: ₹${p.remaining}` : '-'}
                      </td>

                      {/* Total */}
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400">
                        ₹{Number(p.total || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Project Status */}
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          p.projectStatus === 'Delivered' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : p.projectStatus === 'Recharge'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {p.projectStatus || 'Active'}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {p.paymentStatus || 'Paid'}
                        </span>
                      </td>

                      {/* Mode */}
                      <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                        {p.modeOfPayment || 'UPI'}
                      </td>

                      {/* Year */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-300">
                        {p.year}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Generate Bill button */}
                          <button
                            onClick={() => onGenerateBillFromProject(p)}
                            title="Generate Customer Bill"
                            className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-lg transition cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            title="Edit Record"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => setProjectToDelete(p)}
                            title="Delete Record"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Pagination & Record Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{displayedProjects.length}</strong> of{' '}
            <strong className="text-white">{filteredProjects.length}</strong> records (Total stored: {projects.length})
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 outline-none"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value="All">All</option>
              </select>
            </div>

            {rowsPerPage !== 'All' && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-40 hover:text-white cursor-pointer"
                >
                  Prev
                </button>
                <span className="px-2 font-mono text-cyan-400 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg disabled:opacity-40 hover:text-white cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add / Edit Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveProject}
        projectToEdit={projectToEdit}
        existingProjects={projects}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={(id) => {
          onDeleteProject(id);
          setProjectToDelete(null);
        }}
        project={projectToDelete}
      />

    </div>
  );
};
