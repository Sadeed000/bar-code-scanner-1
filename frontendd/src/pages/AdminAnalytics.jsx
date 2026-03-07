import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminAnalytics() {
  const nav = useNavigate();
  const [data, setData] = useState([]);
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
    localStorage.removeItem("token");
    setAuthToken(null);
    nav("/admin/login");
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
    <div className="flex min-h-screen bg-gray-900">
      {/* SIDEBAR */}
      {/* <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 fixed h-screen overflow-y-auto">
        <div className="text-2xl font-bold mb-8 text-white">QR Admin</div>

        <nav className="space-y-2">
          <button
            onClick={() => nav("/admin")}
            className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition"
          >
            📊 Dashboasasard
          </button>

          <button
            onClick={() => nav("/admin/brands")}
            className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition"
          >
            🏷️ Brands
          </button>

          <button
            className="w-full text-left px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            📈 Analytics
          </button>

          <button
            onClick={() => nav("/admin/sellers")}
            className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 transition"
          >
            👥 Seller Register
          </button>
        </nav>

        <div className="mt-10 pt-6 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full border border-gray-600 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition"
          >
            🚪 Logout
          </button>
        </div>
      </div> */}

      {/* MAIN CONTENT */}
    <div className="p-4 md:p-8 w-full">
  <div className="max-w-6xl mx-auto">

    {/* HEADER */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">
        Brand QR Analytics
      </h1>
      <p className="text-gray-400">Scan counts per brand</p>
    </div>

    {/* SUMMARY CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Total Brands</p>
        <h2 className="text-3xl font-bold text-white mt-2">
          {data.length}
        </h2>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <p className="text-gray-400 text-sm">Total QR Scans</p>
        <h2 className="text-3xl font-bold text-white mt-2">
          {data.reduce((a, b) => a + (b.scanCount || 0), 0)}
        </h2>
      </div>

    </div>

    {/* TABLE */}
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">

      <table className="w-full text-left">

        <thead className="bg-gray-700 text-gray-200 text-sm uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Brand</th>
            <th className="px-6 py-4">Slug</th>
            <th className="px-6 py-4 text-right">QR Scans</th>
          </tr>
        </thead>

        <tbody>

          {data.map((b) => (
            <tr
              key={b._id}
              className="border-b border-gray-700 hover:bg-gray-700/40 transition"
            >
              {/* BRAND */}
              <td className="px-6 py-4 flex items-center gap-3">

                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                  {b.name?.charAt(0).toUpperCase()}
                </div>

                <span className="text-white">{b.name}</span>

              </td>

              {/* SLUG */}
              <td className="px-6 py-4 text-gray-300">
                {b.slug}
              </td>

              {/* SCANS */}
              <td className="px-6 py-4 text-right">
                <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-sm font-medium">
                  {b.scanCount || 0}
                </span>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>
</div>
    </div>
  );
}