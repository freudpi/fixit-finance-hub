import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServiceShell } from '@/components/service/shell';
import { useSession } from '@/components/service/session';
import { pageHead } from '@/components/service/data';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/auditoria')({
  head: () => pageHead('Auditoria', 'Histórico de alterações em ordens, clientes e financeiro da Eletrônica Silva.'),
  component: AuditPage,
});

const tables: Record<string, string> = { service_orders: 'Ordem de serviço', clients: 'Cliente', financial_entries: 'Lançamento financeiro', bank_accounts: 'Conta bancária' };
const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

function AuditPage() {
  const { user } = useSession();
  const [table, setTable] = useState('');
  const { data = [], isLoading } = useQuery({
    queryKey: ['audit', user?.id, table],
    enabled: !!user,
    queryFn: async () => {
      let q = supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200);
      if (table) q = q.eq('table_name', table);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
  return (
    <ServiceShell title="Auditoria">
      <div className="page-heading">
        <div><p className="eyebrow"><span /> SEGURANÇA</p><h1>Auditoria</h1><p className="subtitle">Quem alterou o quê e quando.</p></div>
        <select className="status-select" aria-label="Filtrar registro" value={table} onChange={(e) => setTable(e.target.value)}>
          <option value="">Todos os registros</option>
          {Object.entries(tables).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <section className="orders-section"><div className="table-scroll"><table>
        <thead><tr><th>DATA</th><th>USUÁRIO</th><th>REGISTRO</th><th>AÇÃO</th><th>ALTERAÇÕES</th></tr></thead>
        <tbody>{data.map((a) => {
          const ch = (a.changes ?? {}) as Record<string, unknown>;
          return (
            <tr key={a.id}>
              <td className="whitespace-nowrap">{new Date(a.created_at).toLocaleString('pt-BR')}</td>
              <td>{a.user_email || 'Sistema'}</td>
              <td>{tables[a.table_name] ?? a.table_name}</td>
              <td>{a.action}</td>
              <td className="text-xs max-w-md">{Object.entries(ch).filter(([k]) => k !== 'id').slice(0, 8).map(([k, v]) => {
                const d = v as { de?: unknown; para?: unknown } | null;
                return <div key={k} className="break-words"><strong>{k}</strong>: {a.action === 'Alteração' && d && typeof d === 'object' ? `${show(d.de)} → ${show(d.para)}` : show(v)}</div>;
              })}</td>
            </tr>);
        })}</tbody>
      </table>
      {data.length === 0 && <div className="empty-state"><h3>{isLoading ? 'Carregando…' : 'Nenhuma alteração registrada'}</h3><p>As mudanças em ordens, clientes e financeiro aparecem aqui.</p></div>}
      </div></section>
    </ServiceShell>
  );
}
