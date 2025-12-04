'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useDocumentStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mic, MessageSquare, FileEdit, Upload, LogOut } from 'lucide-react';
import { documentsApi } from '@/lib/api';
import FileUpload from '@/components/FileUpload';
import DocumentList from '@/components/DocumentList';
import ReportGenerator from '@/components/ReportGenerator';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, loadUser } = useAuthStore();
  const { documents, fetchDocuments, loading } = useDocumentStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'documents' | 'report'>('upload');

  useEffect(() => {
    loadUser();
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchDocuments();
    }
  }, [isAuthenticated, router, loadUser, fetchDocuments]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Neo AI Workspace</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setActiveTab('upload')}>
            <CardHeader>
              <Upload className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Upload</CardTitle>
              <CardDescription>Upload PDFs or audio files</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setActiveTab('documents')}>
            <CardHeader>
              <FileText className="h-6 w-6 text-green-600 mb-2" />
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>{documents.length} documents</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setActiveTab('report')}>
            <CardHeader>
              <FileEdit className="h-6 w-6 text-orange-600 mb-2" />
              <CardTitle className="text-lg">Generate Report</CardTitle>
              <CardDescription>Create reports from topics</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-6 w-6 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Chat</CardTitle>
              <CardDescription>Ask questions</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8">
          {activeTab === 'upload' && <FileUpload />}
          {activeTab === 'documents' && <DocumentList />}
          {activeTab === 'report' && <ReportGenerator />}
        </div>
      </div>
    </div>
  );
}

