import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, 
  Clock, 
  Upload, 
  ArrowUpRight, 
  UserCheck, 
  Edit3, 
  Trash2, 
  Tag,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitBillCardProps {
  bill: any;
  currentUserId: string;
  isAdmin: boolean;
  onUpload: (item: any) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onEdit?: (bill: any) => void;
  onDelete?: (id: string) => void;
}

export function SplitBillCard({ 
  bill, currentUserId, isAdmin, onUpload, onUpdateStatus, onEdit, onDelete 
}: SplitBillCardProps) {
  const paidItems = bill.split_bill_items?.filter((i: any) => i.status === 'approved') || [];
  const totalItems = bill.split_bill_items?.length || 0;
  const progress = totalItems > 0 ? (paidItems.length / totalItems) * 100 : 0;

  // Group items by member for the overview
  const groupedItems = bill.split_bill_items?.reduce((acc: any, item: any) => {
    const profileId = item.profile_id;
    if (!acc[profileId]) {
      acc[profileId] = {
        profile: item.profiles,
        items: [],
        total: 0,
        status: 'pending' // Simple status logic: if all items approved, status approved
      };
    }
    acc[profileId].items.push(item);
    acc[profileId].total += item.amount;
    return acc;
  }, {});

  return (
    <Card className="rounded-[3rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white hover:border-[#1c1c1c]/20 transition-all duration-500 premium-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="p-10 lg:w-1/3 border-b lg:border-b-0 lg:border-r-2 border-[#f4f2ef] space-y-6">
            <div className="flex items-center justify-between">
              <Badge className="bg-[#1c1c1c] text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-1 rounded-lg">Allocation Entry</Badge>
              <span className="text-[10px] font-black text-[#535366]/40 uppercase tracking-widest">{new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-2xl font-heading font-black tracking-tight text-[#1c1c1c] leading-tight italic">{bill.title}</h3>
                <p className="text-[10px] text-[#535366]/60 font-medium uppercase tracking-widest line-clamp-2 leading-relaxed">{bill.description}</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="h-8 w-8 rounded-full border-2 border-[#dcd7cf] p-0.5 overflow-hidden bg-[#f4f2ef]">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={bill.creator?.avatar_url} />
                    <AvatarFallback className="text-[8px] font-black">{bill.creator?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#535366]/40">Initiated By</span>
                  <span className="text-[10px] font-black text-[#1c1c1c] uppercase">{bill.creator?.full_name || 'System Auto'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 p-6 bg-[#f4f2ef]/50 rounded-[2rem] border-2 border-[#dcd7cf] shadow-inner">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mb-2">Total Managed Capital</p>
              <p className="text-3xl font-heading font-black text-[#1c1c1c] tracking-tighter">Rp {Number(bill.total_amount).toLocaleString()}</p>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40">
                <span>Synchronized</span>
                <span>{paidItems.length} / {totalItems} Settled</span>
              </div>
              <div className="w-full bg-[#f4f2ef] h-3 rounded-full overflow-hidden border border-[#dcd7cf]">
                <div className="bg-[#1c1c1c] h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 pt-6">
                <Button variant="outline" size="sm" className="rounded-xl h-10 flex-1 font-black text-[9px] uppercase tracking-widest border-2 border-[#dcd7cf] hover:border-[#1c1c1c] gap-2" onClick={() => onEdit?.(bill)}>
                  <Edit3 className="h-3.5 w-3.5" /> Modify
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl h-10 flex-1 font-black text-[9px] uppercase tracking-widest border-2 border-[#dcd7cf] hover:border-rose-500 hover:text-rose-500 gap-2" onClick={() => onDelete?.(bill.id)}>
                  <Trash2 className="h-3.5 w-3.5" /> Expunge
                </Button>
              </div>
            )}
          </div>

          <div className="p-10 flex-1 bg-[#f4f2ef]/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-8 rounded-lg bg-white border border-[#dcd7cf] flex items-center justify-center text-[#535366]">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1c1c1c]">Itemized Registry ({totalItems})</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bill.split_bill_items?.map((item: any) => (
                <div key={item.id} className="bg-white p-6 rounded-[2rem] border-2 border-[#dcd7cf] shadow-xl shadow-black/5 flex flex-col gap-4 group hover:border-[#1c1c1c] transition-all duration-500 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl ring-4 ring-white shadow-lg shrink-0 group-hover:scale-110 transition-transform">
                        <AvatarImage src={item.profiles?.avatar_url} />
                        <AvatarFallback className="text-[10px] font-black bg-[#f4f2ef] text-[#1c1c1c] uppercase">{item.profiles?.full_name?.split(' ').map((n:any)=>n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="text-xs font-black text-[#1c1c1c] truncate uppercase tracking-tighter">{item.profiles?.full_name}</p>
                        <p className="text-[9px] font-black text-[#535366]/40 uppercase tracking-widest">Assigned Member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.profile_id === currentUserId && item.status === 'pending' && (
                        <Button size="icon" className="h-9 w-9 rounded-xl bg-[#1c1c1c] hover:bg-[#535366] text-white shadow-xl shadow-black/10 transition-all active:scale-90" onClick={() => onUpload(item)}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      {isAdmin && item.status === 'paid' && (
                        <Button size="icon" className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 transition-all active:scale-90" onClick={() => onUpdateStatus(item.id, 'approved')}>
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status === 'approved' && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                      {item.status === 'paid' && !isAdmin && <Clock className="h-6 w-6 text-amber-500 animate-pulse" />}
                    </div>
                  </div>

                  <div className="bg-[#f4f2ef] p-4 rounded-2xl border-2 border-[#dcd7cf] shadow-inner relative group/item">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-white border border-[#dcd7cf] flex items-center justify-center text-[#535366]/40 group-hover/item:text-[#1c1c1c] transition-colors">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-[10px] font-black text-[#1c1c1c] uppercase tracking-tighter truncate">{item.item_name || 'Individual Share'}</p>
                          <p className="text-[9px] font-black text-[#535366]/30 uppercase tracking-[0.2em]">Registry Item</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-heading font-black text-[#1c1c1c] tracking-tight">Rp {Number(item.amount).toLocaleString()}</p>
                        <p className={cn(
                          "text-[8px] font-black uppercase tracking-widest",
                          item.status === 'approved' ? "text-emerald-500" : item.status === 'paid' ? "text-amber-500" : "text-[#535366]/40"
                        )}>{item.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
