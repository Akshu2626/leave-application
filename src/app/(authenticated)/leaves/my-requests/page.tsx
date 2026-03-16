'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { leavesApi } from '@/lib/api';
import { LeaveRequest } from '@/types';
import { FileText, X, Loader2, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/15 text-amber-600 border-amber-200 dark:border-amber-800',
  APPROVED: 'bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  DECLINED: 'bg-red-500/15 text-red-600 border-red-200 dark:border-red-800',
  CANCELLED: 'bg-zinc-500/15 text-zinc-500 border-zinc-200 dark:border-zinc-700',
};

export default function MyRequestsPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const fetchLeaves = async () => {
    try {
      const res = await leavesApi.getMyLeaves();
      const data = res.data?.data || res.data?.body || res.data;
      setLeaves(data || []);
    } catch (error) {
      console.error('Fetch leaves error:', error);
      toast.error('Failed to fetch leave history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await leavesApi.cancel(id);
      setLeaves((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: 'CANCELLED' as any } : l))
      );
      setCancelId(null);
      toast.success('Leave request cancelled');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel request');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Leave Requests</h1>
        <p className="page-subtitle">Track all your leave applications</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText size={18} /> Leave History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="animate-spin h-6 w-6 text-primary" />
                        <span>Loading leaves...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {leave.leaveType}
                          {leave.documentUrl && (
                            <a 
                              href={leave.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                              title="View Document"
                            >
                              <Paperclip size={14} />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(leave.fromDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</TableCell>
                      <TableCell>{new Date(leave.toDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</TableCell>
                      <TableCell>{leave.workingDays}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[leave.status] || ''}>
                          {leave.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {leave.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-destructive"
                            onClick={() => setCancelId(leave._id)}
                          >
                            <X size={14} className="mr-1" /> Cancel
                          </Button>
                        )}
                        {leave.status === 'DECLINED' && leave.managerComment && (
                          <span className="text-xs text-muted-foreground italic">
                            &quot;{leave.managerComment}&quot;
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelId} onOpenChange={(open) => !open && setCancelId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this leave request?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelId(null)}>No, Keep It</Button>
            <Button variant="destructive" onClick={() => cancelId && handleCancel(cancelId)}>Yes, Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
