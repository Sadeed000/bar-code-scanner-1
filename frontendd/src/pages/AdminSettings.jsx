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
      // Update local storage
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
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400 text-sm md:text-base">Update your profile information</p>
        </div>

        {/* FORM */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="space-y-6">
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seller@example.com"
                  disabled={true} // or any condition

  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* SHOP NAME */}
 


            {/* SAVE BUTTON */}
            <div className="flex justify-end">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}