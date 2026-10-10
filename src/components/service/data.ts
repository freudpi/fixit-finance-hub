import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
export type Order=Database['public']['Tables']['service_orders']['Row'];
export type Client=Database['public']['Tables']['clients']['Row'];
export const statuses=['Aberta','Em análise','Aguardando aprovação','Em reparo','Aguardando peças','Concluída','Entregue','Cancelada'];
export const money=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
export const day=(s:string)=>new Date(s.length===10?s+'T12:00:00':s).toLocaleDateString('pt-BR');
export async function loadOrders(){const {data,error}=await supabase.from('service_orders').select('*').order('created_at',{ascending:false});if(error)throw error;return data;}
export async function loadClients(){const {data,error}=await supabase.from('clients').select('*').order('name');if(error)throw error;return data;}
export function pageHead(title:string,description:string){return {meta:[{title:title+' — Eletrônica Silva'},{name:'description',content:description},{property:'og:title',content:title+' — Eletrônica Silva'},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};}
