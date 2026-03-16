'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { leavesApi } from '@/lib/api';
import axios from 'axios';

export default function ApplyLeavePage() {
  const router = useRouter();
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateWorkingDays = () => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  };

  const workingDays = calculateWorkingDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveType || !fromDate || !toDate || !reason) {
      toast.error('Please fill all required fields');
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.error('From date must be before To date');
      return;
    }
    if (workingDays === 0) {
      toast.error('Selected dates contain no working days');
      return;
    }

    setIsSubmitting(true);
    try {
      let documentUrl = '';
      if (file) {
        toast.loading('Uploading document...', { id: 'upload' });
        
        // 1. Get pre-signed URL
        const { data: uploadData } = await leavesApi.getUploadUrl(file.name, file.type);
        const { uploadUrl, url } = uploadData?.data || uploadData?.body || uploadData;
        
        if (!uploadUrl) {
          throw new Error('Failed to get upload URL');
        }

        // 2. Upload directly to S3
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });
        
        documentUrl = url;
        toast.success('Document uploaded', { id: 'upload' });
      }

      await leavesApi.apply({
        leaveType,
        fromDate,
        toDate,
        reason,
        documentUrl,
      });
      toast.success('Leave request submitted successfully!');
      router.push('/leaves/my-requests');
    } catch (error: any) {
      console.error('Apply leave error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit leave request', { id: 'upload' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Apply for Leave</h1>
        <p className="page-subtitle">Submit a new leave request</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays size={18} /> Leave Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm mb-1.5 block">Leave Type *</Label>
              <Select value={leaveType} onValueChange={(v) => v && setLeaveType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SICK">Sick Leave</SelectItem>
                  <SelectItem value="CASUAL">Casual Leave</SelectItem>
                  <SelectItem value="ANNUAL">Annual Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm mb-1.5 block">From Date *</Label>
                <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">To Date *</Label>
                <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </div>
            </div>

            {workingDays > 0 && (
              <div className="working-days-badge">
                📅 <strong>{workingDays}</strong> working day{workingDays > 1 ? 's' : ''} (excluding weekends)
              </div>
            )}

            <div>
              <Label className="text-sm mb-1.5 block">Reason *</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Explain the reason for your leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm mb-1.5 block">Supporting Document (optional)</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.png,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground mt-1">Upload medical certificate or any supporting document</p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              <Send size={16} className="mr-2" />
              {isSubmitting ? 'Submitting…' : 'Submit Leave Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
