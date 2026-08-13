import React, { useState } from 'react';
import { Employee } from '../types';
import { X, Mail, Calendar, DollarSign, Building2, Edit3, Briefcase, Check, Copy, UserCheck } from 'lucide-react';

interface EmployeeDetailsDrawerProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onEdit: (emp: Employee) => void;
}

export const EmployeeDetailsDrawer: React.FC<EmployeeDetailsDrawerProps> = ({
  isOpen,
  employee,
  onClose,
  onEdit,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen || !employee) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateTenure = (hireDateStr: string) => {
    try {
      const hireDate = new Date(hireDateStr);
      if (isNaN(hireDate.getTime())) return 'N/A';
      const now = new Date();
      const diffMs = now.getTime() - hireDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);

      if (years > 0) {
        return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
      } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      } else {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
      }
    } catch {
      return 'N/A';
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(employee.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const monthlySalary = Math.round((Number(employee.salary) || 0) / 12);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-violet-100 flex flex-col justify-between overflow-y-auto animate-slideLeft">
        
        {/* Top Header */}
        <div>
          <div className="p-6 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white ring-4 ring-white/30 shadow-lg mb-3">
                <img
                  src={employee.icon || '/emp_icons/default_avatar.svg'}
                  alt={employee.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/emp_icons/default_avatar.svg';
                  }}
                />
              </div>

              <h2 className="text-2xl font-bold tracking-tight">{employee.fullName}</h2>
              <p className="text-violet-200 font-medium text-sm mt-0.5">{employee.jobTitle}</p>
              
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                <Building2 className="w-3.5 h-3.5" />
                {employee.department || 'General'}
              </span>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6">
            
            {/* Quick Status */}
            <div className="bg-violet-50 p-4 rounded-2xl border border-violet-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-800 text-xs font-bold">
                <UserCheck className="w-4 h-4 text-violet-600" />
                <span>Employment Status</span>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold border border-emerald-200">
                Active Full-Time
              </span>
            </div>

            {/* Compensation Box */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Compensation Breakdown</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-violet-600" />
                    Annual Salary
                  </span>
                  <span className="font-extrabold text-violet-700 text-base">
                    {formatCurrency(Number(employee.salary) || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">Monthly Estimate</span>
                  <span className="font-bold text-slate-800">{formatCurrency(monthlySalary)} / mo</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-violet-600 shrink-0" />
                    <span className="font-semibold select-all">{employee.email}</span>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1.5 hover:bg-violet-100 rounded-lg text-slate-500 hover:text-violet-700 transition-colors"
                    title="Copy Email"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Hiring & Tenure */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tenure & Date of Hire</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-violet-600" />
                    Hire Date:
                  </span>
                  <span className="font-bold text-slate-800">{formatDate(employee.dateOfHire)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Service Duration:</span>
                  <span className="font-bold text-violet-700">{calculateTenure(employee.dateOfHire)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200/60 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-all flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Employee Profile</span>
          </button>
        </div>

      </div>
    </div>
  );
};
