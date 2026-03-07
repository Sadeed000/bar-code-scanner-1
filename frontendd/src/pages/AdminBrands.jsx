import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";
import BrandForm from "../component/BrandForm";
import ConfirmDialog from "../component/ConfirmDialog";
export default function AdminBrands() {
  const nav = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  const [confirmOpen, setConfirmOpen] = useState(false);
const [deleteId, setDeleteId] = useState(null);
const user = JSON.parse(localStorage.getItem("user") || "{}");
  const brandLogo = import.meta.env.VITE_APP_BRAND_LOGO_URL ;

  console.log(brandLogo)
  const [form, setForm] = useState({
    name: "",
    slug: "",
    tagline: "",
    headline: "",
    headlineAccent: "",
    subtext: "",
    logoUrl: "",
    googleReviewUrl: "",
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      setLoading(true);
      // get brands and also scan analytics to merge counts
      const [res, analyticsRes] = await Promise.all([
        api.get("/brands"),
        api.get("/qr-code/analytics/brands"),
      ]);

      const countsMap = {};
      (analyticsRes.data || []).forEach((item) => {
        countsMap[item._id] = item.scans;
      });

      const merged = res.data.map((b) => ({
        ...b,
        scanCount: countsMap[b.slug] || 0,
      }));

      setBrands(merged);
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
        } else if (key !== "logoUrl") {
          formData.append(key, typeof form[key] === "string" ? form[key] : JSON.stringify(form[key]));
        }
      });

      await api.post("/brands", formData);
      toast.success("Brand created successfully");
      setShowModal(false);
      fetchBrands();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create brand");
    }
  }

async function handleDelete() {
  try {
    await api.delete(`/brands/${deleteId}`);
    toast.success("Brand deleted");
    fetchBrands();
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
      headline: "",
      headlineAccent: "",
      subtext: "",
      logoUrl: "",
      logoFile: null,
      googleReviewUrl: "",
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

  const filteredBrands = brands.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );


  function deleteBrand(id) {
  setDeleteId(id);
  setConfirmOpen(true);
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

            {/* SEARCH */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search brands by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* BRANDS GRID */}
            {filteredBrands.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No brands match your search" : "No brands created yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map((brand) => (
                  <div
                    key={brand._id}
                    className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-blue-500 transition group"
                  >
                    {/* BRAND IMAGE */}
                    <div className="h-44 bg-gray-700 overflow-hidden">
                      {brand.logoUrl ? (

                        <img
                          src={brandLogo + brand.logoUrl}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🏷️
                        </div>
                      )}
                    </div>

                    {/* BRAND INFO */}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">{brand.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">
                        <span className="text-gray-500">/p/{brand.slug}</span>
                      </p>
                      {brand.tagline && (
                        <p className="text-sm text-gray-300 mb-4">{brand.tagline}</p>
                      )}

                      {/* CATEGORY BADGE */}
                      {brand.category && (
                        <div className="mb-4">
                          <span className="inline-block bg-blue-600/20 text-blue-300 text-xs font-medium px-3 py-1 rounded-full">
                            {brand.category}
                          </span>
                        </div>
                      )}

                      {/* REVIEW COUNT */}
                      <div className="mb-4 flex items-center space-x-2 text-sm text-gray-400">
                        <span>⭐ {brand.reviews?.length || 0} reviews</span>
                        <span>•</span>
                        <span>🔗 {brand.links?.length} links</span>
                      </div>

                      {/* QR SCAN COUNT */}
                      <div className="mb-4 text-sm text-purple-300">
                        📱 {brand.scanCount || 0} scans
                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => nav(`/admin/brands/${brand._id}`)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBrand(brand._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
      </div>


  );
}
