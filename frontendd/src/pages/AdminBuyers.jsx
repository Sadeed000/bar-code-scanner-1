import { useEffect, useRef, useState } from "react";
import { Plus, Search, ShieldCheck, Users, Tags, Pencil, X, KeyRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { api, initializeAuthToken } from "../api/client";
import Modal from "../component/Modal";
import "./AdminBuyers.css";

const emptyForm = { name: "", email: "", password: "", assignedBrands: [], isActive: true };

export default function AdminBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState("");
  const [hasMoreBrands, setHasMoreBrands] = useState(false);
  const brandListRef = useRef(null);
  const brandSession = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      initializeAuthToken();
      const accounts = await api.get("/buyers");
      setBuyers(accounts.data);

    } catch (err) { setError(err.response?.data?.message || "Could not load buyers. Please try again."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!open) return;
    const session = { query: brandSearch.trim(), page: 0, busy: false, more: true, controller: new AbortController() };
    brandSession.current = session;
    setBrands([]);
    setBrandsError("");
    setBrandsLoading(true);
    setHasMoreBrands(false);
    if (brandListRef.current) brandListRef.current.scrollTop = 0;
    const timer = setTimeout(() => fetchBrandPage(session), 350);
    return () => {
      clearTimeout(timer);
      session.controller.abort();
      if (brandSession.current === session) brandSession.current = null;
    };
  }, [open, brandSearch]);

  async function fetchBrandPage(session = brandSession.current) {
    if (!session || session.busy || !session.more || session.controller.signal.aborted) return;
    session.busy = true;
    setBrandsLoading(true);
    setBrandsError("");
    try {
      const { data } = await api.get("/brands", {
        params: { page: session.page + 1, limit: 20, q: session.query },
        signal: session.controller.signal,
      });
      if (brandSession.current !== session || session.controller.signal.aborted) return;
      session.page = data.page;
      session.more = data.page < data.totalPages;
      setBrands(previous => [...new Map([...previous, ...data.items].map(brand => [brand._id, brand])).values()]);
      setHasMoreBrands(session.more);
    } catch (err) {
      if (brandSession.current === session && !session.controller.signal.aborted) {
        setBrandsError(err.response?.data?.message || "Could not load brands. Please try again.");
      }
    } finally {
      session.busy = false;
      if (brandSession.current === session && !session.controller.signal.aborted) setBrandsLoading(false);
    }
  }

  function scrollBrands(event) {
    const list = event.currentTarget;
    if (!brandsLoading && !brandsError && list.scrollTop + list.clientHeight >= list.scrollHeight - 48) fetchBrandPage();
  }

  function edit(buyer = null) {
    setEditing(buyer);
    setForm(buyer ? { name: buyer.name, email: buyer.email, password: "", assignedBrands: buyer.assignedBrands.map(b => b._id), isActive: buyer.isActive !== false } : { ...emptyForm, assignedBrands: [] });
    setFormError(""); setBrandSearch(""); setShowPassword(false); setOpen(true);
  }
  function toggleBrand(id) {
    setForm(current => ({ ...current, assignedBrands: current.assignedBrands.includes(id) ? current.assignedBrands.filter(value => value !== id) : [...current.assignedBrands, id] }));
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setFormError("");
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await api[editing ? "put" : "post"](editing ? `/buyers/${editing._id}` : "/buyers", payload);
      toast.success(editing ? "Buyer access updated" : "Buyer account created");
      setOpen(false); setForm(emptyForm);
      await load();
    } catch (err) { setFormError(err.response?.data?.message || "Could not save buyer. Please try again."); }
    finally { setSaving(false); }
  }
  const visible = buyers.filter(b => `${b.name} ${b.email} ${b.assignedBrands.map(brand => brand.name).join(" ")}`.toLowerCase().includes(search.toLowerCase()));

  const assignedCount = new Set(buyers.flatMap(b => b.assignedBrands.map(brand => brand._id))).size;

  return <div className="buyers-page">
    <div className="buyers-header">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-700 mb-2">Access management</p><h1 className="text-3xl font-semibold tracking-tight text-slate-900">Buyers & access</h1><p className="mt-2 text-sm text-slate-500">Give every buyer a dedicated workspace for their brands.</p></div>
      <button className="btn btn-primary" disabled={loading || !!error} onClick={() => edit()}><Plus size={18} />Create buyer</button>
    </div>
    <div className="buyers-stats">
      {[[<Users size={22} />, "Buyer accounts", buyers.length], [<ShieldCheck size={22} />, "Active accounts", buyers.filter(b => b.isActive !== false).length], [<Tags size={22} />, "Brands assigned", assignedCount]].map(([icon, label, value]) => <div key={label} className="buyers-stat"><div className="buyers-stat-icon">{icon}</div><div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? "—" : value}</p></div></div>)}
    </div>
    <div className="buyers-access-note"><ShieldCheck className="shrink-0 mt-0.5" size={20} /><div><p className="text-sm font-semibold">Brand-level access</p><p className="mt-1 text-sm leading-relaxed text-slate-600">Buyers edit only their assigned brands. You manage access and credentials.</p></div></div>
    <div className="buyers-directory">
      <div className="buyers-directory-header"><h2 className="font-semibold text-slate-900">Buyer directory <span className="ml-2 text-sm font-normal text-slate-400">{visible.length} accounts</span></h2><div className="buyers-search relative"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Search buyers" placeholder="Search buyer or brand…" value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm" /></div></div>
      {loading ? <p role="status" className="p-12 text-center text-slate-500">Loading buyers...</p> : error ? <div className="p-10 text-center"><p role="alert" className="text-red-700 mb-4">{error}</p><button className="btn btn-secondary" onClick={load}>Try again</button></div> : !visible.length ? <div className="buyers-empty text-center"><Users size={32} className="mx-auto text-slate-300 mb-4" /><h3 className="font-semibold text-slate-800">{search ? "No matching buyers" : "A workspace for every buyer"}</h3><p className="mt-2 text-sm text-slate-500">{search ? "Try a different name, email, or brand." : "Create your first buyer and choose the brands they can manage."}</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr>{["Buyer / login ID", "Brand access", "Status", ""].map((label, i) => <th key={i} className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{visible.map(buyer => <tr key={buyer._id} className="hover:bg-slate-50/70"><td className="px-5 py-5"><div className="font-semibold text-slate-900">{buyer.name}</div><div className="mt-1 text-slate-500">{buyer.email}</div></td><td className="px-5 py-5"><div className="flex flex-wrap gap-1.5 max-w-md">{buyer.assignedBrands.length ? buyer.assignedBrands.map(brand => <span key={brand._id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">{brand.name}</span>) : <span className="text-slate-400">No brands assigned</span>}</div></td><td className="px-5 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${buyer.isActive !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{buyer.isActive !== false ? "Active" : "Inactive"}</span></td><td className="px-5 py-5"><button aria-label={`Manage ${buyer.name}`} className="btn btn-secondary btn-small whitespace-nowrap" onClick={() => edit(buyer)}><Pencil size={14} />Manage</button></td></tr>)}</tbody></table></div>}
    </div>
    {open && <Modal label={editing ? "Manage buyer access" : "Create buyer"} onClose={() => { if (!saving) setOpen(false); }}><form onSubmit={save} className="modal-content buyers-modal">
      <div className="flex justify-between items-start border-b border-slate-100 pb-5 mb-5"><div><p className="text-xs uppercase tracking-widest text-blue-700 mb-2">Buyer · Subadmin</p><h2 className="text-2xl font-semibold text-slate-900">{editing ? "Manage buyer access" : "Create a buyer"}</h2><p className="mt-1 text-sm text-slate-500">One account. Access to the brands you choose.</p></div><button type="button" disabled={saving} aria-label="Close dialog" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-100"><X size={20} /></button></div>
      <fieldset disabled={saving} className="space-y-5">
        <div className="buyers-form-grid"><label className="text-sm font-medium text-slate-700">Full name<input required minLength={2} maxLength={100} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field mt-2 w-full" placeholder="Buyer name" /></label><label className="text-sm font-medium text-slate-700">Email / login ID<input required type="email" autoComplete="off" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input-field mt-2 w-full" placeholder="buyer@company.com" /></label></div>
        <div><label className="text-sm font-medium text-slate-700" htmlFor="buyer-password">{editing ? "Reset password" : "Password"}</label><div className="flex gap-2 mt-2"><input id="buyer-password" required={!editing} minLength={4} maxLength={72} autoComplete="new-password" type={showPassword ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field w-full" placeholder={editing ? "Leave blank to keep current password" : "At least 4 characters"} /><button type="button" className="btn btn-secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button></div><p className="mt-2 text-xs text-slate-500 flex gap-1.5 items-center"><KeyRound size={13} />Buyers sign in through the existing login page.</p></div>
        <div className="rounded-xl border border-slate-200 overflow-hidden"><div className="bg-slate-50 p-4"><div className="flex justify-between gap-2"><h3 className="text-sm font-semibold">Brand permissions</h3><span className="text-xs text-blue-700">{form.assignedBrands.length} selected</span></div><input aria-label="Search available brands" className="input-field mt-3 w-full bg-white" placeholder="Find a brand…" value={brandSearch} onChange={e => setBrandSearch(e.target.value)} /></div><div ref={brandListRef} onScroll={scrollBrands} aria-busy={brandsLoading} className="max-h-52 overflow-y-auto divide-y divide-slate-100">{brands.map(brand => <label key={brand._id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-blue-50/50"><input type="checkbox" className="h-4 w-4 accent-blue-700" checked={form.assignedBrands.includes(brand._id)} onChange={() => toggleBrand(brand._id)} /><span><span className="block text-sm font-medium text-slate-800">{brand.name}</span><span className="block text-xs text-slate-400">/p/{brand.slug}</span></span></label>)}{brandsLoading && <p role="status" className="p-4 text-xs text-center text-slate-500">Loading brands...</p>}{brandsError && <div className="p-4 text-center"><p role="alert" className="text-xs text-red-700 mb-2">{brandsError}</p><button type="button" className="btn btn-secondary btn-small" onClick={() => fetchBrandPage()}>Try again</button></div>}{!brandsLoading && !brandsError && !brands.length && <p className="p-6 text-sm text-center text-slate-500">{brandSearch.trim() ? "No matching brands." : "Create a brand first, then assign access here."}</p>}{!brandsLoading && !brandsError && hasMoreBrands && <button type="button" className="w-full p-3 text-xs text-blue-700 hover:bg-blue-50" onClick={() => fetchBrandPage()}>Load more brands</button>}</div></div>
        {!form.assignedBrands.length && <p className="text-xs text-amber-700">This buyer will have no brand access until you assign a brand.</p>}
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" className="h-4 w-4 accent-blue-700" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /><span><span className="block text-sm font-medium">Account active</span><span className="block text-xs text-slate-500 mt-1">Inactive buyers cannot sign in or continue an existing session.</span></span></label>
      </fieldset>
      {formError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
      <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-100"><button type="button" disabled={saving} className="btn btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button disabled={saving} className="btn btn-primary">{saving ? "Saving..." : editing ? "Save changes" : "Create buyer"}</button></div>
    </form></Modal>}
  </div>;
}
