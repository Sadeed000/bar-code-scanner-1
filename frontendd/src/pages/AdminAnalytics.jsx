import TablePagination, { TableSearch } from "../component/TableControls";
import { Tags, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";

export default function AdminAnalytics() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setAuthToken(localStorage.getItem("token"));
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const { data: result } = await api.get("/qr-code/analytics/summary", {
          params: { page, limit: 10, q: search.trim() }, signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setData(result.items);
        setTotal(result.total);
        setTotals(result.totals);
        setPage(result.page);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.response?.data?.message || "Could not load analytics. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, search ? 350 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [page, search, refresh]);

  return (
    <div className="flex min-h-screen bg-slate-50">
    
      {/* MAIN CONTENT */}
<div className="p-4 md:p-8 w-full">
  <div className="max-w-6xl mx-auto">

    {/* HEADER */}
    <div className="mb-6 md:mb-8">
      <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-1 md:mb-2">
        Brand QR Analytics
      </h1>
      <p className="text-slate-500 text-sm md:text-base">
        Scan counts per brand
      </p>
    </div>

    {/* SUMMARY CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">

      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6">
        <Tags size={22} className="mb-4 text-blue-700" /><p className="text-slate-500 text-xs md:text-sm">Total Brands</p>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">
          {totals?.totalBrands ?? "?"}
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6">
        <ScanLine size={22} className="mb-4 text-emerald-700" /><p className="text-slate-500 text-xs md:text-sm">Total QR Scans</p>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">
          {totals?.totalScans ?? "?"}
        </h2>
      </div>

    </div>

    <TableSearch value={search} onChange={value => { setLoading(true); setSearch(value); setPage(1); }} placeholder="Search brands, slugs, or creators…" />
    {/* TABLE */}
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

      {/* Horizontal scroll for mobile */}
      <div className="overflow-x-auto">

        <table className="min-w-[650px] w-full text-left">

          <thead className="bg-slate-100 text-slate-700 text-xs md:text-sm uppercase tracking-wider">
            <tr>
              <th className="px-4 md:px-6 py-3 md:py-4">Brand</th>
              <th className="px-4 md:px-6 py-3 md:py-4">Slug</th>
              <th className="px-4 md:px-6 py-3 md:py-4">Created By</th>
              <th className="px-4 md:px-6 py-3 md:py-4 text-right">QR Scans</th>
            </tr>
          </thead>

          <tbody>
            {loading && <tr><td colSpan={4} className="py-12 text-center text-slate-500"><span role="status">Analytics are loading...</span></td></tr>}
            {!loading && error && <tr><td colSpan={4} className="py-8 text-center"><p role="alert" className="text-red-700 mb-3">{error}</p><button className="btn btn-secondary btn-small" onClick={() => { setLoading(true); setRefresh(value => value + 1); }}>Try again</button></td></tr>}
            {!loading && !error && data.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-500">No brands match your search.</td></tr>}

            {!loading && !error && data.map((b) => (
              <tr
                key={b._id}
                className="border-b border-slate-200 hover:bg-slate-100 transition"
              >

                {/* BRAND */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center gap-3">

                    <div className="h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                      {b.name?.charAt(0).toUpperCase()}
                    </div>

                    <span className="text-slate-900 text-sm md:text-base">
                      {b.name}
                    </span>

                  </div>
                </td>

                {/* SLUG */}
                <td className="px-4 md:px-6 py-3 md:py-4 text-slate-700 text-xs md:text-sm">
                  {b.slug}
                </td>

                {/* CREATED BY */}
                <td className="px-4 md:px-6 py-3 md:py-4">
                  <span className="inline-flex items-center px-2 md:px-3 py-1 text-xs font-medium rounded-full bg-indigo-500/20 text-indigo-700">
                    {b.createdBy?.name || "N/A"}
                  </span>
                </td>

                {/* SCANS */}
                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                  <span className="px-2 md:px-3 py-1 rounded-full bg-blue-600/20 text-blue-700 text-xs md:text-sm font-medium">
                    {b.scanCount || 0}
                  </span>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
      {!loading && !error && <TablePagination page={page} total={total} onChange={value => { setLoading(true); setPage(value); }} />}
    </div>

  </div>
</div>
    </div>
  );
}