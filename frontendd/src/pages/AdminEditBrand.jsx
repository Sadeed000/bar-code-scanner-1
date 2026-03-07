import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";
import BrandForm from "../component/BrandForm";

export default function AdminEditBrand() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [scanCount, setScanCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchBrand();
  }, [id]);

  async function fetchBrand() {
    try {
      setLoading(true);
      const res = await api.get("/brands");
      const found = res.data.find((x) => x._id === id);
      if (found) {
        setForm(found);
        // we can also fetch current scan count for this brand
        try {
          const countRes = await api.get(`/qr-code/analytics/brand/${found.slug}`);
          setScanCount(countRes.data.scans || 0);
        } catch (e) {
          console.warn("Could not fetch scan count", e);
        }
      } else {
        toast.error("Brand not found");
        nav("/admin/brands");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brand");
      nav("/admin/brands");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    try {
      if (!form.name || form.name.length < 2) {
        toast.error("Brand name must be at least 2 characters");
        return;
      }

      setSaving(true);
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "logoFile") {
          if (form.logoFile) formData.append("logo", form.logoFile);
        } else if (key !== "logoUrl") {
          formData.append(key, typeof form[key] === "string" ? form[key] : JSON.stringify(form[key]));
        }
      });

      await api.put(`/brands/${id}`, formData);
      toast.success("Brand updated successfully!");
      nav("/admin/brands");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save brand");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    nav("/admin/login");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading brand...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-gray-300">Brand not found</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 md:ml-64 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 w-full max-w-4xl rounded-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Edit Brand</h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">{form.name}</p>
              <p className="text-xs md:text-sm text-purple-300 mt-1">
                📱 {scanCount} scans
              </p>
            </div>
            <button
              onClick={() => nav("/admin/brands")}
              className="text-gray-400 hover:text-white text-2xl cursor-pointer flex-shrink-0"
            >
              ✕
            </button>
          </div>

          <BrandForm form={form} setForm={setForm} />

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
            <button
              onClick={() => nav("/admin/brands")}
              className="border border-gray-600 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={save}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition font-medium cursor-pointer"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
  );
}