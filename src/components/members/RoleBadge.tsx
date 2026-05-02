import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const roleConfig = ROLES.find(r => r.id === role?.toLowerCase() || r.label === role);
  return (
    <Badge className={cn("rounded-full px-2 text-[10px] font-bold uppercase tracking-wider", roleConfig?.color || "bg-[#eae6e0] text-[#535366]")}>
      {roleConfig?.label || role || 'Member'}
    </Badge>
  );
}
