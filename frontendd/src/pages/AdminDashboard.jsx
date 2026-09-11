import Modal from "../component/Modal";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken, assetUrl } from "../api/client";
import { toast } from "react-hot-toast";
import BrandForm from "../component/BrandForm";
import { Tag, Users, Smartphone, CheckCircle, IndianRupee, Plus, ArrowRight } from "lucide-react";


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
      { key: "booking", label: "Booking", url: "", enabled: true },
      { key: "zomato", label: "Zomato", url: "", enabled: true },
      { key: "google", label: "Google", url: "", enabled: true },
      { key: "tripadvisor", label: "Tripadvisor", url: "", enabled: true },
    ],
    reviews: [],
  });

  const closeModel = () => setShowModal(false);

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
        } else if (key === "backgroundFile") {
          if (form.backgroundFile) formData.append("background", form.backgroundFile);
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
      toast.error(err.response?.data?.message || "Failed to create brand");
    }
  }

  function logout() {
    setAuthToken(null);
    nav("/admin/login", { replace: true });
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
        { key: "booking", label: "Booking", url: "", enabled: true },
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's an overview of your system.</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {/* Total Brands Card */}
          <div className="card-elevated group cursor-default">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-1">Total Brands</p>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalBrands}</h2>
                <p className="text-xs text-gray-500">Registered brands</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>

          {/* Total Sellers Card */}
          <div className="card-elevated group cursor-default">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-1">Total Sellers</p>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">{stats.totalSellers}</h2>
                <p className="text-xs text-gray-500">All sellers</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>

          {/* QR Scans Card */}
          <div className="card-elevated group cursor-default">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-1">QR Scans</p>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">{stats.qrScans}</h2>
                <p className="text-xs text-gray-500">Total scans</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </div>

          {/* Active Sellers Card */}
          <div className="card-elevated group cursor-default">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-1">Active Sellers</p>
                <h2 className="text-3xl font-bold text-slate-900 mb-1">{stats.activeSellers}</h2>
                <p className="text-xs text-gray-500">Currently active</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </div>
        </div>

        {/* REVENUE CARD */}
        <div className="mb-8 animate-fade-in">
          <div className="card-elevated">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-sm font-medium mb-1">Total Revenue</p>
                <h2 className="text-4xl font-bold text-slate-900 mb-1">
                  ₹{(stats.totalAmount || 0).toLocaleString('en-IN')}
                </h2>
                <p className="text-xs text-gray-500">Overall revenue generated</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                <IndianRupee className="w-7 h-7 text-emerald-700" />
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS ROW */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in">
          <button
            onClick={openCreateModal}
            className="btn btn-primary flex-1"
          >
            <Plus className="w-5 h-5" />
            <span>Create Brand</span>
          </button>
          <button
            onClick={() => nav("/admin/brands")}
            className="btn btn-secondary flex-1"
          >
            <span>View All Brands</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* RECENT BRANDS SECTION */}
        <div className="card-elevated animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Brands</h2>
            {brands.length > 5 && (
              <button
                onClick={() => nav("/admin/brands")}
                className="text-blue-700 hover:text-blue-700 text-sm font-medium transition flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {brands.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-slate-500 font-medium mb-2">No brands yet</p>
              <p className="text-gray-500 text-sm mb-6">Create your first brand to get started</p>
              <button
                onClick={openCreateModal}
                className="btn btn-primary inline-flex"
              >
                <Plus className="w-4 h-4" />
                Create Brand
              </button>
            </div>
          ) : (
            <div className="space-y-2 -mx-6 -mb-6">
              {brands.slice(0, 5).map((brand, idx) => (
                <button
                  key={brand._id}
                  onClick={() => nav(`/admin/brands/${brand._id}`)}
                  className={`w-full text-left p-4 hover:bg-slate-100 transition-all duration-200 group flex items-center justify-between ${
                    idx !== brands.length - 1 ? 'border-b border-gray-700/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                      {brand.logoUrl ? (
                        <img
                          src={assetUrl(brand.logoUrl)}
                          alt={brand.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Tag className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 group-hover:text-blue-400 transition">
                        {brand.name}
                      </p>
                      <p className="text-xs text-gray-500">/p/{brand.slug}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE BRAND MODAL */}
      {showModal && (
        <Modal onClose={closeModel} label="Create brand">
          <div className="modal-content animate-fade-in-up max-w-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Create Brand</h2>
                <p className="text-slate-500 text-sm mt-1">Set up a new brand profile</p>
              </div>
              <button aria-label="Close dialog"
                onClick={closeModel}
                className="text-slate-500 hover:text-slate-900 transition p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="mb-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <BrandForm form={form} setForm={setForm} />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={closeModel}
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
    </div>
  );
}

import { X } from "lucide-react";