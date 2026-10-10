import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Power } from 'lucide-react';
import { ServiceShell } from '@/components/service/shell';
import { useSession } from '@/components/service/session';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { pageHead, loadTeam, roleLabel, type Member } from '@/components/service/data';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/equipe')({
  head: () => pageHead('Equipe', 'Usuários da equipe e perfis de acesso da Eletrônica Silva.'),
  component: TeamPage,
});

function TeamPage() {
  const { user } = useSession();
  const qc = useQueryClient();
  const { data: team = [], error } = useQuery({ queryKey: ['team', user?.id], queryFn: loadTeam, enabled: !!user });
  const [edit, setEdit] = useState<Member | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['team'] });
  const toggle = async (m: Member) => { await supabase.from('team_members').update({ active: !m.active }).eq('id', m.id); await refresh(); };

  return (
    <ServiceShell title="Equipe">
      <div className="page-heading">
        <div><p className="eyebrow"><span /> ACESSOS</p><h1>Equipe</h1><p className="subtitle">Cadastre técnicos e atendentes e defina o que cada um pode fazer.</p></div>
        <Button onClick={() => { setMsg(''); setEdit(null); }}><Plus />Novo usuário</Button>
      </div>
      <section className="orders-section">
        <div className="table-scroll"><table>
          <thead><tr><th>NOME</th><th>E-MAIL</th><th>PERFIL</th><th>SITUAÇÃO</th><th className="text-right">AÇÕES</th></tr></thead>
          <tbody>{team.map((m) => (
            <tr key={m.id}>
              <td><strong>{m.name}</strong></td>
              <td>{m.email}</td>
              <td>{roleLabel[m.role]}</td>
              <td><span className={`badge ${m.active ? 'green' : 'neutral'}`}><span />{m.active ? (m.user_id ? 'Ativo' : 'Aguardando primeiro acesso') : 'Desativado'}</span></td>
              <td><div className="flex justify-end">
                <Button variant="ghost" size="icon" aria-label={`Editar ${m.name}`} onClick={() => { setMsg(''); setEdit(m); }}><Pencil size={16} /></Button>
                <Button variant="ghost" size="icon" aria-label={m.active ? `Desativar ${m.name}` : `Reativar ${m.name}`} title={m.active ? 'Desativar' : 'Reativar'} onClick={() => toggle(m)}><Power size={16} /></Button>
              </div></td>
            </tr>))}
          </tbody>
        </table>
        {team.length === 0 && <div className="empty-state"><h3>{error ? 'Não foi possível carregar a equipe' : 'Nenhum usuário na equipe'}</h3><p>Cadastre o e-mail do técnico ou atendente. Ele cria a conta com esse mesmo e-mail e já entra com o perfil definido.</p></div>}
        </div>
      </section>
      <div className="bottom-note mt-4"><span><strong>Administrador:</strong> tudo, incluindo financeiro, bancos, equipe e auditoria. <strong>Atendente:</strong> ordens, clientes e painel. <strong>Técnico:</strong> consulta clientes e atualiza ordens.</span></div>
      {edit !== undefined && (
        <Dialog open onOpenChange={(v) => { if (!v) setEdit(undefined); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>{edit ? 'Editar usuário' : 'Novo usuário da equipe'}</DialogTitle></DialogHeader>
            <form className="grid gap-4" onSubmit={async (e) => {
              e.preventDefault(); setBusy(true);
              const f = new FormData(e.currentTarget);
              const data = { name: String(f.get('name')).trim(), email: String(f.get('email')).trim().toLowerCase(), role: String(f.get('role')) };
              const r = edit ? await supabase.from('team_members').update(data).eq('id', edit.id) : await supabase.from('team_members').insert(data);
              setBusy(false);
              if (r.error) setMsg(r.error.code === '23505' ? 'Este e-mail já faz parte de uma equipe.' : 'Não foi possível salvar o usuário.');
              else { await refresh(); setEdit(undefined); }
            }}>
              <label className="field">Nome<input name="name" required maxLength={120} defaultValue={edit?.name ?? ''} /></label>
              <label className="field">E-mail de acesso<input name="email" type="email" required maxLength={200} defaultValue={edit?.email ?? ''} disabled={!!edit?.user_id} /></label>
              {edit?.user_id && <input type="hidden" name="email" value={edit.email} />}
              <label className="field">Perfil<select name="role" defaultValue={edit?.role ?? 'tecnico'}><option value="tecnico">Técnico</option><option value="atendente">Atendente</option></select></label>
              {msg && <p role="alert" className="text-primary">{msg}</p>}
              <Button disabled={busy}>{busy ? 'Salvando…' : 'Salvar usuário'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </ServiceShell>
  );
}
