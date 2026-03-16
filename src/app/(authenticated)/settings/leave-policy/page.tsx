'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { settingsApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LeavePolicy } from '@/types';

export default function LeavePolicyPage() {
  const [policies, setPolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editPolicy, setEditPolicy] = useState<LeavePolicy | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getLeavePolicies();
      const data = res.data?.data || res.data?.body || res.data || [];
      setPolicies(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch leave policies:', error);
      toast.error('Failed to load leave policies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleDelete = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p._id !== id));
    toast.success('Leave policy deleted successfully');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Leave Policies</h1>
            <p className="page-subtitle">Configure leave types and annual quotas</p>
          </div>
          <Button size="sm" onClick={() => { setEditPolicy(null); setShowDialog(true); }}>
            <Plus size={16} className="mr-2" /> Add Policy
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-medium">No leave policies defined</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Annual Quota</TableHead>
                    <TableHead>Applicable Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell className="font-medium">{p.leaveType}</TableCell>
                      <TableCell>{p.annualQuota} days</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {p.applicableRoles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">{role}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditPolicy(p); setShowDialog(true); }}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDelete(p._id)}>
                            <Trash2 size={14} />
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPolicy ? 'Edit Policy' : 'Add Leave Policy'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Leave Type</Label>
              <Input defaultValue={editPolicy?.leaveType || ''} placeholder="e.g. SICK" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Annual Quota (days)</Label>
              <Input type="number" defaultValue={editPolicy?.annualQuota || 10} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowDialog(false); toast.success(editPolicy ? 'Policy updated' : 'Policy created'); }}>
              {editPolicy ? 'Save' : 'Create Policy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
