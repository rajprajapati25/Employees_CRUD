import React, { useState, useEffect } from 'react';
import { Users, Database, Sparkles, Download, RefreshCw, Github, ExternalLink, CheckCircle2, Plus } from 'lucide-react';

interface HeaderProps {
  totalEmployees: number;
  onRefresh: () => void;
  onExportCSV: () => void;
  isLoading: boolean;
  onSyncGitHub?: () => void;
  isSyncingGitHub?: boolean;
  onOpenAddChoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalEmployees,
  onRefresh,
  onExportCSV,
  isLoading,
  onSyncGitHub,
  isSyncingGitHub = false,
  onOpenAddChoice,
}) => {
  const [gitStatus, setGitStatus] = useState<{
    connected: boolean;
    owner: string;
    repo: string;
    repoUrl: string;
    lastSyncedTime: string | null;
  } | null>(null);

  useEffect(() => {
    fetch('/api/github/status')
      .then((res) => res.json())
      .then((data) => setGitStatus(data))
      .catch((err) => console.error('Error fetching git status:', err));
  }, [isSyncingGitHub]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-violet-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-700 via-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-200 ring-2 ring-violet-200 ring-offset-1 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Employees
              </h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                <Sparkles className="w-3 h-3 text-violet-600" />
                CRUD System
              </span>
              <a
                href={gitStatus?.repoUrl || "https://github.com/rajprajapati25/Employees_CRUD"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                title="View repository on GitHub"
              >
                <Github className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">rajprajapati25/Employees_CRUD</span>
                <span className="sm:hidden">GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Database className="w-3.5 h-3.5 text-violet-500" />
              <span>Persisted locally & auto-synced to GitHub repo</span>
              <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Repo Connected
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {onOpenAddChoice && (
            <button
              onClick={onOpenAddChoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 via-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl transition-all shadow-md shadow-violet-200 cursor-pointer"
              title="Add Employee or Add Image"
              id="header-add-button"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          )}

          {onSyncGitHub && (
            <button
              onClick={onSyncGitHub}
              disabled={isSyncingGitHub}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200 disabled:opacity-50"
              title="Manual push changes to GitHub repository"
              id="sync-github-btn"
            >
              <Github className={`w-3.5 h-3.5 ${isSyncingGitHub ? 'animate-spin text-violet-600' : 'text-slate-800'}`} />
              <span className="hidden md:inline">{isSyncingGitHub ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 text-slate-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-all border border-slate-200 hover:border-violet-200 disabled:opacity-50"
            title="Reload database"
            id="refresh-db-btn"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-600' : ''}`} />
          </button>

          <button
            onClick={onExportCSV}
            className="hidden lg:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100/80 rounded-xl transition-all border border-violet-200 shadow-xs"
            title="Export employees list as CSV"
            id="export-csv-btn"
          >
            <Download className="w-4 h-4 text-violet-600" />
            <span>Export CSV</span>
          </button>

          <div className="pl-2 border-l border-slate-200 flex items-center">
            <div className="px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5">
              <span>{totalEmployees}</span>
              <span className="font-normal opacity-90">{totalEmployees === 1 ? 'Employee' : 'Employees'}</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

