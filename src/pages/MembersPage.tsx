import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  UserPlus, 
  Filter, 
  MoreHorizontal,
  Mail,
  Hash,
  Trash2,
  Edit2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'motion/react';
import { supabase, type Profile } from '@/lib/supabase';
import { ROLES, DIVISIONS, BATCH_YEARS } from '@/lib/constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createNotification } from '@/lib/notifications';

const getRoleBadge = (role: string) => {
  const roleConfig = ROLES.find(r => r.id === role?.toLowerCase() || r.label === role);
  return (
    <Badge className={cn("rounded-full px-2 text-[10px] font-bold uppercase tracking-wider", roleConfig?.color || "bg-slate-100 text-slate-700")}>
      {roleConfig?.label || role || 'Member'}
    </Badge>
  );
};

export function MembersPage() {
  const [search, setSearch] = React.useState('');
  const [divisionFilter, setDivisionFilter] = React.useState<string>('all');
  const [members, setMembers] = React.useState<Profile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Profile | null>(null);
  
  // Form state
  const [formData, setFormData] = React.useState({
    full_name: '',
    student_id: '',
    division: '',
    role: 'member' as Profile['role'],
    status: 'active' as Profile['status'],
    contact: '',
    batch: BATCH_YEARS[0] as string
  });

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (err: any) {
      toast.error('Failed to fetch members: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (member?: Profile) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        full_name: member.full_name || '',
        student_id: member.student_id || '',
        division: member.division || DIVISIONS[0],
        role: member.role || 'member',
        status: member.status || 'active',
        contact: member.contact || '',
        batch: member.batch || BATCH_YEARS[0]
      });
    } else {
      setEditingMember(null);
      setFormData({
        full_name: '',
        student_id: '',
        division: DIVISIONS[0],
        role: 'member',
        status: 'active',
        contact: '',
        batch: BATCH_YEARS[0]
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveMember = async () => {
    if (!formData.full_name || !formData.student_id || !formData.division) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember) {
        const { error } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', editingMember.id);

        if (error) throw error;
        toast.success('Member profile updated successfully');
        await createNotification('Member Updated', `Profile for ${formData.full_name} has been modified.`, 'info');
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert({
            ...formData,
            id: crypto.randomUUID()
          });

        if (error) throw error;
        toast.success('New member added successfully');
        await createNotification('New Member Added', `${formData.full_name} has been added to the database.`, 'success');
      }
      
      setIsDialogOpen(false);
      fetchMembers();
    } catch (err: any) {
      toast.error('Error saving member: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevokeAccess = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Member access revoked');
      await createNotification('Access Revoked', `Member ${name} has been removed from the organization.`, 'warning');
      fetchMembers();
    } catch (err: any) {
      toast.error('Error revoking access: ' + err.message);
    }
  };

  const filteredMembers = members.filter(m => {
    const fullName = m.full_name?.toLowerCase() || '';
    const sid = m.student_id?.toLowerCase() || '';
    const division = m.division?.toLowerCase() || '';
    const query = search.toLowerCase();

    const matchesSearch = fullName.includes(query) || sid.includes(query) || division.includes(query);
    const matchesDivision = divisionFilter === 'all' || m.division === divisionFilter;

    return matchesSearch && matchesDivision;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Member Database</h1>
          <p className="text-slate-500 text-sm">Manage organizational members and their roles.</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          ADD NEW MEMBER
        </Button>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="pb-3 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search members..." 
                className="pl-9 bg-slate-50 border-slate-100 rounded-xl focus-visible:ring-indigo-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 h-10 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
                <Filter className="h-4 w-4" />
                {divisionFilter === 'all' ? 'Filter' : divisionFilter}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-200">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">By Division</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDivisionFilter('all')} className="text-xs font-bold uppercase py-2 cursor-pointer">
                  All Divisions
                </DropdownMenuItem>
                {DIVISIONS.map(div => (
                  <DropdownMenuItem key={div} onClick={() => setDivisionFilter(div)} className="text-xs font-bold uppercase py-2 cursor-pointer">
                    {div}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 py-4 pl-6">Member</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Student ID</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Division</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Role</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                      Loading member database...
                    </TableCell>
                  </TableRow>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member, i) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold">
                              {member.full_name ? member.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-tight">{member.full_name || 'Anonymous'}</span>
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <Mail className="h-3 w-3 text-slate-300" /> {member.contact || 'No contact'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-slate-300" />
                          {member.student_id || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{member.division || 'Unassigned'}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch {member.batch || '-'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            member.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'
                          )}></div>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            member.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                          )}>
                            {member.status || 'inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-slate-200 w-48 shadow-lg">
                            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Member Actions</div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleOpenDialog(member)}
                              className="gap-2 focus:bg-indigo-50 focus:text-indigo-600 cursor-pointer text-sm font-medium py-2"
                            >
                              <Edit2 className="h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleRevokeAccess(member.id, member.full_name)}
                              className="gap-2 text-rose-600 focus:bg-rose-50 focus:text-rose-600 cursor-pointer text-sm font-bold py-2"
                            >
                              <Trash2 className="h-4 w-4" /> Revoke Access
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium italic">
                      No members found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-3">
        {DIVISIONS.slice(1).map((div) => (
          <Card key={div} className="rounded-2xl border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">{div}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {members.filter(m => m.division === div).length}
              </div>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">Active Members</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              {editingMember ? 'Edit Member Profile' : 'Add New Member'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-xs font-bold uppercase tracking-widest text-slate-400">Student ID</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  placeholder="e.g. 210123456"
                  className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Division</Label>
                <Select 
                  value={formData.division} 
                  onValueChange={(val) => setFormData({ ...formData, division: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 w-full h-11">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div} value={div}>{div}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val: Profile['role']) => setFormData({ ...formData, role: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 w-full h-11">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-xs font-bold uppercase tracking-widest text-slate-400">Email/Contact</Label>
                <Input
                  id="contact"
                  type="email"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. john@university.edu"
                  className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val: Profile['status']) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 w-full h-11">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Batch Year</Label>
              <Select 
                value={formData.batch} 
                onValueChange={(val) => setFormData({ ...formData, batch: val })}
              >
                <SelectTrigger className="rounded-xl border-slate-200 bg-slate-50 focus-visible:ring-indigo-500 w-full h-11">
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  {BATCH_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveMember}
              disabled={isSaving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 px-8"
            >
              {isSaving ? 'Saving...' : editingMember ? 'Update Profile' : 'Add Member'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
