'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mic, MessageSquare, FileEdit } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, loadUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Neo AI Workspace
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered productivity assistant for students, professionals, and teams
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/login')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>PDF Summarization</CardTitle>
              <CardDescription>
                Extract key points, summaries, and action items from any PDF
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Meeting Transcription</CardTitle>
              <CardDescription>
                Transcribe audio/video with speaker labels and action items
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Chat with Documents</CardTitle>
              <CardDescription>
                Ask questions about your uploaded documents
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileEdit className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Report Generation</CardTitle>
              <CardDescription>
                Generate reports, essays, and documentation from topics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

