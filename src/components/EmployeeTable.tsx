import React, { useState } from 'react';
import { Employee, SortField, SortOrder } from '../types';
import { Edit3, Trash2, Mail, Calendar, DollarSign, Building2, Eye, ArrowUpDown } from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (emp: Employee) => void;
  onDelete: (emp: Employee) => void;
  onViewDetails: (emp: Employee) => void;
  sortBy: SortField;
  onSortByChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
  onDelete,
  onViewDetails,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
}) => {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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

  const handleHeaderSort = (field: SortField) => {
    if (sortBy === field) {
      onSortOrderToggle();
    } else {
      onSortByChange(field);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          
          {/* Table Header */}
          <thead className="bg-violet-50/70 border-b border-violet-100 text-xs font-bold text-violet-900 uppercase tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4">Icon</th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-violet-100/60 transition-colors" onClick={() => handleHeaderSort('fullName')}>
                <div className="flex items-center gap-1.5">
                  <span>Full Name</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-violet-100/60 transition-colors" onClick={() => handleHeaderSort('jobTitle')}>
                <div className="flex items-center gap-1.5">
                  <span>Job Title</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-violet-100/60 transition-colors" onClick={() => handleHeaderSort('department')}>
                <div className="flex items-center gap-1.5">
                  <span>Department</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-violet-100/60 transition-colors" onClick={() => handleHeaderSort('salary')}>
                <div className="flex items-center gap-1.5">
                  <span>Salary</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4 cursor-pointer hover:bg-violet-100/60 transition-colors" onClick={() => handleHeaderSort('dateOfHire')}>
                <div className="flex items-center gap-1.5">
                  <span>Date of Hire</span>
                  <ArrowUpDown className="w-3.5 h-3.5 text-violet-500" />
                </div>
              </th>
              <th scope="col" className="py-3.5 px-4">Email</th>
              <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => {
              const avatarSrc = imgErrors[employee.id] || !employee.icon 
                ? '/emp_icons/default_avatar.svg' 
                : employee.icon;

              return (
                <tr 
                  key={employee.id} 
                  className="hover:bg-violet-50/30 transition-colors group cursor-pointer"
                  onClick={() => onViewDetails(employee)}
                >
                  
                  {/* Icon Avatar */}
                  <td className="py-3 px-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-50 border border-violet-200 shrink-0">
                      <img
                        src={avatarSrc}
                        alt={employee.fullName}
                        onError={() => setImgErrors(prev => ({ ...prev, [employee.id]: true }))}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </td>

                  {/* Full Name */}
                  <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                    {employee.fullName}
                  </td>

                  {/* Job Title */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {employee.jobTitle}
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                      <Building2 className="w-3 h-3 text-violet-500" />
                      {employee.department || 'General'}
                    </span>
                  </td>

                  {/* Salary */}
                  <td className="py-3 px-4 font-bold text-violet-700">
                    {formatCurrency(Number(employee.salary) || 0)}
                  </td>

                  {/* Date of Hire */}
                  <td className="py-3 px-4 text-slate-600 text-xs font-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-violet-500" />
                      <span>{formatDate(employee.dateOfHire)}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-xs font-medium text-slate-600">
                    <a
                      href={`mailto:${employee.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-violet-600 underline flex items-center gap-1"
                    >
                      <Mail className="w-3.5 h-3.5 text-violet-500" />
                      <span>{employee.email}</span>
                    </a>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => onViewDetails(employee)}
                        className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(employee)}
                        className="p-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors"
                        title="Edit employee"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(employee)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete employee"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>
      </div>
    </div>
  );
};
