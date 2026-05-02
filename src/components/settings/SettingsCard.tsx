import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  label: string;
  placeholder: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  children?: React.ReactNode;
}

export function SettingsCard({
  title, description, icon: Icon, label, placeholder, items, onItemsChange, children
}: SettingsCardProps) {
  const [newValue, setNewValue] = useState('');

  const addItem = () => {
    if (!newValue || items.includes(newValue)) return;
    onItemsChange([...items, newValue]);
    setNewValue('');
  };

  const removeItem = (item: string) => {
    onItemsChange(items.filter(i => i !== item));
  };

  return (
    <Card className="rounded-[2.5rem] border-2 border-[#dcd7cf] shadow-2xl shadow-black/5 overflow-hidden bg-white premium-shadow">
      <CardHeader className="bg-[#f4f2ef]/50 border-b-2 border-[#f4f2ef] p-10">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-[#1c1c1c] border-2 border-[#dcd7cf] shadow-xl shadow-black/5">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl font-heading font-black tracking-tight text-[#1c1c1c]">{title}</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-[#535366]/40 mt-1">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 space-y-10">
        {children}
        
        <div className="space-y-5">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/40 ml-1">{label}</Label>
          <div className="flex gap-3">
            <Input 
              placeholder={placeholder}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="rounded-2xl border-2 border-[#dcd7cf] h-14 font-bold px-6 focus:border-[#1c1c1c] focus:ring-0 bg-[#f4f2ef]/30"
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <Button onClick={addItem} className="bg-[#1c1c1c] text-white rounded-2xl h-14 w-14 p-0 shadow-xl shadow-black/10 hover:bg-[#535366] transition-all shrink-0">
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {items.map(item => (
              <Badge key={item} className="bg-[#f4f2ef] text-[#1c1c1c] hover:bg-[#1c1c1c] hover:text-white border-2 border-[#dcd7cf] py-3 px-6 rounded-2xl flex items-center gap-3 group transition-all duration-300 shadow-sm">
                <span className="font-black text-xs uppercase tracking-widest">{item}</span>
                <button onClick={() => removeItem(item)} className="text-[#535366]/40 group-hover:text-white/60 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </Badge>
            ))}
            {items.length === 0 && (
              <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#535366]/20 bg-[#f4f2ef]/50 px-6 py-4 rounded-2xl border-2 border-dashed border-[#dcd7cf] w-full justify-center">
                Registry Empty
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
