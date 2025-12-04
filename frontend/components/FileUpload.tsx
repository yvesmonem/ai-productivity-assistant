'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Mic } from 'lucide-react';
import { documentsApi } from '@/lib/api';
import { useDocumentStore } from '@/lib/store';

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const { addDocument } = useDocumentStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      setUploading(true);
      try {
        const document = await documentsApi.upload(file);
        addDocument(document);
        alert('File uploaded successfully! Processing will begin shortly.');
      } catch (error: any) {
        console.error('Upload error:', error);
        alert('Failed to upload file: ' + (error.response?.data?.error || error.message));
      } finally {
        setUploading(false);
      }
    }
  }, [addDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'audio/*': ['.mp3', '.wav', '.m4a'],
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload PDFs for summarization or audio/video files for transcription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg text-primary">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">
                Drag & drop a file here, or click to select
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supports PDF, MP3, WAV, MP4, and more
              </p>
              <Button disabled={uploading}>
                {uploading ? 'Uploading...' : 'Select File'}
              </Button>
            </div>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm">PDF Summarization</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded">
            <Mic className="h-5 w-5 text-green-600" />
            <span className="text-sm">Audio Transcription</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

