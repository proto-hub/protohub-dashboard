import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Calculator, Sparkles } from 'lucide-react';
import { parseNum } from '../utils/storage';

export const ProjectModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  projectToEdit, 
  existingProjects 
}) => {
  const isEditing = Boolean(projectToEdit);

  // Form State
  const [formData, setFormData] = useState({
    serialNumber: 1,
    customerId: '',
    customerName: '',
    customerNumber: '',
    collegeName: 'Valliammai Engineering College',
    summary: '',
    date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
    quantity: 1,
    discountPercent: 'NA',
    type: 'Income',
    modeOfPayment: 'UPI',
    actualPrice: 4000,
    discountedPrice: 'NA',
    referralDiscount: 'NA',
    advance: '-',
    remaining: '-',
    total: 4000,
    projectStatus: 'Delivered',
    paymentStatus: 'Paid',
    notes: '-',
    year: new Date().getFullYear()
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        ...projectToEdit,
        serialNumber: projectToEdit.serialNumber || 1,
        year: Number(projectToEdit.year) || new Date().getFullYear(),
      });
    } else {
      // Auto compute next serial number and suggest customer ID
      const nextSerial = existingProjects.length > 0 
        ? Math.max(...existingProjects.map(p => Number(p.serialNumber) || 0)) + 1 
        : 1;

      // Find highest customer number e.g. C22 -> C23
      let nextCID = 'C01';
      const cids = existingProjects
        .map(p => p.customerId)
        .filter(c => typeof c === 'string' && c.startsWith('C'))
        .map(c => parseInt(c.replace('C', ''), 10))
        .filter(n => !isNaN(n));
      if (cids.length > 0) {
        const maxC = Math.max(...cids) + 1;
        nextCID = `C${maxC < 10 ? '0' + maxC : maxC}`;
      }

      setFormData({
        serialNumber: nextSerial,
        customerId: nextCID,
        customerName: '',
        customerNumber: '',
        collegeName: 'Valliammai Engineering College',
        summary: '',
        date: new Date().toLocaleDateString('en-GB'),
        quantity: 1,
        discountPercent: 'NA',
        type: 'Income',
        modeOfPayment: 'UPI',
        actualPrice: 4000,
        discountedPrice: 'NA',
        referralDiscount: 'NA',
        advance: '-',
        remaining: '-',
        total: 4000,
        projectStatus: 'Delivered',
        paymentStatus: 'Paid',
        notes: '-',
        year: new Date().getFullYear()
      });
    }
    setErrors({});
  }, [projectToEdit, isOpen, existingProjects]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto update total if actualPrice or discounts change
      if (field === 'actualPrice' || field === 'discountedPrice' || field === 'referralDiscount') {
        const actual = parseNum(field === 'actualPrice' ? value : prev.actualPrice);
        const disc = parseNum(field === 'discountedPrice' ? value : prev.discountedPrice);
        const refDisc = parseNum(field === 'referralDiscount' ? value : prev.referralDiscount);
        
        if (prev.type === 'Expenditure') {
          updated.total = 0;
        } else {
          const calculatedTotal = Math.max(0, actual - disc - refDisc);
          updated.total = calculatedTotal;
        }
      }

      if (field === 'type' && value === 'Expenditure') {
        updated.total = 0;
        updated.projectStatus = 'Recharge';
      }

      return updated;
    });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleCalculateTotal = () => {
    const actual = parseNum(formData.actualPrice);
    const disc = parseNum(formData.discountedPrice);
    const refDisc = parseNum(formData.referralDiscount);
    const calculatedTotal = Math.max(0, actual - disc - refDisc);
    handleChange('total', calculatedTotal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.summary.trim()) {
      newErrors.summary = 'Project summary / description is required';
    }
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const cleanedData = {
      ...formData,
      id: formData.id || `${formData.year}-${Date.now()}`,
      serialNumber: Number(formData.serialNumber) || 1,
      year: Number(formData.year) || 2026,
      actualPrice: parseNum(formData.actualPrice),
      total: parseNum(formData.total),
      quantity: Number(formData.quantity) || 1
    };

    onSave(cleanedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {isEditing ? <Save className="w-5 h-5 text-cyan-400" /> : <PlusCircle className="w-5 h-5 text-cyan-400" />}
              {isEditing ? 'Edit Project / Transaction Record' : 'Add New Project / Transaction'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Fill in all transaction details. All dashboards and totals update automatically in real-time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-5 pr-2 space-y-6 flex-1">
          
          {/* Section 1: Customer & Basic Meta */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-l-2 border-cyan-400 pl-2">
              Customer & Identification
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Serial Number
                </label>
                <input
                  type="number"
                  value={formData.serialNumber}
                  onChange={(e) => handleChange('serialNumber', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Customer ID
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) => handleChange('customerId', e.target.value)}
                  placeholder="e.g. C01, C23"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Year
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => handleChange('year', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Date (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className={`w-full bg-slate-950 border ${errors.date ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="e.g. Jerome Samuel"
                  className={`w-full bg-slate-950 border ${errors.customerName ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none`}
                  required
                />
                {errors.customerName && <p className="text-[11px] text-rose-400 mt-1">{errors.customerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Customer Phone Number
                </label>
                <input
                  type="text"
                  value={formData.customerNumber}
                  onChange={(e) => handleChange('customerNumber', e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  College / Institution Name
                </label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => handleChange('collegeName', e.target.value)}
                  placeholder="e.g. Valliammai Engineering College"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Project Specifications */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-l-2 border-cyan-400 pl-2">
              Project & Service Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Summary / Project Name *
                </label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  placeholder="e.g. Infant Cry Classification, Ransomware Detection"
                  className={`w-full bg-slate-950 border ${errors.summary ? 'border-rose-500' : 'border-slate-700'} rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none`}
                  required
                />
                {errors.summary && <p className="text-[11px] text-rose-400 mt-1">{errors.summary}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Pricing Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-l-2 border-cyan-400 pl-2">
                Financial Breakdown & Payment
              </h4>
              <button
                type="button"
                onClick={handleCalculateTotal}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" /> Auto Calculate Total
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Type (Income / Expenditure)
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-semibold text-cyan-400"
                >
                  <option value="Income">Income (Revenue)</option>
                  <option value="Expenditure">Expenditure (Expense)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Actual Price (Rs)
                </label>
                <input
                  type="number"
                  value={formData.actualPrice}
                  onChange={(e) => handleChange('actualPrice', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Discount ( % )
                </label>
                <input
                  type="text"
                  value={formData.discountPercent}
                  onChange={(e) => handleChange('discountPercent', e.target.value)}
                  placeholder="e.g. 12.5 or NA"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Discounted Price (Rs)
                </label>
                <input
                  type="text"
                  value={formData.discountedPrice}
                  onChange={(e) => handleChange('discountedPrice', e.target.value)}
                  placeholder="e.g. 500 or NA"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Referral Discount (Rs)
                </label>
                <input
                  type="text"
                  value={formData.referralDiscount}
                  onChange={(e) => handleChange('referralDiscount', e.target.value)}
                  placeholder="e.g. 500 or NA"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Advance (Rs)
                </label>
                <input
                  type="text"
                  value={formData.advance}
                  onChange={(e) => handleChange('advance', e.target.value)}
                  placeholder="e.g. - or 1000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Remaining (Rs)
                </label>
                <input
                  type="text"
                  value={formData.remaining}
                  onChange={(e) => handleChange('remaining', e.target.value)}
                  placeholder="e.g. - or 500"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Total Realized (Rs) *
                </label>
                <input
                  type="number"
                  value={formData.total}
                  onChange={(e) => handleChange('total', e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-3.5 py-2 text-base text-cyan-400 font-bold focus:border-cyan-400 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Mode of Payment
                </label>
                <select
                  value={formData.modeOfPayment}
                  onChange={(e) => handleChange('modeOfPayment', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="GPay / PhonePe">GPay / PhonePe</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Project Status
                </label>
                <select
                  value={formData.projectStatus}
                  onChange={(e) => handleChange('projectStatus', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Delivered">Delivered</option>
                  <option value="Project Running">Project Running</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Recharge">Recharge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Notes / Additional Remarks
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="-"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer transition"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
