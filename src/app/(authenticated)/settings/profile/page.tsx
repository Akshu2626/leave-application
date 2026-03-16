'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth-store';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-2" variant="secondary">{user.role}</Badge>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings size={18} /> Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm mb-1.5 block">First Name</Label>
                  <Input defaultValue={user.firstName} />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block">Last Name</Label>
                  <Input defaultValue={user.lastName} />
                </div>
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Email</Label>
                <Input defaultValue={user.email} disabled />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Role</Label>
                <Input defaultValue={user.role} disabled />
              </div>
              <Button type="submit">
                <Save size={16} className="mr-2" /> Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
