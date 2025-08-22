"use client";

import { useCallback, useState } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileDropzoneProps {
  taskId?: string;
  onFileUploaded?: (file: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => void;
  maxSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[];
  multiple?: boolean;
  className?: string;
}

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  result?: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

const defaultAcceptedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export function FileDropzone({
  taskId,
  onFileUploaded,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = defaultAcceptedTypes,
  multiple = true,
  className = ''
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FileWithStatus[]>([]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `Dosya boyutu ${(maxSize / 1024 / 1024).toFixed(0)}MB'ı aşamaz`;
    }
    
    if (!acceptedTypes.includes(file.type)) {
      return 'Desteklenmeyen dosya türü';
    }
    
    return null;
  };

  const uploadFile = async (fileWithStatus: FileWithStatus) => {
    const { file } = fileWithStatus;
    
    if (!taskId) {
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: 'Task ID bulunamadı' }
          : f
      ));
      return;
    }

    setFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'uploading', progress: 0 } : f
    ));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', taskId);

    try {
      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setFiles(prev => prev.map(f => 
            f.file === file ? { ...f, progress } : f
          ));
        }
      });

      const uploadPromise = new Promise<{
        success: boolean;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        fileType: string;
      }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

      const result = await uploadPromise;

      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'success', progress: 100, result }
          : f
      ));

      if (onFileUploaded) {
        onFileUploaded(result);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { ...f, status: 'error', error: errorMessage }
          : f
      ));
    }
  };

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    const validFiles: FileWithStatus[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        validFiles.push({
          file,
          status: 'error',
          error
        });
      } else {
        validFiles.push({
          file,
          status: 'pending'
        });
      }
    }

    setFiles(prev => {
      const existingFileNames = new Set(prev.map(f => f.file.name));
      const newFiles = validFiles.filter(f => !existingFileNames.has(f.file.name));
      return [...prev, ...newFiles];
    });

    // Auto-upload valid files
    for (const fileWithStatus of validFiles) {
      if (fileWithStatus.status === 'pending') {
        await uploadFile(fileWithStatus);
      }
    }
  }, [maxSize, acceptedTypes, taskId, onFileUploaded, uploadFile, validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-center">
          <Upload className={`mx-auto h-8 w-8 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-900">
              Dosyaları buraya sürükleyin veya tıklayın
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maksimum {(maxSize / 1024 / 1024).toFixed(0)}MB, 
              {acceptedTypes.includes('image/jpeg') && ' Resim,'}
              {acceptedTypes.includes('application/pdf') && ' PDF,'}
              {acceptedTypes.includes('text/plain') && ' Metin'}
              {acceptedTypes.includes('application/msword') && ' Word'}
              {' dosyaları desteklenir'}
            </p>
          </div>
        </div>
        
        <input
          id="file-input"
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileWithStatus, index) => (
            <div key={`${fileWithStatus.file.name}-${index}`} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
              <div className="flex-shrink-0">
                {fileWithStatus.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {fileWithStatus.status === 'error' && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                {fileWithStatus.status === 'uploading' && (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {fileWithStatus.status === 'pending' && (
                  <File className="w-5 h-5 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileWithStatus.file.name}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(fileWithStatus.file)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{formatFileSize(fileWithStatus.file.size)}</span>
                  {fileWithStatus.status === 'uploading' && fileWithStatus.progress && (
                    <span>{Math.round(fileWithStatus.progress)}%</span>
                  )}
                </div>
                
                {fileWithStatus.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${fileWithStatus.progress || 0}%` }}
                    />
                  </div>
                )}
                
                {fileWithStatus.error && (
                  <p className="text-xs text-red-500 mt-1">{fileWithStatus.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}