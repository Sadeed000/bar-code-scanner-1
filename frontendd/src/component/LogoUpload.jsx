import { assetUrl } from "../api/client";
import { useEffect, useState } from "react";
import { ImagePlus, Upload } from "lucide-react";

export default function LogoUpload({ form, setForm }) {
  const [preview, setPreview] = useState("");
  const size = form?.theme?.logoSize ?? 112;
  useEffect(() => {
    if (!form?.logoFile) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(form.logoFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form?.logoFile]);
  const src = form?.logoFile ? preview : form?.logoUrl ? assetUrl(form.logoUrl) : "";
  function resize(value) {
    setForm(current => ({ ...current, theme: { ...current.theme, logoSize: value } }));
  }
  return (
    <section aria-labelledby="logo-upload-heading" className="sm:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h3 id="logo-upload-heading" className="text-sm font-semibold text-slate-900">Logo Upload</h3>
          <p className="mt-1 text-xs text-slate-500">Give your brand a recognizable first impression.</p>
        </div>
        {src && <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-[11px] font-medium text-indigo-700">{form?.logoFile ? "Ready to save" : "Current logo"}</span>}
      </div>
      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:items-center">
        <div className="min-w-0">
          <div className="flex h-[292px] items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-4 shadow-inner">
            {src ? <img src={src} alt="Logo preview" className="max-w-full object-contain transition-[width,height] duration-150" style={{ width: size, height: size }} /> : <div className="flex flex-col items-center gap-3 text-slate-500"><ImagePlus size={36} strokeWidth={1.25} /><span className="text-xs">Your logo preview</span></div>}
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-500">Live preview · {size} × {size} px</p>
        </div>
        <div className="min-w-0 space-y-6">
          <div className="space-y-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-500/30 focus-within:ring-2 focus-within:ring-indigo-300">
              <Upload size={16} />{src ? "Replace logo" : "Upload logo"}
              <input aria-label="Upload logo" type="file" accept="image/*" className="sr-only" onChange={event => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) setForm(current => ({ ...current, logoFile: file }));
              }} />
            </label>
            <p className="text-xs leading-relaxed text-slate-500">Use a clear, high-resolution image. A transparent background works best.</p>
            {form?.logoFile && <p className="break-all text-xs text-indigo-700">{form.logoFile.name}</p>}
          </div>
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="brand-logo-size" className="text-xs font-medium text-slate-700">Logo Size</label>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs tabular-nums text-slate-700">{size} px</span>
            </div>
            <input id="brand-logo-size" type="range" min="40" max="260" step="4" value={size} onChange={event => resize(Number(event.target.value))} className="w-full cursor-pointer accent-indigo-400" />
            <div className="flex justify-between text-[11px] text-slate-500"><span>Small · 40 px</span><span>Large · 260 px</span></div>
            <button type="button" onClick={() => resize(112)} className="rounded text-xs text-slate-500 transition hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-300">Reset size</button>
          </div>
          <p className="text-[11px] text-slate-500">Save the brand to apply your changes.</p>
        </div>
      </div>
    </section>
  );
}
