'use client';

import type React from 'react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploaderProps {
  onDataLoaded: (data: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const text = e.target?.result as string;
      if (text) {
        setFileName(file.name);
        onDataLoaded(text);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Load COTA Telemetry Data</CardTitle>
        <CardDescription>
          Upload your Circuit of the Americas CSV dataset to begin analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            {fileName ? (
              <>
                <FileText className="h-12 w-12 text-primary" />
                <div>
                  <p className="font-semibold text-primary">{fileName}</p>
                  <p className="text-sm text-muted-foreground">File loaded successfully!</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Drop your CSV file here</p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              </>
            )}
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>{fileName ? 'Change File' : 'Select File'}</span>
              </Button>
            </label>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          <p>Expected format: COTA telemetry CSV with 18 required columns</p>
          <p className="mt-1 text-primary font-semibold">
            ↓ See detailed format specification below
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
