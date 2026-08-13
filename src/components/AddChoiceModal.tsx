import React from 'react';
import { UserPlus, ImagePlus, X, Sparkles, FileImage, FileSpreadsheet } from 'lucide-react';

interface AddChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddEmployee: () => void;
  onSelectAddImage: () => void;
}

export const AddChoiceModal: React.FC<AddChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectAddEmployee,
  onSelectAddImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full border border-violet-100 shadow-2xl overflow-hidden my-8 transform transition-all scale-100">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-violet-700 via-violet-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Create & Add</h2>
              <p className="text-xs text-violet-100/90 font-medium">Select an action to continue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            id="close-add-choice-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Choice Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
            Choose what you would like to add
          </p>

          <div className="grid grid-cols-1 gap-3.5">
            
            {/* Add Employee Button */}
            <button
              onClick={() => {
                onClose();
                onSelectAddEmployee();
              }}
              className="w-full p-4 bg-slate-50 hover:bg-violet-50 border-2 border-slate-200 hover:border-violet-500 rounded-2xl text-left transition-all group flex items-start space-x-4 cursor-pointer shadow-xs hover:shadow-md"
              id="choice-add-employee-btn"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-200 group-hover:scale-105 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-900 transition-colors">
                    Add Employees
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md">
                    JSON DB
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Register employee details. Updates <code className="text-violet-700 bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px]">public/database/employees_db.json</code>.
                </p>
              </div>
            </button>

            {/* Add Images Button */}
            <button
              onClick={() => {
                onClose();
                onSelectAddImage();
              }}
              className="w-full p-4 bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-500 rounded-2xl text-left transition-all group flex items-start space-x-4 cursor-pointer shadow-xs hover:shadow-md"
              id="choice-add-image-btn"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <ImagePlus className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                    Add Images
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                    emp_icons
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Upload icon or avatar images into <code className="text-indigo-700 bg-white px-1 py-0.5 rounded border border-slate-200 font-mono text-[11px]">public/emp_icons/</code> folder.
                </p>
              </div>
            </button>

          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-violet-500" />
            <span>Database: JSON</span>
          </span>
          <span className="flex items-center gap-1">
            <FileImage className="w-3.5 h-3.5 text-indigo-500" />
            <span>Folder: public/emp_icons/</span>
          </span>
        </div>

      </div>
    </div>
  );
};
