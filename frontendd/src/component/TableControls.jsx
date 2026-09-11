import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export function TableSearch({ value, onChange, placeholder = "Search records…", children }) {
  return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative min-w-0 flex-1"><Search size={17} className="absolute left-3.5 top-3 text-slate-400" /><input type="search" aria-label={placeholder} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="input-field pl-10" /></div>{children}</div>;
}

export default function TablePagination({ page, total, pageSize = 10, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pages);
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-xs text-slate-500"><span>{total ? (current - 1) * pageSize + 1 : 0}–{Math.min(current * pageSize, total)} of {total} records</span><nav aria-label="Table pagination" className="flex items-center gap-3"><button type="button" aria-label="Previous page" className="btn btn-secondary btn-small" disabled={current <= 1} onClick={() => onChange(current - 1)}><ChevronLeft size={15} /></button><span>Page {current} of {pages}</span><button type="button" aria-label="Next page" className="btn btn-secondary btn-small" disabled={current >= pages} onClick={() => onChange(current + 1)}><ChevronRight size={15} /></button></nav></div>;
}
