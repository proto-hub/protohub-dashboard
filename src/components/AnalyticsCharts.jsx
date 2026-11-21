import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Percent,
  Wallet,
  Building2,
  Calendar
} from 'lucide-react';
import { parseNum, formatCurrency } from '../utils/storage';

export const AnalyticsCharts = ({ projects }) => {
  const [incomeExpenseChartType, setIncomeExpenseChartType] = useState('bar'); // 'bar' | 'pie'

  // Dynamic calculations across all projects
  const analyticsData = useMemo(() => {
    // Unique years present in dataset
    const years = Array.from(new Set(projects.map(p => Number(p.year) || 2025))).sort((a, b) => a - b);

    // Per-year metrics
    const yearlyMetrics = years.map(yr => {
      const yearProjects = projects.filter(p => Number(p.year) === yr);

      let income = 0;
      let expense = 0;
      const customersSet = new Set();
      const collegesMap = {};

      yearProjects.forEach(item => {
        const itemType = (item.type || 'Income').trim().toLowerCase();
        const tot = parseNum(item.total);
        const act = parseNum(item.actualPrice);

        if (itemType === 'expenditure') {
          // If total is 0 or actualPrice is set, use actualPrice as expense
          expense += (act > 0 ? act : tot);
        } else {
          income += (tot > 0 ? tot : act);
        }

        if (item.customerName && item.customerName !== '-') {
          customersSet.add(item.customerName.trim().toLowerCase());
        }

        const college = (item.collegeName || 'Unknown').trim();
        collegesMap[college] = (collegesMap[college] || 0) + 1;
      });

      const netProfit = Math.max(0, income - expense);
      const profitRatio = income > 0 ? ((netProfit / income) * 100).toFixed(1) : 0;

      return {
        year: String(yr),
        income,
        expense,
        netProfit,
        profitRatio: parseFloat(profitRatio),
        customerCount: customersSet.size,
        totalOrders: yearProjects.length
      };
    });

    // Total Overall Income & Expense
    let grandIncome = 0;
    let grandExpense = 0;
    const allCustomers = new Set();
    const collegeDist = {};

    projects.forEach(item => {
      const itemType = (item.type || 'Income').trim().toLowerCase();
      const tot = parseNum(item.total);
      const act = parseNum(item.actualPrice);

      if (itemType === 'expenditure') {
        grandExpense += (act > 0 ? act : tot);
      } else {
        grandIncome += (tot > 0 ? tot : act);
      }

      if (item.customerName && item.customerName !== '-') {
        allCustomers.add(item.customerName.trim().toLowerCase());
      }

      const college = (item.collegeName || 'Other').trim();
      collegeDist[college] = (collegeDist[college] || 0) + 1;
    });

    const grandProfit = grandIncome - grandExpense;
    const grandProfitMargin = grandIncome > 0 ? ((grandProfit / grandIncome) * 100).toFixed(1) : 0;

    const pieDistribution = [
      { name: 'Income Realized', value: grandIncome, color: '#06b6d4' },
      { name: 'Expenditure', value: grandExpense, color: '#f43f5e' }
    ];

    // Top Institutions / Colleges
    const topColleges = Object.entries(collegeDist)
      .map(([name, count]) => ({
        name: name.length > 20 ? name.substring(0, 18) + '...' : name,
        fullName: name,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      years,
      yearlyMetrics,
      grandIncome,
      grandExpense,
      grandProfit,
      grandProfitMargin,
      totalCustomers: allCustomers.size,
      totalProjects: projects.length,
      pieDistribution,
      topColleges
    };
  }, [projects]);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
                {entry.name}:
              </span>
              <span className="font-mono font-semibold text-white">
                {entry.name.toLowerCase().includes('ratio') || entry.name.toLowerCase().includes('margin')
                  ? `${entry.value}%`
                  : entry.name.toLowerCase().includes('count') || entry.name.toLowerCase().includes('orders')
                  ? entry.value
                  : formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 3 Main Required Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. EXPENSE AND INCOME VIEW (PIE OR BAR CHART) */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cyan-400" />
                Income vs Expense
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial inflow vs expenditure analysis
              </p>
            </div>

            {/* Toggle Pie / Bar */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setIncomeExpenseChartType('bar')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  incomeExpenseChartType === 'bar'
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bar Chart View"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIncomeExpenseChartType('pie')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  incomeExpenseChartType === 'pie'
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Pie Chart View"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {incomeExpenseChartType === 'bar' ? (
                <BarChart data={analyticsData.yearlyMetrics} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="income" name="Income" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} iconType="circle" />
                  <Pie
                    data={analyticsData.pieDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={6}
                  >
                    {analyticsData.pieDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Mini Footnote Stats */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950/50 p-2 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Inflow</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">
                {formatCurrency(analyticsData.grandIncome)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-2 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Total Outflow</span>
              <span className="text-xs font-bold text-rose-400 font-mono">
                {formatCurrency(analyticsData.grandExpense)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. COUNT OF CUSTOMERS CHART FOR ALL YEARS */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Customer Growth by Year
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unique client volume and project orders
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
              {analyticsData.totalCustomers} Clients
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.yearlyMetrics} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Bar dataKey="customerCount" name="Unique Customers" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalOrders" name="Total Orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top College Breakdown Pills */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-400 block mb-1.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" /> Top Client Institutions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analyticsData.topColleges.slice(0, 3).map((col, idx) => (
                <span 
                  key={idx} 
                  title={col.fullName}
                  className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700/60 truncate max-w-[150px]"
                >
                  {col.name}: <strong className="text-emerald-400">{col.count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. PROFIT RATIO & INCOME COMPARISON ACROSS ALL YEARS */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-purple-400" />
                Profit Ratio & Net Income
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Net profit margin % & multi-year comparison
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-full font-mono">
              {analyticsData.grandProfitMargin}% Margin
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.yearlyMetrics} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#a855f7" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
                <Area yAxisId="left" type="monotone" dataKey="netProfit" name="Net Profit" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" />
                <Line yAxisId="right" type="monotone" dataKey="profitRatio" name="Profit Ratio %" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick YoY Insight */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Net Retained:</span>
            <span className="font-bold text-purple-300 font-mono">
              {formatCurrency(analyticsData.grandProfit)}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
