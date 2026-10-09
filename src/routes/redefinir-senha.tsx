import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ServiceShell } from '@/components/service/shell';
import { pageHead } from '@/components/service/data';
export const Route=createFileRoute('/redefinir-senha')({head:()=>pageHead('Redefinir senha','Atualize a senha da sua conta Eletrônica Silva.'),component:Reset});
function Reset(){const [message,setMessage]=useState('');return <ServiceShell title="Redefinir senha"><h1>Redefinir senha</h1><form className="max-w-sm space-y-4 mt-6" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const {error}=await supabase.auth.updateUser({password:String(f.get('password'))});setMessage(error?.message??'Senha atualizada com sucesso.')}}><label className="field">Nova senha<input name="password" type="password" required minLength={8}/></label><Button>Atualizar senha</Button><p role="status">{message}</p></form></ServiceShell>}
