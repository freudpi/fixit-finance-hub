import { createFileRoute } from '@tanstack/react-router';
import { OrdersPage } from '@/components/service/orders';
import { pageHead } from '@/components/service/data';
export const Route=createFileRoute('/')({head:()=>pageHead('Ordens de serviço','Gerencie os reparos, equipamentos e atendimentos da Eletrônica Silva.'),component:OrdersPage});
