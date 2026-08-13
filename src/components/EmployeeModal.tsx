import React, { useState, useEffect, useRef } from 'react';
import { Employee, EmployeeFormData, DEPARTMENTS, DEFAULT_AVATARS } from '../types';
import { X, Upload, Image as ImageIcon, Sparkles, Check, DollarSign, Calendar, Mail, User, Briefcase, Building2, ChevronDown, PlusCircle } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: EmployeeFormData, isEdit: boolean) => Promise<void>;
  editingEmployee?: Employee | null;
  availableIcons?: string[];
  onOpenAddImageModal?: () => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingEmployee,
  availableIcons = DEFAULT_AVATARS,
  onOpenAddImageModal,
}) => {
  const isEdit = Boolean(editingEmployee);

  const [formData, setFormData] = useState<EmployeeFormData>({
    fullName: '',
    jobTitle: '',
    salary: '95000',
    email: '',
    dateOfHire: new Date().toISOString().split('T')[0],
    department: 'Engineering',
    icon: DEFAULT_AVATARS[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsIconDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        fullName: editingEmployee.fullName || '',
        jobTitle: editingEmployee.jobTitle || '',
        salary: String(editingEmployee.salary ?? 0),
        email: editingEmployee.email || '',
        dateOfHire: editingEmployee.dateOfHire || new Date().toISOString().split('T')[0],
        department: editingEmployee.department || 'Engineering',
        icon: editingEmployee.icon || availableIcons[0] || DEFAULT_AVATARS[0],
      });
    } else {
      // Default initial state for new employee
      const defaultIcon = availableIcons[0] || DEFAULT_AVATARS[0];
      setFormData({
        fullName: '',
        jobTitle: '',
        salary: '85000',
        email: '',
        dateOfHire: new Date().toISOString().split('T')[0],
        department: 'Engineering',
        icon: defaultIcon,
      });
    }
    setErrorMsg(null);
  }, [editingEmployee, isOpen, availableIcons]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg(null);
  };

  const handleSelectIcon = (iconPath: string) => {
    setFormData((prev) => ({ ...prev, icon: iconPath }));
    setIsIconDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!formData.jobTitle.trim()) {
      setErrorMsg('Job Title is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('A valid email address is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit(formData, isEdit);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedSalary = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(formData.salary) || 0);

  // Helper to display clean icon filename from path
  const getIconFilename = (pathUrl: string) => {
    if (!pathUrl) return 'default_avatar.svg';
    if (pathUrl.startsWith('data:')) return 'Uploaded Data Image';
    const parts = pathUrl.split('/');
    return parts[parts.length - 1] || pathUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-violet-100 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {isEdit ? 'Edit Employee Details' : 'Add New Employee'}
              </h2>
              <p className="text-xs text-violet-100/90 font-medium">
                Edits & updates <code className="bg-white/20 text-white px-1 py-0.5 rounded font-mono">public/database/employees_db.json</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            id="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Avatar / Icon Selector Section with Dropdown List from emp_icons */}
          <div className="bg-violet-50/60 p-4 rounded-2xl border border-violet-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-violet-600" />
                <span>Employee Icon (Dropdown list from public/emp_icons/)</span>
              </label>

              {onOpenAddImageModal && (
                <button
                  type="button"
                  onClick={onOpenAddImageModal}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-white hover:bg-violet-100 border border-violet-200 px-2.5 py-1 rounded-lg transition-all shadow-2xs"
                  id="open-upload-image-modal-from-employee-form"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-violet-600" />
                  <span>+ Add Image to emp_icons</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              
              {/* Preview Avatar */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white ring-4 ring-violet-200 shadow-sm flex items-center justify-center p-1">
                  <img
                    src={formData.icon || '/emp_icons/default_avatar.svg'}
                    alt="Selected Icon"
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/emp_icons/default_avatar.svg';
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 p-1 bg-violet-600 text-white rounded-full text-[10px]" title="Active Icon">
                  <Sparkles className="w-3 h-3" />
                </span>
              </div>

              {/* Icon Dropdown Selector */}
              <div className="flex-1 w-full space-y-2 relative" ref={dropdownRef}>
                <label className="block text-[11px] font-semibold text-slate-500">
                  Select Icon File from emp_icons folder:
                </label>

                {/* Custom Interactive Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-violet-200 hover:border-violet-400 rounded-xl text-left flex items-center justify-between transition-all shadow-xs cursor-pointer"
                  id="icon-dropdown-toggle-btn"
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <img
                      src={formData.icon || '/emp_icons/default_avatar.svg'}
                      alt="Icon Thumbnail"
                      className="w-6 h-6 rounded-md object-contain border border-slate-200 bg-slate-50 p-0.5 shrink-0"
                    />
                    <span className="text-xs font-mono font-bold text-slate-800 truncate">
                      {getIconFilename(formData.icon)}
                    </span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-violet-600 transition-transform ${isIconDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Native HTML Select Fallback / Keyboard support */}
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={(e) => handleSelectIcon(e.target.value)}
                  className="sr-only"
                  tabIndex={-1}
                >
                  {availableIcons.map((iconUrl) => (
                    <option key={iconUrl} value={iconUrl}>
                      {getIconFilename(iconUrl)}
                    </option>
                  ))}
                </select>

                {/* Custom Dropdown List Popup */}
                {isIconDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-violet-200 rounded-2xl shadow-xl z-50 max-h-56 overflow-y-auto p-1.5 space-y-1 animate-fadeIn">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-violet-600 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Available Icons in public/emp_icons/</span>
                      <span>{availableIcons.length} Files</span>
                    </div>

                    {availableIcons.map((iconUrl, index) => {
                      const isSelected = formData.icon === iconUrl;
                      const filename = getIconFilename(iconUrl);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectIcon(iconUrl)}
                          className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-violet-100 text-violet-900 font-bold border border-violet-300'
                              : 'hover:bg-violet-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 p-0.5 flex items-center justify-center shrink-0">
                              <img src={iconUrl} alt={filename} className="w-full h-full object-contain rounded-md" />
                            </div>
                            <span className="text-xs font-mono font-semibold truncate">
                              {filename}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-violet-700 shrink-0 ml-2" />}
                        </button>
                      );
                    })}

                    {onOpenAddImageModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsIconDropdownOpen(false);
                          onOpenAddImageModal();
                        }}
                        className="w-full px-3 py-2 mt-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center justify-center gap-2 border border-indigo-200 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4 text-indigo-600" />
                        <span>Upload New Image to emp_icons</span>
                      </button>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-violet-600" />
                <span>Full Name <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Jane Doe"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                id="input-full-name"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-violet-600" />
                <span>Job Title <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                id="input-job-title"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-violet-600" />
                <span>Department</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                id="select-department"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-violet-600" />
                  <span>Salary (Annual USD)</span>
                </span>
                <span className="text-violet-600 font-extrabold text-[11px]">{formattedSalary}</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="95000"
                min="0"
                step="1000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                id="input-salary"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-violet-600" />
                <span>Email Address <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane.doe@company.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                id="input-email"
              />
            </div>

            {/* Date of Hire */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                <span>Date of Hire</span>
              </label>
              <input
                type="date"
                name="dateOfHire"
                value={formData.dateOfHire}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
                id="input-hire-date"
              />
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              id="submit-employee-btn"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to JSON DB...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEdit ? 'Update Employee' : 'Save Employee Entry'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
