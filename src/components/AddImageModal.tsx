import React, { useState, useRef } from 'react';
import { ImagePlus, Upload, X, Check, Image as ImageIcon, Sparkles, FileImage, CheckCircle2, Trash2 } from 'lucide-react';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUploaded: (iconUrl: string) => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  availableIcons?: string[];
  onIconDeleted?: (iconUrl: string) => void;
}

export const AddImageModal: React.FC<AddImageModalProps> = ({
  isOpen,
  onClose,
  onImageUploaded,
  addToast,
  availableIcons = [],
  onIconDeleted,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customFilename, setCustomFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingIcon, setDeletingIcon] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const getIconFilename = (pathUrl: string) => {
    if (!pathUrl) return '';
    if (pathUrl.startsWith('data:')) return 'data_image';
    const parts = pathUrl.split('/');
    return parts[parts.length - 1] || pathUrl;
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be under 5MB.');
      return;
    }

    setSelectedFile(file);
    setErrorMsg(null);
    const cleanName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    setCustomFilename(cleanName);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !selectedFile) {
      setErrorMsg('Please select an image file first.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const safeName = customFilename.trim()
      ? customFilename.trim().replace(/[^a-zA-Z0-9_.-]/g, '_')
      : `icon_${Date.now()}_${selectedFile.name}`;

    try {
      const res = await fetch('/api/upload-icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: previewUrl,
          filename: safeName,
        }),
      });

      let finalIconUrl = `/emp_icons/${safeName}`;

      if (res.ok) {
        const data = await res.json();
        if (data.iconUrl) {
          finalIconUrl = data.iconUrl;
        }
      }

      onImageUploaded(finalIconUrl);
      addToast(
        'Image Uploaded!',
        `Saved icon to public/emp_icons/${safeName} and synced to GitHub`,
        'success'
      );

      // Reset modal state
      setSelectedFile(null);
      setPreviewUrl(null);
      setCustomFilename('');
      onClose();
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      const fallbackUrl = previewUrl;
      onImageUploaded(fallbackUrl);
      addToast('Image Added', 'Saved image into memory icon list', 'info');
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteIcon = async (iconUrl: string) => {
    const filename = getIconFilename(iconUrl);
    if (!filename) return;

    if (!confirm(`Are you sure you want to delete ${filename} from public/emp_icons/?`)) {
      return;
    }

    setDeletingIcon(iconUrl);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/icons/${encodeURIComponent(filename)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        addToast('Image Deleted', `Removed ${filename} from public/emp_icons/`, 'success');
        if (onIconDeleted) {
          onIconDeleted(iconUrl);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || 'Failed to delete icon');
      }
    } catch (err: any) {
      console.error('Delete icon error:', err);
      setErrorMsg('Failed to delete icon file');
    } finally {
      setDeletingIcon(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-violet-100 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ImagePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Add Icon Image</h2>
              <p className="text-xs text-indigo-100/90 font-medium">
                Save directly to <code className="bg-white/20 text-white px-1 py-0.5 rounded">public/emp_icons/</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            id="close-add-image-modal"
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

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            
            {/* Dropzone Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px] ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/80 scale-[0.99]'
                  : previewUrl
                  ? 'border-indigo-300 bg-slate-50 hover:bg-indigo-50/30'
                  : 'border-slate-300 bg-slate-50/80 hover:bg-indigo-50/40 hover:border-indigo-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
                id="add-image-input-file"
              />

              {previewUrl ? (
                <div className="space-y-2">
                  <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border-4 border-indigo-200 shadow-md bg-white p-1">
                    <img src={previewUrl} alt="Upload Preview" className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Image Selected ({selectedFile?.name})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to select or drag & drop image file
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Supports SVG, PNG, JPG, WEBP (Max 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Custom Filename Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-indigo-600" />
                <span>Target Filename inside public/emp_icons/</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-mono text-slate-400 select-none">
                  public/emp_icons/
                </span>
                <input
                  type="text"
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="avatar_new.png"
                  className="w-full pl-32 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                  id="custom-filename-input"
                />
              </div>
            </div>

            {/* Submit Upload Button */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !previewUrl}
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                id="upload-image-submit-btn"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Upload & Save to emp_icons</span>
                  </>
                )}
              </button>
            </div>

          </form>

          {/* List of Images in public/emp_icons/ with Delete Option */}
          <div className="pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-indigo-600" />
                <span>Existing Images in public/emp_icons/ ({availableIcons.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Click trash icon to delete
              </span>
            </div>

            {availableIcons.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                No images found in public/emp_icons/
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/80 rounded-2xl border border-slate-200">
                {availableIcons.map((iconUrl) => {
                  const filename = getIconFilename(iconUrl);
                  const isDeleting = deletingIcon === iconUrl;

                  return (
                    <div
                      key={iconUrl}
                      className="bg-white border border-slate-200 hover:border-indigo-300 p-2 rounded-xl flex items-center justify-between space-x-2 transition-all shadow-2xs"
                    >
                      <div className="flex items-center space-x-2.5 overflow-hidden min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 p-0.5 shrink-0 border border-slate-200 flex items-center justify-center">
                          <img
                            src={iconUrl}
                            alt={filename}
                            className="w-full h-full object-contain rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/emp_icons/default_avatar.svg';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-mono font-bold text-slate-800 truncate" title={filename}>
                            {filename}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            /emp_icons/{filename}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteIcon(iconUrl)}
                        disabled={isDeleting}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title={`Delete ${filename} from emp_icons`}
                        id={`delete-icon-${filename}`}
                      >
                        {isDeleting ? (
                          <div className="w-4 h-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
