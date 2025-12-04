'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reportsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ReportGenerator() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const result = await reportsApi.generate(topic);
      setReport(result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>
          Enter a topic and let AI generate a comprehensive report for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Climate Change Impact on Agriculture"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading || !topic.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Report'
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}

        {report && (
          <div className="mt-6 space-y-4">
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold mb-4">{report.title}</h2>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700">
                  {report.content}
                </div>
              </div>
            </div>
            {report.sections && Object.keys(report.sections).length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">Sections</h3>
                {Object.entries(report.sections).map(([key, value]: [string, any]) => (
                  <div key={key} className="mb-4">
                    <h4 className="font-semibold mb-2">{key}</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{value}</p>
                  </div>
                ))}
              </div>
            )}
            {report.references && report.references.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold mb-4">References</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {report.references.map((ref: string, i: number) => (
                    <li key={i}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

