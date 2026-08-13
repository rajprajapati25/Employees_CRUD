import React, { useState, useEffect, useMemo } from 'react';
import { Employee, EmployeeFormData, SortField, SortOrder, ToastMessage, DEFAULT_AVATARS } from './types';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { SearchAndFilters } from './components/SearchAndFilters';
import { EmployeeCard } from './components/EmployeeCard';
import { EmployeeTable } from './components/EmployeeTable';
import { EmployeeModal } from './components/EmployeeModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EmployeeDetailsDrawer } from './components/EmployeeDetailsDrawer';
import { FloatingActionButton } from './components/FloatingActionButton';
import { AddChoiceModal } from './components/AddChoiceModal';
import { AddImageModal } from './components/AddImageModal';
import { ToastContainer } from './components/ToastContainer';
import { Users, AlertCircle, Plus, RefreshCw, FolderDown } from 'lucide-react';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Available icons in public/emp_icons/
  const [availableIcons, setAvailableIcons] = useState<string[]>(DEFAULT_AVATARS);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortField>('fullName');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal & Drawer states
  const [isAddChoiceOpen, setIsAddChoiceOpen] = useState<boolean>(false);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [detailEmployee, setDetailEmployee] = useState<Employee | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fallback initial dataset
  const DEFAULT_INITIAL_EMPLOYEES: Employee[] = [
    {
      id: "emp_01",
      fullName: "Sophia Martinez",
      jobTitle: "Senior Product Designer",
      salary: 115000,
      email: "sophia.martinez@company.com",
      dateOfHire: "2022-03-15",
      department: "Design",
      icon: "/emp_icons/emp_01.svg"
    },
    {
      id: "emp_02",
      fullName: "Alexander Chen",
      jobTitle: "Lead Full-Stack Developer",
      salary: 135000,
      email: "alexander.chen@company.com",
      dateOfHire: "2021-08-01",
      department: "Engineering",
      icon: "/emp_icons/emp_02.svg"
    },
    {
      id: "emp_03",
      fullName: "Emma Watson",
      jobTitle: "Human Resources Manager",
      salary: 92000,
      email: "emma.watson@company.com",
      dateOfHire: "2023-01-10",
      department: "Human Resources",
      icon: "/emp_icons/emp_03.svg"
    },
    {
      id: "emp_04",
      fullName: "Marcus Vance",
      jobTitle: "Marketing Strategist",
      salary: 88000,
      email: "marcus.vance@company.com",
      dateOfHire: "2023-06-20",
      department: "Marketing",
      icon: "/emp_icons/emp_04.svg"
    },
    {
      id: "emp_05",
      fullName: "Olivia Taylor",
      jobTitle: "Financial Analyst",
      salary: 98000,
      email: "olivia.taylor@company.com",
      dateOfHire: "2022-11-05",
      department: "Finance",
      icon: "/emp_icons/emp_05.svg"
    },
    {
      id: "emp_06",
      fullName: "David Kim",
      jobTitle: "DevOps Engineer",
      salary: 128000,
      email: "david.kim@company.com",
      dateOfHire: "2020-09-14",
      department: "Engineering",
      icon: "/emp_icons/emp_06.svg"
    }
  ];

  const saveEmployeesToCache = (data: Employee[]) => {
    try {
      localStorage.setItem('employees_db_v2', JSON.stringify(data));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  // Fetch initial employee list with automatic Vercel / static / cache fallback
  const fetchEmployees = async () => {
    setIsLoading(true);
    setFetchError(null);

    // Try 1: Call Express Server API (/api/employees)
    try {
      const response = await fetch('/api/employees');
      const contentType = response.headers.get('content-type');
      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setEmployees(data);
          saveEmployeesToCache(data);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('/api/employees request failed, trying static asset/cache fallback:', err);
    }

    // Try 2: Fetch static database asset directly (/database/employees_db.json)
    try {
      const staticRes = await fetch('/database/employees_db.json');
      if (staticRes.ok) {
        const staticData = await staticRes.json();
        if (Array.isArray(staticData) && staticData.length > 0) {
          // Check if local cache has newer or modified data
          const cached = localStorage.getItem('employees_db_v2');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setEmployees(parsed);
                setIsLoading(false);
                return;
              }
            } catch (e) {}
          }
          setEmployees(staticData);
          saveEmployeesToCache(staticData);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Static database asset fetch failed:', err);
    }

    // Try 3: LocalStorage Cache
    const cached = localStorage.getItem('employees_db_v2');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEmployees(parsed);
          setIsLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Fallback 4: Initial Default Seed Records
    setEmployees(DEFAULT_INITIAL_EMPLOYEES);
    saveEmployeesToCache(DEFAULT_INITIAL_EMPLOYEES);
    setIsLoading(false);
  };

  // Fetch list of icons inside public/emp_icons/
  const fetchAvailableIcons = async () => {
    try {
      const res = await fetch('/api/icons');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setAvailableIcons(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch icons list:', e);
    }
  };

  const handleImageUploaded = (newIconUrl: string) => {
    setAvailableIcons((prev) => {
      if (!prev.includes(newIconUrl)) {
        return [newIconUrl, ...prev];
      }
      return prev;
    });
    fetchAvailableIcons();
  };

  const handleIconDeleted = (deletedIconUrl: string) => {
    setAvailableIcons((prev) => prev.filter((icon) => icon !== deletedIconUrl));
    fetchAvailableIcons();
  };

  useEffect(() => {
    fetchEmployees();
    fetchAvailableIcons();
  }, []);

  // Handler: Add or Update Employee
  const handleSaveEmployee = async (formData: EmployeeFormData, isEdit: boolean) => {
    let updatedList: Employee[] = [];

    try {
      if (isEdit && editingEmployee) {
        let updatedEmp: Employee | null = null;
        try {
          const res = await fetch(`/api/employees/${editingEmployee.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            updatedEmp = await res.json();
          }
        } catch (e) {
          console.warn('API PUT failed, saving locally:', e);
        }

        const finalEmp: Employee = updatedEmp || {
          ...editingEmployee,
          ...formData,
          salary: Number(formData.salary) || 0,
        };

        setEmployees((prev) => {
          updatedList = prev.map((emp) => (emp.id === finalEmp.id ? finalEmp : emp));
          saveEmployeesToCache(updatedList);
          return updatedList;
        });

        addToast(
          'Employee Updated!',
          `Changes saved for ${finalEmp.fullName}`,
          'success'
        );
      } else {
        let createdEmp: Employee | null = null;
        try {
          const res = await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });

          if (res.ok) {
            createdEmp = await res.json();
          }
        } catch (e) {
          console.warn('API POST failed, adding locally:', e);
        }

        const finalEmp: Employee = createdEmp || {
          id: `emp_${Date.now()}`,
          fullName: formData.fullName.trim(),
          jobTitle: formData.jobTitle.trim(),
          salary: Number(formData.salary) || 0,
          email: (formData.email || '').trim(),
          dateOfHire: formData.dateOfHire || new Date().toISOString().split('T')[0],
          department: (formData.department || 'General').trim(),
          icon: formData.icon || '/emp_icons/default_avatar.svg',
        };

        setEmployees((prev) => {
          updatedList = [finalEmp, ...prev];
          saveEmployeesToCache(updatedList);
          return updatedList;
        });

        addToast(
          'Employee Added!',
          `${finalEmp.fullName} registered successfully`,
          'success'
        );
      }
    } catch (err: any) {
      addToast('Operation Failed', err.message || 'Error saving employee', 'error');
    }
  };

  // Handler: Delete Employee
  const handleDeleteEmployee = async (id: string) => {
    try {
      try {
        await fetch(`/api/employees/${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.warn('API DELETE failed, removing locally:', e);
      }

      setEmployees((prev) => {
        const filtered = prev.filter((emp) => emp.id !== id);
        saveEmployeesToCache(filtered);
        return filtered;
      });

      addToast(
        'Employee Deleted',
        'Record removed successfully.',
        'info'
      );
    } catch (err: any) {
      addToast('Delete Failed', err.message || 'Could not delete record', 'error');
    }
  };

  // Handler: Export CSV
  const handleExportCSV = () => {
    if (employees.length === 0) {
      addToast('Nothing to export', 'No employee records found.', 'info');
      return;
    }

    const headers = ['ID', 'Full Name', 'Job Title', 'Department', 'Salary', 'Email', 'Date of Hire', 'Icon URL'];
    const rows = employees.map((emp) => [
      `"${emp.id}"`,
      `"${emp.fullName.replace(/"/g, '""')}"`,
      `"${emp.jobTitle.replace(/"/g, '""')}"`,
      `"${(emp.department || '').replace(/"/g, '""')}"`,
      emp.salary,
      `"${emp.email}"`,
      `"${emp.dateOfHire}"`,
      `"${emp.icon}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('CSV Exported!', 'Employee data list downloaded.', 'success');
  };

  // Filter & Sort logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        // Department Filter
        if (selectedDepartment !== 'ALL' && emp.department !== selectedDepartment) {
          return false;
        }

        // Search Term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchName = emp.fullName.toLowerCase().includes(q);
          const matchTitle = emp.jobTitle.toLowerCase().includes(q);
          const matchEmail = emp.email.toLowerCase().includes(q);
          const matchDept = (emp.department || '').toLowerCase().includes(q);
          return matchName || matchTitle || matchEmail || matchDept;
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortBy];
        let valB: any = b[sortBy];

        if (sortBy === 'salary') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (sortBy === 'dateOfHire') {
          valA = new Date(valA).getTime() || 0;
          valB = new Date(valB).getTime() || 0;
        } else {
          valA = (valA || '').toString().toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [employees, searchTerm, selectedDepartment, sortBy, sortOrder]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (emp: Employee) => {
    setDeletingEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const handleOpenDetails = (emp: Employee) => {
    setDetailEmployee(emp);
    setIsDetailsOpen(true);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('ALL');
  };

  const [isSyncingGitHub, setIsSyncingGitHub] = useState<boolean>(false);

  // Manual GitHub sync trigger
  const handleSyncGitHub = async () => {
    setIsSyncingGitHub(true);
    try {
      const res = await fetch('/api/github/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Sync request failed');
      addToast('GitHub Sync Triggered', 'Latest changes are being pushed to rajprajapati25/Employees_CRUD', 'success');
    } catch (err: any) {
      addToast('Sync Failed', err.message, 'error');
    } finally {
      setTimeout(() => setIsSyncingGitHub(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-violet-50/20 to-slate-50 text-slate-900 font-sans antialiased selection:bg-violet-500 selection:text-white flex flex-col justify-between">
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <div>
        {/* Main Header */}
        <Header
          totalEmployees={employees.length}
          onRefresh={fetchEmployees}
          onExportCSV={handleExportCSV}
          isLoading={isLoading}
          onSyncGitHub={handleSyncGitHub}
          isSyncingGitHub={isSyncingGitHub}
          onOpenAddChoice={() => setIsAddChoiceOpen(true)}
        />


        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Stats Summary Panel */}
          <StatsOverview employees={employees} />

          {/* Search, Filter & Controls */}
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderToggle={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalFiltered={filteredEmployees.length}
            totalEmployees={employees.length}
            onClearFilters={handleClearFilters}
          />

          {/* Loading State */}
          {isLoading && employees.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-violet-100 shadow-sm">
              <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-800">Reading database...</p>
              <p className="text-xs text-slate-500 mt-1">Fetching records from <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">public/database/employees_db.json</code></p>
            </div>
          )}

          {/* Error State */}
          {fetchError && (
            <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center my-6 space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-rose-900">{fetchError}</p>
              <button
                onClick={fetchEmployees}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Empty Records / No Search Results State */}
          {!isLoading && !fetchError && filteredEmployees.length === 0 && (
            <div className="py-16 px-4 bg-white rounded-3xl border border-violet-100 shadow-sm text-center max-w-md mx-auto my-6 space-y-4">
              <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto ring-4 ring-violet-100">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {employees.length === 0 ? 'No Employees Registered Yet' : 'No Matching Employees Found'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {employees.length === 0
                    ? 'Your database is currently empty. Click the floating button below to create your first employee entry!'
                    : 'Try adjusting your search query or department filter to find what you are looking for.'}
                </p>
              </div>

              {employees.length === 0 ? (
                <button
                  onClick={() => setIsAddChoiceOpen(true)}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-200 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add First Employee / Image</span>
                </button>
              ) : (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-xl text-xs font-bold transition-all border border-violet-200"
                >
                  Clear Active Filters
                </button>
              )}
            </div>
          )}

          {/* Employees Display (Grid or Table) */}
          {!isLoading && filteredEmployees.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onEdit={handleOpenEditModal}
                      onDelete={handleOpenDeleteModal}
                      onViewDetails={handleOpenDetails}
                    />
                  ))}
                </div>
              ) : (
                <EmployeeTable
                  employees={filteredEmployees}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                  onViewDetails={handleOpenDetails}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  sortOrder={sortOrder}
                  onSortOrderToggle={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* Floating Action Button (FAB) for Adding Entry or Image */}
      <FloatingActionButton onClick={() => setIsAddChoiceOpen(true)} />

      {/* Add Choice Selector Modal (Add Employees vs Add Images) */}
      <AddChoiceModal
        isOpen={isAddChoiceOpen}
        onClose={() => setIsAddChoiceOpen(false)}
        onSelectAddEmployee={handleOpenAddModal}
        onSelectAddImage={() => setIsAddImageModalOpen(true)}
      />

      {/* Add Image Modal (Uploads directly into public/emp_icons/) */}
      <AddImageModal
        isOpen={isAddImageModalOpen}
        onClose={() => setIsAddImageModalOpen(false)}
        onImageUploaded={handleImageUploaded}
        addToast={addToast}
        availableIcons={availableIcons}
        onIconDeleted={handleIconDeleted}
      />

      {/* Add / Edit Employee Modal (Edits public/database/employees_db.json) */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveEmployee}
        editingEmployee={editingEmployee}
        availableIcons={availableIcons}
        onOpenAddImageModal={() => {
          setIsModalOpen(false); // Hide Add Employee section when opening Add Image modal
          setIsAddImageModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        employee={deletingEmployee}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteEmployee}
      />

      {/* Employee Details Drawer */}
      <EmployeeDetailsDrawer
        isOpen={isDetailsOpen}
        employee={detailEmployee}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleOpenEditModal}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-violet-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-4 h-4 text-violet-600" />
            <span className="font-bold text-slate-800">Employees CRUD Application</span>
            <span>• Violet & White Theme</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Database saved in <code className="bg-violet-50 text-violet-700 px-1 py-0.5 rounded font-mono border border-violet-200">public/database/employees_db.json</code> & icons in <code className="bg-violet-50 text-violet-700 px-1 py-0.5 rounded font-mono border border-violet-200">public/emp_icons/</code>
          </p>
        </div>
      </footer>

    </div>
  );
}
