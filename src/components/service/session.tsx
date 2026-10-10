import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
export type Role='admin'|'tecnico'|'atendente'|'inativo';
const SessionContext = createContext<{user:User|null;ready:boolean;role:Role|null}>({user:null,ready:false,role:null});
export function SessionProvider({children}:{children:ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false);const [role,setRole]=useState<Role|null>(null); const qc=useQueryClient();
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUser(data.user);setReady(true)}); const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'){setUser(session?.user??null);if(event!=='SIGNED_OUT')void qc.invalidateQueries();} });return ()=>data.subscription.unsubscribe();},[qc]);
 useEffect(()=>{if(!user){setRole(null);return}let on=true;(async()=>{await supabase.rpc('link_membership');const {data}=await supabase.rpc('my_role');if(on)setRole((data as Role)??'inativo');})();return()=>{on=false}},[user?.id]);
 return <SessionContext.Provider value={{user,ready,role}}>{children}</SessionContext.Provider>
}
export const useSession=()=>useContext(SessionContext);
