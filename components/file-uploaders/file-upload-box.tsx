import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { apiService } from "@/src/services/apiService";

interface Props {
  label?: string;
  uploadUrl: string;
  uploadType?: 'single' | 'multiple';
  accept?: string;
  maxFileSizeMB?: number;
  requiredDimensions?: { width: number; height: number };
  value?: string[]; // Uploaded cdn_urls
  onChange?: (val: string[]) => void;
  onUploadSuccess?: (response: string[]) => void;
  onUploadError?: (error: string) => void;
}

export const FileUploadBox: React.FC<Props> = ({
  label = 'Upload File',
  uploadUrl,
  uploadType = 'single',
  accept = 'image/*',
  maxFileSizeMB = 5,
  requiredDimensions,
  onUploadSuccess,
  onUploadError,
  onChange,
  value = [] // Default empty array for safety
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = accept.split(',').map((a) => a.trim().toLowerCase());
    const validFiles: File[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = file.type.toLowerCase();

      const isAccepted = allowedTypes.some((type) => {
        if (type.startsWith('.')) return `.${fileExt}` === type;
        else return fileType === type;
      });

      if (!isAccepted) {
        onUploadError?.(`Invalid file type: ${file.name}`);
        continue;
      }

      if (file.size > maxFileSizeMB * 1024 * 1024) {
        onUploadError?.(`File size exceeds ${maxFileSizeMB}MB: ${file.name}`);
        continue;
      }

      if (file.type.startsWith('image/')) {
        const dimensionsValid = await checkImageDimensions(file);
        if (!dimensionsValid) {
          onUploadError?.(
            `Image too small: ${file.name} must be at least ${requiredDimensions?.width}x${requiredDimensions?.height}px`
          );
          continue;
        }
      }

      validFiles.push(file);
      if (uploadType === 'single') break;
    }

    if (validFiles.length) {
      const newFiles = uploadType === 'single' ? validFiles : [...selectedFiles, ...validFiles];
      setSelectedFiles(newFiles);
      await uploadFiles(validFiles);

      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const checkImageDimensions = (file: File): Promise<boolean> => {
    if (!requiredDimensions) return Promise.resolve(true);

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          resolve(
            img.width >= requiredDimensions.width &&
            img.height >= requiredDimensions.height
          );
        };
      };
    });
  };

  const handleRemoveUploadedUrl = (url: string) => {
    const updated = value.filter((u) => u !== url);
    onChange?.(updated);
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (!filesToUpload.length) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      if (uploadType === 'single') {
        formData.append('file', filesToUpload[0]);
      } else {
        filesToUpload.forEach((file) => formData.append('files', file));
      }

      const response = await apiService.post({
        path: uploadUrl,
        data: formData,
        isAuth: true,
        isImage: true,
        dp: "wctma",
        df: { eventId: "685e5f47e6b0b54377f3536d" }
      });

      if (response?.data?.status && Array.isArray(response.data.data)) {
        const uploadedUrls = response.data.data.map((f: any) => f.cdn_url);
        onUploadSuccess?.(uploadedUrls);
        onChange?.([...value, ...uploadedUrls]); // Add to existing value
        setSelectedFiles([]); // ✅ Reset selectedFiles after successful upload
      } else {
        onUploadError?.(response?.data?.message || 'Upload failed');
      }

    } catch {
      onUploadError?.('Something went wrong during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium leading-none">{label}</label>

      <input
        ref={fileInputRef}
        type="file"
        // accept={accept}
        multiple={uploadType === 'multiple'}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className={`w-full border-2 border-dashed text-sm flex items-center justify-center rounded-md py-6 cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={handleClick}
      >
        <Upload className="h-5 w-5 mr-2" />
        {isUploading ? 'Uploading...' : label}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((url, index) => (
            <div key={index} className="relative border px-2 py-1 rounded text-xs flex items-center">
              <span className="mr-2">{url.split('/').pop()}</span>
              <X
                size={12}
                className="cursor-pointer text-red-500"
                onClick={() => handleRemoveUploadedUrl(url)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
