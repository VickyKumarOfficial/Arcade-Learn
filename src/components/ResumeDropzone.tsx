/**
 * Resume Dropzone Component
 * Based on OpenResume's ResumeDropzone.tsx
 * Reference: https://github.com/xitanggg/open-resume/blob/main/src/app/components/ResumeDropzone.tsx
 */

import { useState, useCallback } from "react";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface FileState {
  name: string;
  size: number;
  fileUrl: string;
}

const defaultFileState: FileState = {
  name: "",
  size: 0,
  fileUrl: "",
};

interface ResumeDropzoneProps {
  onFileUrlChange: (fileUrl: string, file?: File) => void;
  className?: string;
}

export const ResumeDropzone = ({
  onFileUrlChange,
  className = "",
}: ResumeDropzoneProps) => {
  const [file, setFile] = useState<FileState>(defaultFileState);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = useCallback(
    (newFile: File) => {
      // Validate file type
      if (newFile.type !== "application/pdf") {
        setError("Only PDF files are supported");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (newFile.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }

      setError("");
      const fileUrl = URL.createObjectURL(newFile);
      setFile({
        name: newFile.name,
        size: newFile.size,
        fileUrl,
      });
      onFileUrlChange(fileUrl, newFile); // Pass the file object too
    },
    [onFileUrlChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsHovering(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileChange(droppedFile);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovering(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileChange(selectedFile);
      }
    },
    [handleFileChange]
  );

  const handleRemoveFile = useCallback(() => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }
    setFile(defaultFileState);
    onFileUrlChange("");
    setError("");
  }, [file.fileUrl, onFileUrlChange]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={className}>
      {!file.fileUrl ? (
        <Card
          className={`border-2 border-dashed transition-all duration-200 ${
            isHovering
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-2">
              Drop your resume here
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleInputChange}
              className="hidden"
              id="resume-upload"
            />
            
            <label htmlFor="resume-upload">
              <Button
                type="button"
                variant="default"
                className="cursor-pointer"
                onClick={() => document.getElementById("resume-upload")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose PDF File
              </Button>
            </label>
            
            <p className="text-xs text-muted-foreground mt-4">
              PDF files only • Maximum size: 5MB
            </p>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    File uploaded successfully
                  </h4>
                </div>
                
                <p className="text-sm text-green-700 dark:text-green-300 mb-1 truncate">
                  {file.name}
                </p>
                
                <p className="text-xs text-green-600 dark:text-green-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
