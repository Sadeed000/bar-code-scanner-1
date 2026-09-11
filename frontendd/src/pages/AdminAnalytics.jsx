import TablePagination, { TableSearch } from "../component/TableControls";
import { Tags, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminAnalytics() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const filtered = data.filter(b => `${b.name || ""} ${b.slug || ""} ${b.createdBy?.name || ""}`.toLowerCase().includes(search.toLowerCase()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const [brandsRes, scanRes] = await Promise.all([
        api.get("/brands"),
        api.get("/qr-code/analytics/brands"),
      ]);

      const scansMap = {};
      (scanRes.data || []).forEach((item) => {
        scansMap[item._id] = item.scans;
      });

      const merged = brandsRes.data.map((b) => ({
        ...b,
        scanCount: scansMap[b.slug] || 0,
      }));

      setData(merged);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthToken(null);
    nav("/admin/login", { replace: true });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

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
          {data.length}
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6">
        <ScanLine size={22} className="mb-4 text-emerald-700" /><p className="text-slate-500 text-xs md:text-sm">Total QR Scans</p>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1 md:mt-2">
          {data.reduce((a, b) => a + (b.scanCount || 0), 0)}
        </h2>
      </div>

    </div>

    <TableSearch value={search} onChange={value => { setSearch(value); setPage(1); }} placeholder="Search brands, slugs, or creators…" />
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
            {filtered.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-slate-500">No brands match your search.</td></tr>}

            {filtered.slice((page - 1) * 10, page * 10).map((b) => (
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
      <TablePagination page={page} total={filtered.length} onChange={setPage} />
    </div>

  </div>
</div>
    </div>
  );
}