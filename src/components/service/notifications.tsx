import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './session';

export function Notifications() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: !!user,
    refetchInterval: 30000,
    queryFn: async () => {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });
  const unread = data.filter((n) => !n.read_at);
  const markAll = async () => {
    if (!unread.length) return;
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', unread.map((n) => n.id));
    await qc.invalidateQueries({ queryKey: ['notifications'] });
  };
  return (
    <DropdownMenu onOpenChange={(o) => { if (!o) void markAll(); }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Notificações${unread.length ? `, ${unread.length} novas` : ''}`} className="relative">
          <Bell size={18} />
          {unread.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] leading-4">{unread.length}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notificações</DropdownMenuLabel>
        {data.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma notificação.</p>}
        {data.map((n) => (
          <DropdownMenuItem key={n.id} className="flex-col items-start gap-0.5">
            <span className={n.read_at ? 'text-muted-foreground text-sm' : 'font-medium text-sm'}>{n.message}</span>
            <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString('pt-BR')}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
