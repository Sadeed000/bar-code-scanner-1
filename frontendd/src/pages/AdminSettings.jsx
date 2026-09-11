import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminSettings() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    shopName: user.shopName || "",
    address: user.address || "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
  }, []);

  async function updateProfile() {
    try {
      setLoading(true);
      const res = await api.put(`/sellers/${user._id}`, form);
      toast.success("Profile updated successfully");
      const updatedUser = { ...user, ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* PAGE HEADER */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500">Manage your account and profile settings</p>
        </div>

        {/* PROFILE CARD */}
        <div className="card-elevated animate-fade-in">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Profile Information</h2>
            <p className="text-slate-500 text-sm">Update your personal details</p>
          </div>

          <div className="space-y-6">
            {/* NAME */}
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="input-field"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seller@example.com"
                disabled
                className="input-field opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
            </div>

            {/* PHONE */}
            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="input-field"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="btn btn-primary disabled:opacity-50"
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* ADDITIONAL INFO CARD */}
        <div className="card-elevated mt-8 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Account Information</h2>
            <p className="text-slate-500 text-sm">View your account details</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">User ID</p>
              <p className="font-medium text-slate-900">{user._id || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Role</p>
              <span className="badge badge-primary">{user.role || "User"}</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Account Status</p>
              <span className="badge badge-success">Active</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Member Since</p>
              <p className="font-medium text-slate-900">
                {new Date(user.createdAt).toLocaleDateString() || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}