import React from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, List, X, Sparkles } from 'lucide-react';
import { DEPARTMENTS, SortField, SortOrder } from '../types';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  sortBy: SortField;
  onSortByChange: (field: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
  totalEmployees: number;
  onClearFilters: () => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  viewMode,
  onViewModeChange,
  totalFiltered,
  totalEmployees,
  onClearFilters,
}) => {
  const isFiltered = searchTerm.trim() !== '' || selectedDepartment !== 'ALL';

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-violet-100 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-violet-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, title, email, or department..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
            id="search-employee-input"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Department Filter Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-violet-500 pointer-events-none">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all appearance-none cursor-pointer"
              id="department-select-filter"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Field */}
          <div className="relative flex items-center">
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortField)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all cursor-pointer"
              id="sort-by-select"
            >
              <option value="fullName">Sort: Full Name</option>
              <option value="salary">Sort: Salary</option>
              <option value="dateOfHire">Sort: Date of Hire</option>
              <option value="jobTitle">Sort: Job Title</option>
              <option value="department">Sort: Department</option>
            </select>
          </div>

          {/* Sort Order Toggle */}
          <button
            onClick={onSortOrderToggle}
            className="p-2 bg-slate-50 border border-slate-200 hover:border-violet-300 hover:bg-violet-50 rounded-xl text-slate-700 transition-all flex items-center gap-1 text-xs font-semibold"
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            id="sort-order-btn"
          >
            <ArrowUpDown className="w-4 h-4 text-violet-600" />
            <span className="uppercase text-[11px] font-bold text-violet-700">{sortOrder}</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-violet-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
              id="view-grid-btn"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-violet-700 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
              id="view-table-btn"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Results Bar & Active Filter Pills */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>
            Showing <strong className="text-slate-900 font-bold">{totalFiltered}</strong> of{' '}
            <strong className="text-slate-900 font-bold">{totalEmployees}</strong> employees
          </span>
        </div>

        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 transition-colors underline"
            id="clear-filters-btn"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>

    </div>
  );
};
