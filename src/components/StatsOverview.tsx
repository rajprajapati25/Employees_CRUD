import React from 'react';
import { Employee } from '../types';
import { DollarSign, Briefcase, TrendingUp, Calendar, Building2 } from 'lucide-react';

interface StatsOverviewProps {
  employees: Employee[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ employees }) => {
  const totalEmployees = employees.length;
  
  const totalPayroll = employees.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  // Find department count
  const deptMap: Record<string, number> = {};
  employees.forEach(emp => {
    const dept = emp.department || 'General';
    deptMap[dept] = (deptMap[dept] || 0) + 1;
  });
  const topDept = Object.entries(deptMap).sort((a, b) => b[1] - a[1])[0];

  // Find newest hire
  const newestEmployee = [...employees].sort((a, b) => 
    new Date(b.dateOfHire).getTime() - new Date(a.dateOfHire).getTime()
  )[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Workforce Card */}
      <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600 rounded-l-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Workforce</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalEmployees}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-violet-500" />
              <span>{Object.keys(deptMap).length} Active Departments</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Total Payroll Card */}
      <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600 rounded-l-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Payroll</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalPayroll)}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Total compensation budget</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Average Salary Card */}
      <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600 rounded-l-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Salary</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(avgSalary)}</h3>
            <p className="text-xs text-slate-500 mt-1 truncate max-w-[150px]" title={topDept ? `Largest: ${topDept[0]} (${topDept[1]})` : 'N/A'}>
              {topDept ? `Top dept: ${topDept[0]}` : 'Per employee'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Addition Card */}
      <div className="bg-white rounded-2xl p-5 border border-violet-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-600 rounded-l-2xl" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Hire</p>
            <h3 className="text-base font-bold text-slate-900 mt-1 truncate max-w-[160px]" title={newestEmployee?.fullName || 'None'}>
              {newestEmployee ? newestEmployee.fullName : 'No records'}
            </h3>
            <p className="text-xs text-violet-600 font-medium mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              <span>{newestEmployee ? newestEmployee.dateOfHire : 'N/A'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};
