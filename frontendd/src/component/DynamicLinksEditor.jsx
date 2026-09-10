import { ImagePlus, Plus, Trash2, Upload, Share2 } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client";
import toast from "react-hot-toast";

export function iconUrl(value) {
  return value?.startsWith("/uploads/")
    ? api.defaults.baseURL.replace(/\/api\/?$/, "") + value
    : value;
}

function LinkRow({ item, update, remove, busy, setBusy }) {
  const [uploading, setUploading] = useState(false);
  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error("Choose a PNG, JPG, WebP or GIF image up to 5 MB");
      return;
    }
    setUploading(true);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("icon", file);
      const response = await api.post("/brands/icon", body);
      update("icon", response.data.url);
      toast.success("Icon uploaded. Save the brand to apply it.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Icon upload failed");
    } finally {
      setUploading(false);
      setBusy(false);
    }
  }
  const input = "w-full min-w-0 rounded-xl border border-white/10 bg-slate-950/30 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-400/10";
  return <article className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/70 shadow-sm transition hover:border-white/20">
    <div className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-3">
      <span className="truncate text-sm font-medium text-slate-200">{item.label || "New link"}</span>
      <div className="flex shrink-0 items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
          {item.enabled !== false ? "Visible" : "Hidden"}
          <input type="checkbox" className="peer sr-only" checked={item.enabled !== false} onChange={e => update("enabled", e.target.checked)} aria-label="Show link on profile" />
          <span className="relative h-5 w-9 rounded-full bg-slate-600 transition peer-checked:bg-indigo-500 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
        </label>
        <span className="h-4 w-px bg-white/10" />
        <button type="button" disabled={busy} aria-label="Remove link" title="Remove link" className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-400/10 hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-indigo-300 disabled:opacity-40" onClick={remove}><Trash2 size={16} /></button>
      </div>
    </div>
    <div className="grid gap-5 p-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:p-5">
      <div className="flex items-center gap-4 sm:flex-col sm:gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-slate-700/60 to-slate-950/50 shadow-inner">
          {item.icon ? <img src={iconUrl(item.icon)} alt="Icon preview" className="h-20 w-20 object-contain" /> : <ImagePlus size={28} strokeWidth={1.25} className="text-slate-500" />}
        </div>
        <div className="space-y-2 sm:text-center">
          <label className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-indigo-400/20 bg-indigo-400/10 px-3 py-2 text-xs font-medium text-indigo-200 transition hover:bg-indigo-400/20 focus-within:ring-2 focus-within:ring-indigo-300">
            <Upload size={13} />{uploading ? "Uploading..." : item.icon ? "Replace" : "Upload icon"}
            <input aria-label="Upload icon" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={upload} className="sr-only" />
          </label>
          <p className="text-[10px] leading-relaxed text-slate-500">PNG, JPG, WebP, GIF<br />Up to 5 MB</p>
        </div>
      </div>
      <div className="min-w-0 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2 text-xs font-medium text-slate-400"><span>Display name</span><input className={input} placeholder="e.g. Instagram or Our catalogue" value={item.label || ""} onChange={e => update("label", e.target.value)} /></label>
          <label className="block space-y-2 text-xs font-medium text-slate-400"><span>Destination link</span><input className={input} placeholder="https://example.com" value={item.url || ""} onChange={e => update("url", e.target.value)} /></label>
        </div>
          {/* <details className="rounded-xl border border-white/5 bg-slate-950/15">
            <summary className="cursor-pointer px-3.5 py-3 text-xs text-slate-400 transition hover:text-slate-200">Use an image URL <span className="ml-1 text-slate-500">(optional)</span></summary>
            <label className="block px-3.5 pb-3.5"><span className="sr-only">Icon image URL</span><input className={input} placeholder="https://example.com/icon.png" value={item.icon || ""} onChange={e => update("icon", e.target.value)} /></label>
          </details> */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] leading-relaxed text-slate-500">{item.icon ? "Custom image added" : "Personalize this link with your own icon."}</p>
          {item.icon && <button type="button" disabled={uploading} onClick={() => update("icon", "")} className="rounded px-1 py-1 text-[11px] text-slate-400 transition hover:text-rose-300 focus-visible:outline-2 focus-visible:outline-indigo-300">Remove image</button>}
        </div>
      </div>
    </div>
  </article>;
}

export default function DynamicLinksEditor({ form, setForm }) {
  const [busy, setBusy] = useState(false);
  // Keep legacy category links editable alongside all other profile links.
  const items = ["links", "categoryLinks"].flatMap(field =>
    (form?.[field] || []).map((item, index) => ({ item, field, index }))
  );
  function addItem() {
    setForm(current => ({ ...current, links: [...(current.links || []), { label: "", url: "", icon: "", enabled: true }] }));
  }
  return <section className="space-y-4 border-t border-white/10 pt-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10 text-indigo-300"><Share2 size={19} strokeWidth={1.5} /></div>
        <div>
          <div className="flex items-center gap-2"><h3 className="text-base font-semibold tracking-tight text-white">Connect With Us</h3><span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-400">{items.length}</span></div>
          <p className="mt-1 text-xs text-slate-400">Manage your profile links with custom icons.</p>
        </div>
      </div>
      <button type="button" onClick={addItem} className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-2.5 text-xs font-semibold text-indigo-200 transition hover:border-indigo-400/60 hover:bg-indigo-500/25 focus-visible:outline-2 focus-visible:outline-indigo-300"><Plus size={15} />Add link</button>
    </div>
    <div className="space-y-3">
      {items.map(({ item, field, index }) => <LinkRow key={`${field}-${index}`} item={item} busy={busy} setBusy={setBusy}
        update={(key, value) => setForm(current => ({ ...current, [field]: (current[field] || []).map((row, i) => i === index ? { ...row, [key]: value } : row) }))}
        remove={() => setForm(current => ({ ...current, [field]: current[field].filter((_, i) => i !== index) }))} />)}
      {items.length === 0 && <button type="button" onClick={addItem} className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-600/70 bg-slate-900/20 px-6 py-9 text-center transition hover:border-indigo-400/50 hover:bg-indigo-400/5 focus-visible:outline-2 focus-visible:outline-indigo-300"><Plus size={22} className="mb-1 text-indigo-300" /><span className="text-sm font-medium text-slate-200">Add your first link</span><span className="text-xs text-slate-500">Choose a name, add a link and make it yours.</span></button>}
    </div>
    {items.length > 0 && <p className="text-[11px] text-slate-500">Existing platform icons are used when no custom image is added.</p>}
  </section>;
}