import React, { useState } from 'react';
import { Employee } from '../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  employee: Employee | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !employee) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(employee.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete employee:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full border border-rose-100 shadow-2xl overflow-hidden p-6 space-y-5">
        
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Confirm Employee Deletion</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to remove <strong className="text-slate-900">{employee.fullName}</strong> from the organization database?
          </p>
        </div>

        {/* Employee Card Summary */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center space-x-3 text-xs">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
            <img src={employee.icon || '/emp_icons/default_avatar.svg'} alt={employee.fullName} className="w-full h-full object-cover" />
          </div>
          <div className="truncate">
            <div className="font-bold text-slate-900">{employee.fullName}</div>
            <div className="text-slate-500 font-medium">{employee.jobTitle} • {employee.department}</div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          This action will permanently delete the entry from <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">public/database/employees_db.json</code>.
        </p>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            id="confirm-delete-btn"
          >
            {isDeleting ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Delete Record</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
