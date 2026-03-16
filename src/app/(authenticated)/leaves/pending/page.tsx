'use client'
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { leavesApi } from '@/lib/api';
import { ClipboardList, Check, X, Loader2, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

export default function PendingLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLeave, setActionLeave] = useState<{ id: string; action: 'approve' | 'decline' } | null>(null);
  const [comment, setComment] = useState('');

  const fetchPendingLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leavesApi.getPending();
      const data = res.data?.data || res.data?.body || res.data;
      const records = Array.isArray(data) ? data : (data?.records || []);
      setLeaves(records);
    } catch (error) {
      console.error('Fetch pending leaves error:', error);
      toast.error('Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLeaves();
  }, [fetchPendingLeaves]);

  const handleAction = async () => {
    if (!actionLeave) return;
    if (actionLeave.action === 'decline' && !comment.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    setActionLoading(true);
    try {
      if (actionLeave.action === 'approve') {
        await leavesApi.approve(actionLeave.id, comment);
        toast.success('Leave request approved');
      } else {
        await leavesApi.decline(actionLeave.id, comment);
        toast.success('Leave request declined');
      }

      // Refresh the list after action
      await fetchPendingLeaves();
      setActionLeave(null);
      setComment('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${actionLeave.action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Pending Leave Requests</h1>
        <p className="page-subtitle">Review and manage your team&apos;s leave requests</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ClipboardList size={18} /> Pending Requests
            <Badge variant="destructive" className="ml-2">{leaves.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
              <p>Loading pending requests...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={48} className="text-muted-foreground" />
              <p className="text-lg font-medium mt-3">All caught up!</p>
              <p className="text-sm text-muted-foreground">No pending leave requests to review</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave: any) => (
                    <TableRow key={leave._id || leave.id}>
                      <TableCell className="font-medium">{leave.userName || leave.user?.firstName || leave.user?.email || leave.userEmail || 'Unknown'}</TableCell>
                      <TableCell>
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
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setActionLeave({ id: leave._id, action: 'approve' })}
                          >
                            <Check size={14} className="mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs"
                            onClick={() => setActionLeave({ id: leave._id, action: 'decline' })}
                          >
                            <X size={14} className="mr-1" /> Decline
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionLeave} onOpenChange={(open) => !open && setActionLeave(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionLeave?.action === 'approve' ? 'Approve Leave' : 'Decline Leave'}
            </DialogTitle>
            <DialogDescription>
              {actionLeave?.action === 'approve'
                ? 'Confirm approval of this leave request.'
                : 'Please provide a reason for declining this request.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-sm mb-1.5 block">
              Comment {actionLeave?.action === 'decline' ? '*' : '(optional)'}
            </Label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionLeave(null)}>Cancel</Button>
            <Button
              variant={actionLeave?.action === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              {actionLeave?.action === 'approve' ? 'Confirm Approval' : 'Confirm Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
