import React, { useState, useRef } from 'react';
import { 
  Receipt, 
  Download, 
  FileImage, 
  FileText, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  Phone, 
  Building, 
  User, 
  CreditCard, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { parseNum, formatCurrency } from '../utils/storage';

export const BillTab = ({ initialBillData, onSaveToDashboard }) => {
  // Today's date in DD/MM/YYYY
  const todayFormatted = new Date().toLocaleDateString('en-GB');

  // Form State
  const [billData, setBillData] = useState({
    invoiceNumber: `PH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialBillData?.date || todayFormatted,
    customerName: initialBillData?.customerName || '',
    customerNumber: initialBillData?.customerNumber || '',
    collegeName: initialBillData?.collegeName || 'Valliammai Engineering College',
    customerId: initialBillData?.customerId || '',
    projectName: initialBillData?.summary || '',
    quantity: initialBillData?.quantity || 1,
    actualPrice: initialBillData?.actualPrice ? parseNum(initialBillData.actualPrice) : 4000,
    discountPrice: initialBillData?.discountedPrice && initialBillData?.discountedPrice !== 'NA' ? parseNum(initialBillData.discountedPrice) : 0,
    referralDiscount: initialBillData?.referralDiscount && initialBillData?.referralDiscount !== 'NA' ? parseNum(initialBillData.referralDiscount) : 0,
    advancePaid: initialBillData?.advance && initialBillData?.advance !== '-' ? parseNum(initialBillData.advance) : 0,
    modeOfPayment: initialBillData?.modeOfPayment || 'UPI',
    paymentStatus: initialBillData?.paymentStatus || 'Paid',
    notes: 'Complete project files, source code & documentation included. Thank you for choosing ProtoHub!'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const billPreviewRef = useRef(null);

  // Computed values
  const actual = parseNum(billData.actualPrice);
  const discount = parseNum(billData.discountPrice);
  const refDiscount = parseNum(billData.referralDiscount);
  const totalNet = Math.max(0, actual - discount - refDiscount);
  const advance = parseNum(billData.advancePaid);
  const balanceRemaining = Math.max(0, totalNet - advance);

  const handleInputChange = (field, value) => {
    setBillData(prev => ({ ...prev, [field]: value }));
  };

  // Export to PNG
  const handleDownloadPNG = async () => {
    if (!billPreviewRef.current) return;
    setIsExporting(true);
    try {
      const element = billPreviewRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Ultra-high resolution crisp image
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ProtoHub_Bill_${billData.customerName ? billData.customerName.replace(/\s+/g, '_') : 'Receipt'}_${billData.invoiceNumber}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export bill as PNG:', err);
      alert('Error generating PNG bill. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleDownloadPDF = async () => {
    if (!billPreviewRef.current) return;
    setIsExporting(true);
    try {
      const element = billPreviewRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      // Standard A4: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ProtoHub_Bill_${billData.customerName ? billData.customerName.replace(/\s+/g, '_') : 'Receipt'}_${billData.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Failed to export bill as PDF:', err);
      alert('Error generating PDF bill. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Save to project records dashboard
  const handleSaveToProjectRecords = () => {
    if (!billData.customerName || !billData.projectName) {
      alert('Please enter both Customer Name and Project Name before saving to Dashboard.');
      return;
    }

    const newRecord = {
      id: `${new Date().getFullYear()}-${Date.now()}`,
      serialNumber: 1, // will be reassigned or auto incremented
      customerId: billData.customerId || 'C' + Math.floor(20 + Math.random() * 50),
      customerName: billData.customerName,
      customerNumber: billData.customerNumber,
      collegeName: billData.collegeName,
      summary: billData.projectName,
      date: billData.date,
      quantity: Number(billData.quantity) || 1,
      discountPercent: discount > 0 ? ((discount / actual) * 100).toFixed(1) : 'NA',
      type: 'Income',
      modeOfPayment: billData.modeOfPayment,
      actualPrice: actual,
      discountedPrice: discount > 0 ? discount : 'NA',
      referralDiscount: refDiscount > 0 ? refDiscount : 'NA',
      advance: advance > 0 ? advance : '-',
      remaining: balanceRemaining > 0 ? balanceRemaining : '-',
      total: totalNet,
      projectStatus: 'Delivered',
      paymentStatus: billData.paymentStatus,
      notes: billData.notes,
      year: new Date().getFullYear()
    };

    onSaveToDashboard(newRecord);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetForm = () => {
    setBillData({
      invoiceNumber: `PH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: todayFormatted,
      customerName: '',
      customerNumber: '',
      collegeName: 'Valliammai Engineering College',
      customerId: '',
      projectName: '',
      quantity: 1,
      actualPrice: 4000,
      discountPrice: 0,
      referralDiscount: 0,
      advancePaid: 0,
      modeOfPayment: 'UPI',
      paymentStatus: 'Paid',
      notes: 'Complete project files, source code & documentation included. Thank you for choosing ProtoHub!'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-cyan-400" />
            ProtoHub Customer Bill & Invoice Generator
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Fill in the customer and project details, preview the official receipt live, and download as PNG or PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <CheckCircle className="w-4 h-4" /> Added to Dashboard!
            </span>
          )}
          <button
            onClick={handleSaveToProjectRecords}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Grid: Form on Left, Live Bill Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (5 Cols on LG) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Bill Information
            </h3>
            <button
              onClick={handleResetForm}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Section: Customer Details */}
          <div className="space-y-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              1. Customer Particulars
            </span>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Customer Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={billData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="e.g. Lingeshwar, Jerome Samuel"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={billData.customerNumber}
                    onChange={(e) => handleInputChange('customerNumber', e.target.value)}
                    placeholder="9876543210"
                    className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Customer ID (Optional)
                </label>
                <input
                  type="text"
                  value={billData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  placeholder="e.g. C09"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                College / Organization
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={billData.collegeName}
                  onChange={(e) => handleInputChange('collegeName', e.target.value)}
                  placeholder="e.g. Valliammai Engineering College"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Project & Pricing Details */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              2. Project & Pricing
            </span>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Project Name / Summary *
              </label>
              <input
                type="text"
                value={billData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                placeholder="e.g. Ransomware detection real time"
                className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Actual Price (Rs) *
                </label>
                <input
                  type="number"
                  value={billData.actualPrice}
                  onChange={(e) => handleInputChange('actualPrice', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Discount Amount (Rs)
                </label>
                <input
                  type="number"
                  value={billData.discountPrice}
                  onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Referral Discount (Rs)
                </label>
                <input
                  type="number"
                  value={billData.referralDiscount}
                  onChange={(e) => handleInputChange('referralDiscount', e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Advance Paid (Rs)
                </label>
                <input
                  type="number"
                  value={billData.advancePaid}
                  onChange={(e) => handleInputChange('advancePaid', e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Quick Live Calc summary */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal (Actual):</span>
                <span className="font-mono">{formatCurrency(actual)}</span>
              </div>
              {(discount > 0 || refDiscount > 0) && (
                <div className="flex justify-between text-rose-400">
                  <span>Total Discounts:</span>
                  <span className="font-mono">- {formatCurrency(discount + refDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-cyan-400 font-bold border-t border-slate-800 pt-1 text-sm">
                <span>Total Net Payable:</span>
                <span className="font-mono">{formatCurrency(totalNet)}</span>
              </div>
            </div>
          </div>

          {/* Section: Payment & Metadata */}
          <div className="space-y-3.5 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block">
              3. Payment Particulars
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Payment Mode
                </label>
                <select
                  value={billData.modeOfPayment}
                  onChange={(e) => handleInputChange('modeOfPayment', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Google Pay">Google Pay</option>
                  <option value="PhonePe">PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Payment Status
                </label>
                <select
                  value={billData.paymentStatus}
                  onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white outline-none"
                >
                  <option value="Paid">Paid in Full</option>
                  <option value="Partial">Partial / Advance</option>
                  <option value="Pending">Payment Pending</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Bill / Invoice #
                </label>
                <input
                  type="text"
                  value={billData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="text"
                  value={billData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Download Buttons Bar */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-medium text-slate-400 block mb-1">
              Download Customer Bill:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadPNG}
                disabled={isExporting}
                className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live Printable Invoice Card (7 Cols on LG) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              Live Customer Invoice Preview
            </span>
            <span>A4 Document Proportion</span>
          </div>

          {/* INVOICE CARD CANVAS CONTAINER (Captured by html2canvas) */}
          <div 
            ref={billPreviewRef}
            className="w-full max-w-[620px] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden p-8 border border-slate-200"
            style={{ minHeight: '800px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            
            {/* Top Brand & Invoice Header */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 bg-slate-950 rounded-2xl p-2 flex items-center justify-center shadow-md">
                  <img 
                    src="/logo.png" 
                    alt="ProtoHub" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-950 flex items-center gap-1.5">
                    ProtoHub
                  </h1>
                  <p className="text-xs font-semibold text-cyan-600 tracking-wide uppercase">
                    Engineering & Project Solutions
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Official Customer Invoice & Receipt
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider mb-2 ${
                  billData.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : billData.paymentStatus === 'Partial'
                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                    : 'bg-rose-100 text-rose-700 border border-rose-300'
                }`}>
                  {billData.paymentStatus === 'Paid' ? 'PAID IN FULL' : billData.paymentStatus}
                </span>
                <p className="text-xs font-mono font-bold text-slate-800">
                  INV: {billData.invoiceNumber}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Date: <span className="font-medium text-slate-700">{billData.date}</span>
                </p>
              </div>
            </div>

            {/* Client & Billing Details Grid */}
            <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Billed To (Customer)
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {billData.customerName || 'Customer Name'}
                </h3>
                {billData.customerNumber && (
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    Ph: {billData.customerNumber}
                  </p>
                )}
                {billData.collegeName && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {billData.collegeName}
                  </p>
                )}
                {billData.customerId && (
                  <span className="inline-block mt-1 text-[10px] font-mono font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    ID: {billData.customerId}
                  </span>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Payment Particulars
                </span>
                <p className="text-xs font-medium text-slate-800">
                  Payment Mode: <strong className="font-mono text-cyan-700">{billData.modeOfPayment}</strong>
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Status: <strong className="text-slate-800">{billData.paymentStatus}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  ProtoHub Verification ID: <span className="font-mono font-bold">PH-VERIFIED</span>
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="mb-6">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-2">Item / Project Description</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Price (₹)</th>
                    <th className="py-2.5 px-2 text-right">Discount (₹)</th>
                    <th className="py-2.5 px-2 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr className="align-top">
                    <td className="py-3 px-2 font-medium">
                      <div className="font-bold text-slate-950 text-sm">
                        {billData.projectName || 'Project Engineering & Implementation'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Source code, documentation, PPT & deployment assistance
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono">
                      {billData.quantity || 1}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {actual.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-right font-mono text-rose-600">
                      {(discount + refDiscount) > 0 ? `- ${(discount + refDiscount).toLocaleString('en-IN')}` : '-'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-950">
                      {totalNet.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals Summary */}
            <div className="flex flex-col items-end pb-6 border-b border-slate-100">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Actual Amount:</span>
                  <span className="font-mono">₹{actual.toLocaleString('en-IN')}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount Applied:</span>
                    <span className="font-mono">- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {refDiscount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Referral Discount:</span>
                    <span className="font-mono">- ₹{refDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-950 font-extrabold text-base border-t-2 border-slate-900 pt-2">
                  <span>Total Net Paid:</span>
                  <span className="font-mono text-cyan-700">₹{totalNet.toLocaleString('en-IN')}</span>
                </div>

                {advance > 0 && (
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Advance Received:</span>
                    <span className="font-mono">₹{advance.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {balanceRemaining > 0 && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Balance Remaining:</span>
                    <span className="font-mono">₹{balanceRemaining.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes & Terms */}
            <div className="my-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Terms & Notes
              </span>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                "{billData.notes}"
              </p>
            </div>

            {/* Authorized Signature & Stamp */}
            <div className="mt-8 pt-4 flex items-end justify-between">
              <div>
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center text-cyan-600 text-[10px] font-bold uppercase text-center p-1 transform -rotate-12">
                  ProtoHub Seal
                </div>
              </div>

              <div className="text-right">
                <div className="h-10 border-b border-slate-400 w-44 ml-auto mb-1 flex items-end justify-center">
                  <span className="font-serif italic text-base text-slate-800">Authorized Signatory</span>
                </div>
                <p className="text-xs font-bold text-slate-900">ProtoHub Team</p>
                <p className="text-[10px] text-slate-500">Innovation & Project Solutions</p>
              </div>
            </div>

            {/* Footer Contact bar */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400">
              <p>ProtoHub • Helping students and creators build next-generation hardware and software prototypes.</p>
              <p className="mt-0.5">Thank you for your business!</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
