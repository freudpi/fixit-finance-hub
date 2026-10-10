import type { Order, Client } from './data';
import logo from '@/assets/logo.png.asset.json';

export type DocKind = 'os' | 'orcamento' | 'recibo';
const titles: Record<DocKind, string> = { os: 'ORDEM DE SERVIÇO', orcamento: 'ORÇAMENTO', recibo: 'RECIBO' };
const RED: [number, number, number] = [220, 38, 38];
const DARK: [number, number, number] = [17, 17, 17];
const GRAY: [number, number, number] = [107, 114, 128];
const brl = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
const dt = (s: string) => new Date(s.length === 10 ? s + 'T12:00:00' : s).toLocaleDateString('pt-BR');

async function logoData(): Promise<string | null> {
  try {
    const blob = await (await fetch(logo.url)).blob();
    return await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(blob); });
  } catch { return null; }
}

export async function generatePdf(kind: DocKind, o: Order, c?: Client) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210, M = 16;
  let y = 14;
  const img = await logoData();
  if (img) { const p = doc.getImageProperties(img); const h = 18; doc.addImage(img, 'PNG', M, y, (p.width / p.height) * h, h); }
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY);
  ['Conj. Dirceu Arcoverde I, Qd. 39, Casa 14 — Itararé', 'Teresina – PI, 64078-112', '(86) 3030-0524 · WhatsApp (86) 99945-2100', 'sac@eletronicasilva.com.br'].forEach((l, i) => doc.text(l, W - M, y + 3 + i * 4, { align: 'right' }));
  y += 24;
  doc.setFillColor(...RED).rect(M, y, W - 2 * M, 1.2, 'F');
  y += 9;
  const num = '#' + String(o.number).padStart(4, '0');
  doc.setFont('helvetica', 'bold').setFontSize(17).setTextColor(...DARK).text(titles[kind], M, y);
  doc.setTextColor(...RED).text(num, W - M, y, { align: 'right' });
  y += 6;
  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...GRAY).text(`Emitido em ${new Date().toLocaleDateString('pt-BR')} · Entrada ${dt(o.created_at)}${o.due_date ? ' · Previsão ' + dt(o.due_date) : ''}`, M, y);
  y += 8;

  const section = (label: string) => { doc.setFillColor(245, 245, 245).rect(M, y, W - 2 * M, 7, 'F'); doc.setFillColor(...RED).rect(M, y, 1.5, 7, 'F'); doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor(...DARK).text(label, M + 4, y + 4.8); y += 11; };
  const row = (pairs: [string, string][]) => { const cw = (W - 2 * M) / pairs.length; pairs.forEach(([k, v], i) => { doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GRAY).text(k.toUpperCase(), M + i * cw, y); doc.setFontSize(10).setTextColor(...DARK).text(doc.splitTextToSize(v || '—', cw - 3)[0] ?? '—', M + i * cw, y + 5); }); y += 11; };
  const para = (k: string, v: string) => { doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(...GRAY).text(k.toUpperCase(), M, y); const lines = doc.splitTextToSize(v || '—', W - 2 * M); doc.setFontSize(10).setTextColor(...DARK).text(lines, M, y + 5); y += 6 + lines.length * 4.6; };

  section('CLIENTE');
  row([['Nome', o.client_name], ['CPF/CNPJ', c?.document ?? ''], ['Telefone', c?.phone ?? '']]);
  if (c) row([['Endereço', [c.street, c.address_number, c.neighborhood].filter(Boolean).join(', ')], ['Cidade', [c.city, c.state].filter(Boolean).join(' – ')], ['E-mail', c.email]]);
  section('EQUIPAMENTO E SERVIÇO');
  row([['Equipamento', o.equipment], ['Técnico', o.technician], ['Status', o.status]]);
  para('Defeito relatado', o.problem);
  para(kind === 'orcamento' ? 'Serviço proposto' : 'Diagnóstico / serviço executado', o.diagnosis);

  y += 2;
  doc.setFillColor(...DARK).rect(M, y, W - 2 * M, 14, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(255, 255, 255).text(kind === 'recibo' ? 'VALOR RECEBIDO' : 'VALOR TOTAL', M + 5, y + 9);
  doc.setFontSize(15).text(brl(o.amount), W - M - 5, y + 9.5, { align: 'right' });
  y += 22;

  doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...DARK);
  const note = kind === 'orcamento'
    ? 'Orçamento válido por 7 dias. A execução do serviço depende da aprovação do cliente.'
    : kind === 'recibo'
      ? `Recebemos de ${o.client_name} a importância de ${brl(o.amount)} referente aos serviços da OS ${num}, dando plena quitação.`
      : 'Garantia de 90 dias sobre o serviço executado. Equipamentos não retirados em até 90 dias após a conclusão poderão ser descartados.';
  const nl = doc.splitTextToSize(note, W - 2 * M); doc.text(nl, M, y); y += nl.length * 4.6 + 20;

  const sig = (x: number, label: string) => { doc.setDrawColor(...GRAY).line(x, y, x + 72, y); doc.setFontSize(8).setTextColor(...GRAY).text(label, x + 36, y + 4.5, { align: 'center' }); };
  sig(M, 'Eletrônica Silva'); sig(W - M - 72, o.client_name);

  doc.setFillColor(...RED).rect(0, 287, W, 10, 'F');
  doc.setFontSize(8).setTextColor(255, 255, 255).text('ELETRÔNICA SILVA — Serviços especializados em eletrônica · eletronicasilva.com.br', W / 2, 293, { align: 'center' });
  doc.save(`${kind}-${String(o.number).padStart(4, '0')}.pdf`);
}
