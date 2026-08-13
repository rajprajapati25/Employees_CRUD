import React, { useState } from 'react';
import { Employee } from '../types';
import { Edit3, Trash2, Mail, Calendar, DollarSign, Building2, Eye, Copy, Check } from 'lucide-react';

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onViewDetails: (emp: Employee) => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const [imgError, setImgError] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

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
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(employee.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const avatarSrc = imgError || !employee.icon 
    ? '/emp_icons/default_avatar.svg' 
    : employee.icon;

  return (
    <div className="bg-white rounded-2xl border border-violet-100 hover:border-violet-300 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      
      {/* Top Card Section */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          
          {/* Avatar Icon */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-violet-50 ring-2 ring-violet-200 group-hover:ring-violet-400 transition-all flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={avatarSrc}
                alt={employee.fullName}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 ring-2 ring-white rounded-full" title="Active Employee" />
          </div>

          {/* Department Badge */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 uppercase tracking-wide">
            <Building2 className="w-3 h-3 text-violet-500" />
            {employee.department || 'General'}
          </span>
        </div>

        {/* Employee Name & Job Title */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-1">
            {employee.fullName}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 line-clamp-1">
            {employee.jobTitle}
          </p>
        </div>

        {/* Info Grid */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
          
          {/* Salary */}
          <div className="flex items-center justify-between text-slate-700 bg-slate-50/80 p-2 rounded-xl">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-violet-600" />
              Annual Salary:
            </span>
            <span className="font-bold text-violet-700 text-sm">
              {formatCurrency(Number(employee.salary) || 0)}
            </span>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between text-slate-600 px-1">
            <a
              href={`mailto:${employee.email}`}
              className="flex items-center gap-1.5 hover:text-violet-600 transition-colors truncate max-w-[200px]"
              title={`Send email to ${employee.email}`}
            >
              <Mail className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </a>
            <button
              onClick={handleCopyEmail}
              className="p-1 hover:bg-violet-50 rounded text-slate-400 hover:text-violet-600 transition-colors"
              title="Copy email address"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Date of Hire */}
          <div className="flex items-center justify-between text-slate-600 px-1">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              Hired:
            </span>
            <span className="font-semibold text-slate-800">{formatDate(employee.dateOfHire)}</span>
          </div>

        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-violet-100 flex items-center justify-between">
        <button
          onClick={() => onViewDetails(employee)}
          className="text-xs font-semibold text-violet-700 hover:text-violet-900 flex items-center gap-1 hover:underline"
          title="View profile details"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(employee)}
            className="p-1.5 text-slate-600 hover:text-violet-700 hover:bg-violet-100/60 rounded-lg transition-colors"
            title="Edit employee"
            id={`edit-btn-${employee.id}`}
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(employee)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete employee"
            id={`delete-btn-${employee.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
