import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
const SessionContext = createContext<{user:User|null;ready:boolean}>({user:null,ready:false});
export function SessionProvider({children}:{children:ReactNode}) {
 const [user,setUser]=useState<User|null>(null); const [ready,setReady]=useState(false); const qc=useQueryClient();
 useEffect(()=>{supabase.auth.getUser().then(({data})=>{setUser(data.user);setReady(true)}); const {data}=supabase.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'){setUser(session?.user??null);if(event!=='SIGNED_OUT')void qc.invalidateQueries();} });return ()=>data.subscription.unsubscribe();},[qc]);
 return <SessionContext.Provider value={{user,ready}}>{children}</SessionContext.Provider>
}
export const useSession=()=>useContext(SessionContext);
