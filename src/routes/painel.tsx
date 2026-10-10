import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ServiceShell } from '@/components/service/shell';
import { useSession } from '@/components/service/session';
import { loadOrders, pageHead, money, statuses, day } from '@/components/service/data';
import { loadEntries } from '@/components/service/finance';

export const Route = createFileRoute('/painel')({
  head: () => pageHead('Painel', 'Indicadores de serviços, faturamento e aprovações da Eletrônica Silva.'),
  component: Dashboard,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);

function Dashboard() {
  const { user } = useSession();
  const { data: orders = [] } = useQuery({ queryKey: ['orders', user?.id], queryFn: loadOrders, enabled: !!user });
  const { data: entries = [] } = useQuery({ queryKey: ['finance', user?.id], queryFn: loadEntries, enabled: !!user });
  const now = new Date();
  const [from, setFrom] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(iso(now));
  const inRange = (d: string | null) => !!d && d.slice(0, 10) >= from && d.slice(0, 10) <= to;
  const received = entries.filter((e) => e.kind === 'Receita' && inRange(e.paid_date));
  const revenue = received.reduce((n, e) => n + Number(e.amount), 0);
  const expenses = entries.filter((e) => e.kind !== 'Receita' && inRange(e.paid_date)).reduce((n, e) => n + Number(e.amount), 0);
  const periodOrders = orders.filter((o) => inRange(o.created_at));
  const awaiting = orders.filter((o) => o.status === 'Aguardando aprovação');
  const max = Math.max(1, ...statuses.map((s) => orders.filter((o) => o.status === s).length));

  return (
    <ServiceShell title="Painel">
      <div className="page-heading">
        <div><p className="eyebrow"><span /> INDICADORES</p><h1>Painel</h1><p className="subtitle">Serviços, faturamento e aprovações em um só lugar.</p></div>
        <div className="flex gap-3 items-end">
          <label className="field">De<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="field">Até<input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
        </div>
      </div>
      <div className="metrics">
        <div className="metric"><div className="metric-label">Faturamento do período</div><strong className="amount-metric">{money(revenue)}</strong><span className="metric-note">{received.length} receitas recebidas</span></div>
        <div className="metric"><div className="metric-label">Resultado do período</div><strong className="amount-metric">{money(revenue - expenses)}</strong><span className="metric-note">Despesas pagas: {money(expenses)}</span></div>
        <div className="metric"><div className="metric-label">Ordens abertas no período</div><strong>{String(periodOrders.length).padStart(2, '0')}</strong><span className="metric-note">Valor: {money(periodOrders.reduce((n, o) => n + Number(o.amount), 0))}</span></div>
        <div className="metric"><div className="metric-label">Aguardando aprovação</div><strong>{String(awaiting.length).padStart(2, '0')}</strong><span className="metric-note">Orçamentos: {money(awaiting.reduce((n, o) => n + Number(o.amount), 0))}</span></div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="orders-section">
          <div className="section-heading"><h2>Serviços por status</h2></div>
          <div className="p-5 grid gap-3">
            {statuses.map((s) => { const n = orders.filter((o) => o.status === s).length; return (
              <div key={s} className="grid grid-cols-[150px_1fr_32px] items-center gap-3 text-sm">
                <span>{s}</span>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
                <strong className="text-right">{n}</strong>
              </div>); })}
          </div>
        </section>
        <section className="orders-section">
          <div className="section-heading"><h2>Ordens aguardando aprovação <span className="count">{awaiting.length}</span></h2></div>
          <div className="table-scroll"><table><thead><tr><th>Nº OS</th><th>CLIENTE / EQUIPAMENTO</th><th>ENTRADA</th><th>VALOR</th></tr></thead><tbody>
            {awaiting.map((o) => <tr key={o.id}><td className="order-number">#{String(o.number).padStart(4, '0')}</td><td><strong>{o.client_name}</strong><span className="equipment-name">{o.equipment}</span></td><td>{day(o.created_at)}</td><td className="font-semibold">{money(o.amount)}</td></tr>)}
          </tbody></table>
          {awaiting.length === 0 && <div className="empty-state"><h3>Nenhuma ordem aguardando aprovação</h3><p>{user ? 'Use o status "Aguardando aprovação" ao enviar um orçamento.' : 'Entre para ver seus indicadores.'}</p></div>}</div>
        </section>
      </div>
    </ServiceShell>
  );
}
