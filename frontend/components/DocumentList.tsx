'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/lib/store';
import { documentsApi, Document } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Mic, Video, Loader2, Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function DocumentList() {
  const router = useRouter();
  const { documents, fetchDocuments, removeDocument, loading } = useDocumentStore();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [detailDoc, setDetailDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetchDocuments();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const handleView = async (id: string) => {
    try {
      const doc = await documentsApi.getById(id);
      setDetailDoc(doc);
    } catch (error) {
      console.error('Failed to fetch document:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsApi.delete(id);
      removeDocument(id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="h-5 w-5" />;
      case 'AUDIO':
        return <Mic className="h-5 w-5" />;
      case 'VIDEO':
        return <Video className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'PROCESSING':
        return 'text-yellow-600 bg-yellow-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading documents...</p>
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No documents yet. Upload your first document!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            View and manage your uploaded documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-gray-400">{getIcon(doc.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(doc.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {detailDoc && (
        <Dialog open={!!detailDoc} onOpenChange={() => setDetailDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detailDoc.title}</DialogTitle>
              <DialogDescription>
                {detailDoc.type} • {detailDoc.status}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {detailDoc.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {detailDoc.summary}
                  </p>
                </div>
              )}
              {detailDoc.keyPoints && detailDoc.keyPoints.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Points</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {detailDoc.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detailDoc.actionItems && detailDoc.actionItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Action Items</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {detailDoc.actionItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detailDoc.transcript && (
                <div>
                  <h3 className="font-semibold mb-2">Transcript</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {detailDoc.transcript}
                  </p>
                </div>
              )}
              {detailDoc.highlights && detailDoc.highlights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Highlights</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {detailDoc.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

