import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";
import BrandForm from "../component/BrandForm";
        import { Tag, Users, Smartphone, CheckCircle } from "lucide-react";
import { IndianRupee } from "lucide-react";

export default function AdminDashboard() {
  const nav = useNavigate();
  const [brands, setBrands] = useState([]);
  const [stats, setStats] = useState({
    totalBrands: 0,
    totalSellers: 0,
    qrScans: 0,
    activeSellers: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
const [showScanner, setShowScanner] = useState(false);  // ← Add this line
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
  });

  const closeModel = () => setShowModal(false);
  const brandLogo = import.meta.env.VITE_APP_BRAND_LOGO_URL ;

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [brandsRes, statsRes] = await Promise.all([
        api.get("/brands"),
        api.get("/brands/stats"),
      ]);
      setBrands(brandsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
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
        } else if (key !== "logoUrl" && key !== "watermarkUrl" && key !== "gallery" && key !== "logoFile" && key !== "watermarkFile") {
          formData.append(key, typeof form[key] === "string" ? form[key] : JSON.stringify(form[key]));
        }
      });

      const res = await api.post("/brands", formData);
      toast.success("Brand created");
      setShowModal(false);
      fetchData();
      nav(`/admin/brands/${res.data._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create brand");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    nav("/admin/login");
  }

  function updateLink(index, field, value) {
    const updated = [...form.links];
    updated[index][field] = value;
    setForm({ ...form, links: updated });
  }

  function openCreateModal() {
    setForm({
      name: "",
      slug: "",
      tagline: "",
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

  const handleScan = (scannedUrl) => {
  // scannedUrl will be the tracking URL
  window.open(scannedUrl, "_blank"); // or handle it as needed
  setShowScanner(false);
};  // ← Add this function


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-gray-400">Welcome to your admin panel</p>
            </div>


{/* STATS CARDS */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

  {/* Total Brands */}
  <div className="relative group bg-gradient-to-br from-blue-500/90 to-blue-600/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
    
    <div className="flex items-center justify-between">
      <div>
        <p className="text-blue-100 text-sm">Total Brands</p>
        <h2 className="text-3xl font-bold mt-1">{stats.totalBrands}</h2>
        <p className="text-xs text-blue-200 mt-1">Registered brands</p>
      </div>

      <div className="bg-white/20 p-3 rounded-xl">
        <Tag size={28}/>
      </div>
    </div>

  </div>


  {/* Total Sellers */}
  <div className="relative group bg-gradient-to-br from-green-500/90 to-green-600/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

    <div className="flex items-center justify-between">
      <div>
        <p className="text-green-100 text-sm">Total Sellers</p>
        <h2 className="text-3xl font-bold mt-1">{stats.totalSellers}</h2>
        <p className="text-xs text-green-200 mt-1">All sellers</p>
      </div>

      <div className="bg-white/20 p-3 rounded-xl">
        <Users size={28}/>
      </div>
    </div>

  </div>


  {/* QR Scans */}
  <div className="relative group bg-gradient-to-br from-purple-500/90 to-purple-600/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

    <div className="flex items-center justify-between">
      <div>
        <p className="text-purple-100 text-sm">QR Scans</p>
        <h2 className="text-3xl font-bold mt-1">{stats.qrScans}</h2>
        <p className="text-xs text-purple-200 mt-1">Total scans</p>
      </div>

      <div className="bg-white/20 p-3 rounded-xl">
        <Smartphone size={28}/>
      </div>
    </div>

  </div>


  {/* Active Sellers */}
  <div className="relative group bg-gradient-to-br from-orange-500/90 to-orange-600/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

    <div className="flex items-center justify-between">
      <div>
        <p className="text-orange-100 text-sm">Active Sellers</p>
        <h2 className="text-3xl font-bold mt-1">{stats.activeSellers}</h2>
        <p className="text-xs text-orange-200 mt-1">Currently active</p>
      </div>

      <div className="bg-white/20 p-3 rounded-xl">
        <CheckCircle size={28}/>
      </div>
    </div>

  </div>

</div>
{/* Total Payment */}
{/* Total Payment */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

  <div className="relative bg-gradient-to-br from-emerald-500/90 to-emerald-600/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-emerald-100 text-sm">Total Payment</p>

        <h2 className="text-3xl font-bold mt-1">
          ₹{stats.totalAmount || 0}
        </h2>

        <p className="text-xs text-emerald-200 mt-1">
          Revenue generated
        </p>
      </div>

      <div className="bg-white/20 p-3 rounded-xl">
        <IndianRupee size={28} />
      </div>

    </div>

  </div>

</div>

            

            {/* CREATE BRAND BUTTON */}
            <div className="mb-6">
              <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl cursor-pointer"
              >
                + Create Brand
              </button>
            </div>


            {/* RECENT BRANDS */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Recent Brands</h2>
              </div>

              {brands.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-lg">No brands created yet</p>
                  <p className="text-sm mt-2">Click "Create Brand" to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {brands.slice(0, 5).map((brand) => (
                    <button
                      key={brand._id}
                      onClick={() => nav(`/admin/brands/${brand._id}`)}
                      className="w-full text-left p-6 hover:bg-gray-700/50 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        {brand.logoUrl && (
                          console.log("hey00", `${brandLogo + brand.logoUrl}`) ||
                          <img
                            src={brandLogo + brand.logoUrl}
                            alt={brand.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-400 transition">
                            {brand.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Public URL: /p/{brand.slug}
                          </p>
                        </div>
                      </div>
                      <span className="text-gray-500 group-hover:text-gray-300">→</span>
                    </button>
                  ))}
                </div>
              )}

              {brands.length > 5 && (
                <div className="p-6 border-t border-gray-700 text-center">
                  <button
                    onClick={() => nav("/admin/brands")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition cursor-pointer"
                  >
                    View All Brands →
                  </button>
                </div>
              )}
            </div>
          </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-4xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-2xl font-bold mb-6 text-white">Create Brand</div>

            <BrandForm form={form} setForm={setForm} />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModel}
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
    </div>
  );
}