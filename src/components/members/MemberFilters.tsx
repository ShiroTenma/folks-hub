import { Search, ArrowUpDown, Tag as TagIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { DIVISIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { SortOption } from '@/hooks/useMembers';

interface MemberFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  divisionFilter: string;
  onDivisionFilterChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  sortBy: SortOption;
  onSortByChange: (value: SortOption) => void;
  allAvailableTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export function MemberFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  divisionFilter,
  onDivisionFilterChange,
  roleFilter,
  onRoleFilterChange,
  sortBy,
  onSortByChange,
  allAvailableTags,
  selectedTags,
  onToggleTag,
  onClearTags
}: MemberFiltersProps) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-visible">
      <CardContent className="p-4 md:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or student ID..." 
              className="pl-11 bg-slate-50 border-slate-100 rounded-2xl h-12 focus-visible:ring-indigo-500 font-medium"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Compact Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[130px] rounded-2xl h-12 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={divisionFilter} onValueChange={onDivisionFilterChange}>
              <SelectTrigger className="w-[160px] rounded-2xl h-12 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Divisions</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {DIVISIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={onRoleFilterChange}>
              <SelectTrigger className="w-[140px] rounded-2xl h-12 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-2xl h-12 gap-2 border-slate-200 text-xs font-bold uppercase tracking-wider px-4">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSortByChange('name_asc')} className="text-xs font-bold py-3">Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortByChange('name_desc')} className="text-xs font-bold py-3">Name (Z-A)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortByChange('newest')} className="text-xs font-bold py-3">Newest Joined</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSortByChange('oldest')} className="text-xs font-bold py-3">Oldest</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active Filters & Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <div className="flex items-center gap-2 text-slate-400 mr-2">
            <TagIcon className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter Tags:</span>
          </div>
          {allAvailableTags.length === 0 ? (
            <span className="text-[10px] font-bold text-slate-300 uppercase italic">No tags defined</span>
          ) : (
            allAvailableTags.map(tag => (
              <Badge
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={cn(
                  "cursor-pointer rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-tight transition-all",
                  selectedTags.includes(tag) 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {tag}
              </Badge>
            ))
          )}
          {selectedTags.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearTags}
              className="h-7 text-[10px] font-black text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase px-2"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
