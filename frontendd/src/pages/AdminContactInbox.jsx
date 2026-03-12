import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminContactInbox() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeframe, setTimeframe] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchInbox({ page: 1 });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchInbox({ page: 1 });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, timeframe, limit]);

  useEffect(() => {
    fetchInbox({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function formatDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  function getDateRangeForTimeframe(value) {
    const tf = value || "all";
    if (tf === "all") return { start: undefined, end: undefined };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tf === "today") {
      return { start: today.toISOString(), end: tomorrow.toISOString() };
    }

    if (tf === "yesterday") {
      const start = new Date(today);
      start.setDate(start.getDate() - 1);
      return {
        start: start.toISOString(),
        end: today.toISOString(),
      };
    }

    if (tf === "week") {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return {
        start: start.toISOString(),
        end: tomorrow.toISOString(),
      };
    }

    if (tf === "month") {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return {
        start: start.toISOString(),
        end: tomorrow.toISOString(),
      };
    }

    return { start: undefined, end: undefined };
  }

  async function fetchInbox({ page: nextPage } = {}) {
    try {
      setLoading(true);
      const { start, end } = getDateRangeForTimeframe(timeframe);

      const res = await api.get("/brands", {
        params: {
          page: nextPage ?? page,
          limit,
          q: searchTerm || undefined,
          startDate: start,
          endDate: end,
        },
      });

      const payload = res.data;
      const items = Array.isArray(payload) ? payload : payload.items || [];

      setBrands(items);
      if (!Array.isArray(payload)) {
        setPage(payload.page || (nextPage ?? page) || 1);
        setLimit(payload.limit || limit);
        setTotal(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
      } else {
        setTotal(items.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load contact inbox");
    } finally {
      setLoading(false);
    }
  }

  const filtered = brands;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading contact inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Contact Inbox</h1>
            <p className="text-gray-400 text-sm md:text-base">
              Manage owner contacts from your brand profiles
            </p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="mb-4 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Left: search + timeframe */}
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search by owner, phone or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />

              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full sm:w-44 px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>

            {/* Right: info text + page size + clear */}
            <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end md:pl-4">
              <div className="text-xs sm:text-sm text-gray-400">
                Showing <span className="text-gray-200 font-medium">{filtered.length}</span> of{" "}
                <span className="text-gray-200 font-medium">{total}</span> contacts
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-blue-500 transition"
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setTimeframe("all");
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 text-xs sm:text-sm hover:border-blue-500 transition cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
       <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
  {filtered.length === 0 ? (
    <div className="p-10 text-center text-gray-400">
      No contacts found for the selected filters.
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full text-center">
        
        {/* TABLE HEADER */}
        <thead className="bg-gray-900/70 text-xs text-gray-400">
          <tr>
            <th className="px-5 py-3 font-semibold">Name</th>
            <th className="px-5 py-3 font-semibold">Phone</th>
            <th className="px-5 py-3 font-semibold">Brand</th>
            <th className="px-5 py-3 font-semibold">Date</th>
            <th className="px-5 py-3 font-semibold">Amount</th>
          </tr>
        </thead>

        {/* TABLE BODY */}
        <tbody className="divide-y divide-gray-700">
          {filtered.map((b) => (
            <tr key={b._id} className="hover:bg-gray-900/50 transition">

              {/* NAME */}
              <td className="px-5 py-4">
                <div className="text-sm text-white truncate">
                  {b.ownerName || "—"}
                </div>
              </td>

              {/* PHONE */}
              <td className="px-5 py-4">
                <div className="text-xs text-gray-300">
                  {b.contactNumber || b.ownerPhone || "—"}
                </div>
              </td>

              {/* BRAND */}
             <td className="px-5 py-4">
  <div className="flex flex-col items-center gap-1">

    {/* Brand Name */}
    <span className="text-sm font-semibold text-white">
      {b.name}
    </span>

    {/* Slug Chip */}
    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-900 border border-gray-700 text-gray-400">
      /{b.slug}
    </span>

  </div>
</td>

              {/* DATE */}
              <td className="px-5 py-4">
                <div className="text-xs text-gray-300">
                  {formatDateTime(b.createdAt)}
                </div>
              </td>

              {/* AMOUNT */}
              <td className="px-5 py-4">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                  ₹{b.amount || 0}
                </span>
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )}

  {/* PAGINATION */}
  {totalPages > 1 && (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 bg-gray-900/50 border-t border-gray-700">
      
      <div className="text-sm text-gray-400">
        Page{" "}
        <span className="text-gray-200 font-medium">{page}</span> of{" "}
        <span className="text-gray-200 font-medium">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">

        <button
          onClick={() => setPage(1)}
          disabled={page <= 1}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 disabled:opacity-40 hover:border-blue-500 transition cursor-pointer"
        >
          First
        </button>

        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 disabled:opacity-40 hover:border-blue-500 transition cursor-pointer"
        >
          Prev
        </button>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 disabled:opacity-40 hover:border-blue-500 transition cursor-pointer"
        >
          Next
        </button>

        <button
          onClick={() => setPage(totalPages)}
          disabled={page >= totalPages}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 disabled:opacity-40 hover:border-blue-500 transition cursor-pointer"
        >
          Last
        </button>

      </div>
    </div>
  )}
</div>
      </div>
    </div>
  );
}

