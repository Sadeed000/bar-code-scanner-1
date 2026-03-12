import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";
import BrandForm from "../component/BrandForm";
import ConfirmDialog from "../component/ConfirmDialog";
import useDebounce from "../utils/useDebounce";
import { QrCode, Download, X } from "lucide-react";

export default function AdminBrands() {
  const nav = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 900);

  const [confirmOpen, setConfirmOpen] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const [qrModal, setQrModal] = useState(false);
const [selectedBrand, setSelectedBrand] = useState(null);
const user = JSON.parse(localStorage.getItem("user") || "{}");
  const brandLogo = import.meta.env.VITE_APP_BRAND_LOGO_URL ;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [timeframe, setTimeframe] = useState("all");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    watermarkUrl: "",
    watermarkFile: null,
    paymentType: "cash",
    amount: 0,
    headline: "",
    headlineAccent: "",
    subtext: "",
    logoUrl: "",
    ownerName: "",
    ownerPhone: "",
    googleReviewUrl: "",
    patPoojaUrl: "",
    theme: { accentColor: "#B08D57" },
    links: [
      { key: "instagram", label: "Instagram", url: "", enabled: true },
      { key: "facebook", label: "Facebook", url: "", enabled: true },
      { key: "whatsapp", label: "WhatsApp", url: "", enabled: true },
      { key: "booking", label: "Booking.com", url: "", enabled: true },
      { key: "zomato", label: "Zomato", url: "", enabled: true },
      { key: "google", label: "Google", url: "", enabled: true },
      { key: "tripadvisor", label: "Tripadvisor", url: "", enabled: true },
    ],
    reviews: [],
    gallery: [],
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchBrands({ page: 1 });
  }, []);

  // fetch data whenever filters or pagination settings change;
  // search term is debounced so API calls aren't invoked on every keystroke
  useEffect(() => {
    fetchBrands({ page: 1, q: debouncedSearchTerm });
  }, [debouncedSearchTerm, timeframe, limit]);

  useEffect(() => {
    fetchBrands({ page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function formatDateTime(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }

  function buildLogoSrc(brand) {
    if (!brand?.logoUrl) return "";
    return `${brandLogo}${brand.logoUrl}`;
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

  async function fetchBrands({ page: nextPage, q } = {}) {
    try {
      setLoading(true);
      const { start, end } = getDateRangeForTimeframe(timeframe);
      // get brands and also scan analytics to merge counts
      const query = q !== undefined ? q : searchTerm;
      const [res, analyticsRes] = await Promise.all([
        api.get("/brands", {
          params: {
            page: nextPage ?? page,
            limit,
            q: query || undefined,
            startDate: start,
            endDate: end,
          },
        }),
        api.get("/qr-code/analytics/brands"),
      ]);

      const countsMap = {};
      (analyticsRes.data || []).forEach((item) => {
        countsMap[item._id] = item.scans;
      });

      const payload = res.data;
      const items = Array.isArray(payload) ? payload : payload.items || [];

      const merged = items.map((b) => ({
        ...b,
        scanCount: countsMap[b.slug] || 0,
      }));

      setBrands(merged);
      if (!Array.isArray(payload)) {
        setPage(payload.page || (nextPage ?? page) || 1);
        setLimit(payload.limit || limit);
        setTotal(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
      } else {
        // fallback safety
        setTotal(items.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }

  async function createBrand() {
    try {
      if (!form.name || form.name.length < 2) {
        toast.error("Brand name must be at least 2 characters");
        return;
      }

      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "logoFile") {
          if (form.logoFile) formData.append("logo", form.logoFile);
        } else if (key === "watermarkFile") {
          if (form.watermarkFile) formData.append("watermark", form.watermarkFile);
        } else if (key === "galleryFiles") {
          if (form.galleryFiles && form.galleryFiles.length > 0) {
            form.galleryFiles.forEach(file => formData.append("gallery", file));
          }
        } else if (key !== "logoUrl" && key !== "watermarkUrl" && key !== "gallery" && key !== "logoFile" && key !== "watermarkFile") {
          formData.append(key, typeof form[key] === "string" ? form[key] : JSON.stringify(form[key]));
        }
      });

      await api.post("/brands", formData);
      toast.success("Brand created successfully");
      setShowModal(false);
      fetchBrands({ page: 1 });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create brand");
    }
  }

async function handleDelete() {
  try {
    await api.delete(`/brands/${deleteId}`);
    toast.success("Brand deleted");
    fetchBrands({ page: 1 });
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete brand");
  } finally {
    setConfirmOpen(false);
  }
}

  function openCreateModal() {
    setForm({
      name: "",
      slug: "",
      tagline: "",
      watermarkUrl: "",
      watermarkFile: null,
      paymentType: "cash",
      amount: 0,
      headline: "",
      headlineAccent: "",
      subtext: "",
      logoUrl: "",
      logoFile: null,
      ownerName: "",
      ownerPhone: "",
      googleReviewUrl: "",
      patPoojaUrl: "",
      theme: { accentColor: "#B08D57" },
      links: [
        { key: "instagram", label: "Instagram", url: "", enabled: true },
        { key: "facebook", label: "Facebook", url: "", enabled: true },
        { key: "whatsapp", label: "WhatsApp", url: "", enabled: true },
        { key: "booking", label: "Booking.com", url: "", enabled: true },
        { key: "zomato", label: "Zomato", url: "", enabled: true },
        { key: "google", label: "Google", url: "", enabled: true },
        { key: "tripadvisor", label: "Tripadvisor", url: "", enabled: true },
      ],
      reviews: [],
    });
    setShowModal(true);
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    nav("/admin/login");
  }

  function deleteBrand(id) {
  setDeleteId(id);
  setConfirmOpen(true);
}

  function openQRModal(brand) {
    setSelectedBrand(brand);
    setQrModal(true);
  }

  function downloadQR() {
    if (!selectedBrand?.qrCodeUrl) return;
    const link = document.createElement("a");
    link.href = selectedBrand.qrCodeUrl;
    link.download = `${selectedBrand.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Brands</h1>
                <p className="text-gray-400 text-sm md:text-base">Manage all your brand profiles</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                + Create Brand
              </button>
            </div>

            {/* FILTERS */}
            <div className="mb-4 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Left: search + timeframe */}
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    placeholder="Search by name / slug / category..."
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
                    Showing <span className="text-gray-200 font-medium">{brands.length}</span> of{" "}
                    <span className="text-gray-200 font-medium">{total}</span> brands
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
                      <option value={50}>50 / page</option>
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
            {brands.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-400 text-lg">
                  {searchTerm || timeframe !== "all" ? "No brands match your filters" : "No brands created yet"}
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-900/60">
                      <tr className="text-left text-xs text-gray-400">
                        <th className="px-2 md:px-4 py-3 font-semibold">Brand</th>
                        <th className="px-2 md:px-4 py-3 font-semibold">Category</th>
                        <th className="px-2 md:px-4 py-3 font-semibold">Payment</th>
                        <th className="px-2 md:px-4 py-3 font-semibold">Links</th>
                        <th className="px-2 md:px-4 py-3 font-semibold">QR Scans</th>
                        <th className="hidden md:table-cell px-2 md:px-4 py-3 font-semibold">Created</th>
                        <th className="px-2 md:px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                      {brands.map((brand) => (
                        <tr key={brand._id} className="hover:bg-gray-900/40 transition">
                          <td className="px-2 md:px-4 py-4">
                            <div className="flex items-center gap-2 md:gap-3 min-w-[140px] md:min-w-[200px]">
                              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden bg-gray-700 border border-gray-600 flex-shrink-0">
                                {brand.logoUrl ? (
                                  <img
                                    src={buildLogoSrc(brand)}
                                    alt={brand.name}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xl">🏷️</div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <div className="text-white font-semibold truncate">{brand.name}</div>
                                  </div>
                                  {(brand.ownerName || brand.createdBy?.name) && (
                                    <div className="text-[11px] text-indigo-300 truncate">
                                      {brand.ownerName || brand.createdBy?.name}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 truncate">/p/{brand.slug}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {brand.contactNumber ? `📞 ${brand.contactNumber}` : "—"}{" "}
                                  {brand.tagline ? `• ${brand.tagline}` : ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-2 md:px-4 py-4">
                            {brand.category ? (
                              <span className="bg-blue-600/20 text-blue-300 text-xs px-2 md:px-3 py-1 rounded-full">
                                {brand.category}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">—</span>
                            )}
                          </td>

                          <td className="px-2 md:px-4 py-4">
                            <div className="text-xs md:text-sm text-gray-200">
                              {brand.paymentType ? brand.paymentType : "cash"}
                            </div>
                            <div className="text-xs text-green-400 font-medium">₹{brand.amount || 0}</div>
                          </td>

                          <td className="px-2 md:px-4 py-4">
                            <div className="text-xs md:text-sm text-gray-200">{brand.links?.length || 0}</div>
                            <div className="text-xs text-gray-500 hidden md:block">
                              {brand.googleReviewUrl ? "Google reviews set" : "Google reviews not set"}
                            </div>
                          </td>

                          <td className="px-2 md:px-4 py-4">
                            <div className="text-sm text-purple-300 font-medium">{brand.scanCount || 0}</div>
                          </td>

                          <td className="hidden md:table-cell px-2 md:px-4 py-4">
                            <div className="text-xs md:text-sm text-gray-200">{formatDateTime(brand.createdAt)}</div>
                          </td>

                          <td className="px-2 md:px-4 py-4">
                            <div className="flex justify-end gap-1 md:gap-2 flex-wrap md:flex-nowrap">
                              {brand.qrCodeUrl && (
                                <button
                                  onClick={() => openQRModal(brand)}
                                  className="bg-purple-600 hover:bg-purple-700 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer flex items-center gap-1"
                                  title="View QR Code"
                                >
                                  <QrCode size={14} className="md:w-4 md:h-4" />
                                  <span className="hidden md:inline">QR</span>
                                </button>
                              )}
                              <button
                                onClick={() => nav(`/admin/brands/${brand._id}`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteBrand(brand._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gray-900/40 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Page <span className="text-gray-200 font-medium">{page}</span> of{" "}
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
              </div>
            )}
          </div>
  
      {/* CREATE BRAND MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-2xl font-bold mb-6 text-white">Create Brand</div>

            <BrandForm form={form} setForm={setForm} />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-600 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={createBrand}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Create Brand
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
  open={confirmOpen}
  title="Delete Brand"
  message="Are you sure you want to delete this brand?"
  onCancel={() => setConfirmOpen(false)}
  onConfirm={handleDelete}
/>

      {/* QR CODE MODAL */}
      {qrModal && selectedBrand && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xl font-bold text-white">QR Code</div>
              <button
                onClick={() => setQrModal(false)}
                className="text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg">
                {selectedBrand.qrCodeUrl ? (
                  <img
                    src={selectedBrand.qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                    No QR Code
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-white font-semibold">{selectedBrand.name}</p>
                <p className="text-gray-400 text-sm">/{selectedBrand.slug}</p>
              </div>

              <button
                onClick={downloadQR}
                disabled={!selectedBrand.qrCodeUrl}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-medium transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download QR Code
              </button>

              <button
                onClick={() => setQrModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </div>


  );
}
