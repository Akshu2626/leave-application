'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { settingsApi } from '@/lib/api';
import { CalendarHeart, Plus, Trash2, Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Holiday } from '@/types';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);

  const fetchHolidays = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getHolidays();
      const data = res.data?.data || res.data?.body || res.data || [];
      setHolidays(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
      toast.error('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleDelete = (id: string) => {
    // Placeholder for actual API call
    setHolidays((prev) => prev.filter((h) => h._id !== id));
    toast.success('Holiday deleted successfully');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Holiday Management</h1>
            <p className="page-subtitle">Manage public holidays and company-wide off days</p>
          </div>
          <Button size="sm" onClick={() => { setEditHoliday(null); setShowDialog(true); }}>
            <Plus size={16} className="mr-2" /> Add Holiday
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading holidays...</p>
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-medium">No holidays scheduled</p>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Recurring</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map((h) => (
                    <TableRow key={h._id}>
                      <TableCell className="font-medium">{h.name}</TableCell>
                      <TableCell>
                        {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        {h.isRecurring ? (
                          <Badge variant="secondary" className="text-xs">Recurring</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">One-time</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditHoliday(h); setShowDialog(true); }}>
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDelete(h._id)}>
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
            <DialogTitle>{editHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm mb-1.5 block">Holiday Name</Label>
              <Input defaultValue={editHoliday?.name || ''} placeholder="e.g. Diwali" />
            </div>
            <div>
              <Label className="text-sm mb-1.5 block">Date</Label>
              <Input type="date" defaultValue={editHoliday?.date || ''} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="recurring" defaultChecked={editHoliday?.isRecurring} className="rounded" />
              <Label htmlFor="recurring" className="text-sm">Recurring annually</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => { setShowDialog(false); toast.success(editHoliday ? 'Holiday updated' : 'Holiday added'); }}>
              {editHoliday ? 'Save' : 'Add Holiday'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
