// Home screen: counts and a setup checklist.
import { sb, state, can, roleLabel } from '../db.js';
import { h, clear, num } from '../ui.js';

async function count(table) {
  const { count: c } = await sb.from(table).select('id', { count: 'exact', head: true });
  return c || 0;
}

export async function dashboardPage(container) {
  const p = state.profile;
  const isAgent = p.role === 'agent';
  const items = [
    { key: 'customers', label: isAgent ? 'My customers' : 'Customers', module: 'customers', table: 'customers', href: '#/customers' },
    { key: 'agents', label: 'Agents', module: 'agents', table: 'agents', href: '#/agents' },
    { key: 'areas', label: 'Areas', module: 'areas', table: 'areas', href: '#/areas', hideForAgent: true },
    { key: 'products', label: 'Products', module: 'products', table: 'products', href: '#/products' },
    { key: 'suppliers', label: 'Suppliers', module: 'suppliers', table: 'suppliers', href: '#/suppliers' },
  ].filter((i) => can(i.module, 'view') && !(isAgent && i.hideForAgent));

  const counts = {};
  await Promise.all(items.map(async (i) => { counts[i.key] = await count(i.table); }));

  const cards = items.map((i) => h('a', { class: 'card stat', href: i.href, style: { textDecoration: 'none', color: 'inherit' } },
    h('div', { class: 'num' }, num(counts[i.key])), h('div', { class: 'lbl' }, i.label)));

  const steps = [
    { done: counts.areas > 0, text: 'Add your sales areas', href: '#/areas', module: 'areas' },
    { done: counts.products > 0, text: 'Add your products, prices and agent margins', href: '#/products', module: 'products' },
    { done: counts.suppliers > 0, text: 'Add your suppliers (tea and packaging)', href: '#/suppliers', module: 'suppliers' },
    { done: counts.agents > 0, text: 'Add your agents and link their logins', href: '#/agents', module: 'agents' },
    { done: counts.customers > 0, text: 'Add your customers (shops and supermarkets)', href: '#/customers', module: 'customers' },
  ].filter((s) => can(s.module, 'edit') && !isAgent);

  clear(container).append(
    h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, 'Welcome, ' + (p.full_name || p.email)),
      h('div', { class: 'muted small' }, roleLabel(p.role)))),
    h('div', { class: 'cards' }, cards),
    steps.length ? h('div', { class: 'card pad', style: { marginBottom: '14px' } },
      h('h2', { style: { marginBottom: '8px' } }, 'Getting started'),
      steps.map((s) => h('div', { style: { padding: '5px 0' } }, (s.done ? '✅ ' : '⬜ '), h('a', { href: s.href }, s.text)))) : null,
    h('div', { class: 'card pad' }, h('h2', { style: { marginBottom: '6px' } }, 'Coming in the next steps'),
      h('div', { class: 'muted' }, 'Stock and purchasing, orders with draft saving on the phone, invoices and delivery, payments and commissions, then attendance, payroll, expenses and reports.')));
}
