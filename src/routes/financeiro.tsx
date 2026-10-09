import { createFileRoute } from '@tanstack/react-router';
import { FinancePage } from '@/components/service/finance';
import { pageHead } from '@/components/service/data';
export const Route=createFileRoute('/financeiro')({head:()=>pageHead('Financeiro','Receitas, despesas e fluxo de caixa da Eletrônica Silva.'),component:FinancePage});