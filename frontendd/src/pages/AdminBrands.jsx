import Modal from "../component/Modal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken, assetUrl } from "../api/client";
import { toast } from "react-hot-toast";
import BrandForm from "../component/BrandForm";
import ConfirmDialog from "../component/ConfirmDialog";
import useDebounce from "../utils/useDebounce";
import { QrCode, Download, X, Pencil, Trash2, Plus, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";


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
      { key: "booking", label: "Booking", url: "", enabled: true },
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
    return assetUrl(brand.logoUrl);
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

      const message = err.response?.data?.message || "";

      if (message.includes("E11000") || message.includes("duplicate key")) {
        toast.error("Brand already exists with this name");
      } else {
        toast.error(message || "Failed to create brand");
      }
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
        { key: "booking", label: "Booking", url: "", enabled: true },
        { key: "zomato", label: "Zomato", url: "", enabled: true },
        { key: "google", label: "Google", url: "", enabled: true },
        { key: "tripadvisor", label: "Tripadvisor", url: "", enabled: true },
      ],
      reviews: [],
    });
    setShowModal(true);
  }

  function logout() {
    setAuthToken(null);
    nav("/admin/login", { replace: true });
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
    link.href = assetUrl(selectedBrand.qrCodeUrl);
    link.download = `${selectedBrand.name}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Brands</h1>
            <p className="text-slate-500">Manage and configure all your brand profiles</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn btn-primary inline-flex whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Create Brand</span>
          </button>
        </div>

        {/* FILTERS BAR */}
        <div className="card-compact mb-6 animate-fade-in">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search & Timeframe */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search brands by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10 w-full"
                />
              </div>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                aria-label="Filter brands by date"
                className="input-field sm:w-40 sm:shrink-0"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>

            {/* Results & Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between lg:justify-end gap-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-700">{brands.length}</span> of{" "}
                <span className="font-medium text-slate-700">{total}</span> brands
              </div>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="input-field input-field-sm w-full sm:w-auto"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTimeframe("all");
                  setPage(1);
                }}
                className="btn btn-small btn-secondary w-full sm:w-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        {brands.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in">
            <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg mb-2">
              {searchTerm || timeframe !== "all" ? "No brands match your filters" : "No brands created yet"}
            </p>
            <p className="text-gray-500 text-sm mb-6">
              {!searchTerm && timeframe === "all" && "Create your first brand to get started"}
            </p>
            {!searchTerm && timeframe === "all" && (
              <button
                onClick={openCreateModal}
                className="btn btn-primary inline-flex"
              >
                <Plus className="w-4 h-4" />
                Create Brand
              </button>
            )}
          </div>
        ) : (
          <div className="card-elevated overflow-hidden animate-fade-in">
            {/* Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Links</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">QR Scans</th>
                    <th className="hidden lg:table-cell px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">QR</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {brands.map((brand) => (
                    <tr key={brand._id} className="hover:bg-slate-100 transition-colors">
                      {/* Brand Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                            {brand.logoUrl ? (
                              <img
                                src={buildLogoSrc(brand)}
                                alt={brand.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <QrCode className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-slate-900 truncate">{brand.name}</p>
                            <p className="text-xs text-gray-500 truncate">/p/{brand.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        {brand.category ? (
                          <span className="badge badge-info text-xs">
                            {brand.category}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700 font-medium">{brand.paymentType || "cash"}</div>
                        <div className="text-xs text-green-700">₹{(brand.amount || 0).toLocaleString('en-IN')}</div>
                      </td>

                      {/* Links */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{brand.links?.length || 0}</div>
                        <div className="text-xs text-gray-500">social links</div>
                      </td>

                      {/* QR Scans */}
                      <td className="px-6 py-4">
                        <span className="badge badge-primary font-medium">
                          {brand.scanCount || 0} scans
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="hidden lg:table-cell px-6 py-4">
                        <div className="text-sm text-slate-500">
                          {formatDateTime(brand.createdAt)}
                        </div>
                      </td>

                      {/* QR Code Button */}
                      <td className="px-6 py-4 text-center">
                        {brand.qrCodeUrl ? (
                          <button
                            onClick={() => openQRModal(brand)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-purple-700 hover:text-purple-700 transition"
                            title="View QR Code"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => nav(`/admin/brands/${brand._id}`)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 hover:text-blue-700 transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteBrand(brand._id)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 hover:text-red-700 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-white border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span> of{" "}
                <span className="font-medium text-slate-700">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page <= 1}
                  className="btn btn-small btn-secondary disabled:opacity-40"
                  title="First page"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn btn-small btn-secondary disabled:opacity-40"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn btn-small btn-secondary disabled:opacity-40"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="btn btn-small btn-secondary disabled:opacity-40"
                  title="Last page"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE BRAND MODAL */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} label="Create brand">
          <div className="modal-content max-w-3xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Create Brand</h2>
                <p className="text-slate-500 text-sm mt-1">Set up a new brand profile</p>
              </div>
              <button aria-label="Close dialog"
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 transition p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <BrandForm form={form} setForm={setForm} />
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createBrand}
                className="btn btn-primary"
              >
                Create Brand
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Brand"
        message="Are you sure you want to delete this brand? This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

      {/* QR CODE MODAL */}
      {qrModal && selectedBrand && (
        <Modal onClose={() => setQrModal(false)} label="QR code">
          <div className="modal-content max-w-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">QR Code</h2>
              <button aria-label="Close dialog"
                onClick={() => setQrModal(false)}
                className="text-slate-500 hover:text-slate-900 transition p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white rounded-xl">
                {selectedBrand.qrCodeUrl ? (
                  <img
                    src={assetUrl(selectedBrand.qrCodeUrl)}
                    alt="QR Code"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-slate-500">
                    No QR Code
                  </div>
                )}
              </div>

              <div className="text-center w-full">
                <p className="font-semibold text-slate-900 text-lg">{selectedBrand.name}</p>
                <p className="text-slate-500 text-sm">/p/{selectedBrand.slug}</p>
              </div>

              <button
                onClick={downloadQR}
                disabled={!selectedBrand.qrCodeUrl}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download QR Code
              </button>

              <button
                onClick={() => setQrModal(false)}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
