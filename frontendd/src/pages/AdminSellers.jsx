import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminSellers() {
  const nav = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    shopName: "",
    address: "",
    status: "pending",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchSellers();
  }, []);

  async function fetchSellers() {
    try {
      setLoading(true);
      const res = await api.get("/sellers");
      setSellers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sellers");
    } finally {
      setLoading(false);
    }
  }

  async function createOrUpdateSeller() {
    try {
      const { email, password, name, phone, shopName, address, status } = form;

      if (!email || !email.includes("@")) {
        toast.error("Valid email is required");
        return;
      }

      if (!editingId && !password) {
        toast.error("Password is required");
        return;
      }

      const payload = editingId
        ? { name, phone, shopName, address, status, ...(password && { password }) }
        : form;

      if (editingId) {
        await api.put(`/sellers/${editingId}`, payload);
        toast.success("Seller updated successfully");
      } else {
        await api.post("/sellers", payload);
        toast.success("Seller created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchSellers();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Operation failed");
    }
  }

  async function deleteSeller(id) {
    if (!window.confirm("Are you sure you want to delete this seller?")) return;

    try {
      await api.delete(`/sellers/${id}`);
      toast.success("Seller deleted");
      fetchSellers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete seller");
    }
  }

  function openCreateModal() {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  }

  function openEditModal(seller) {
    setForm({
      email: seller.email,
      password: "",
      name: seller.name || "",
      phone: seller.phone || "",
      shopName: seller.shopName || "",
      address: seller.address || "",
      status: seller.status || "pending",
    });
    setEditingId(seller._id);
    setShowModal(true);
  }

  function resetForm() {
    setForm({
      email: "",
      password: "",
      name: "",
      phone: "",
      shopName: "",
      address: "",
      status: "pending",
    });
  }

  function logout() {
    localStorage.removeItem("token");
    setAuthToken(null);
    nav("/admin/login");
  }

  const filteredSellers = sellers.filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shopName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const getStatusColor = (status) => {

  //   switch (status) {
  //     case "Active":
  //       return "bg-green-600/20 text-green-300";
  //     case "rejected":
  //       return "bg-red-600/20 text-red-300";
  //     default:
  //       return "bg-yellow-600/20 text-yellow-300";
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
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
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Seller Register</h1>
                <p className="text-gray-400 text-sm md:text-base">Manage all registered sellers</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition cursor-pointer"
              >
                + Create Seller
              </button>
            </div>

            {/* SEARCH */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search sellers by name, email, or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* TABLE */}
            {filteredSellers.length === 0 ? (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No sellers match your search" : "No sellers registered yet"}
                </p>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
                {/* RESPONSIVE TABLE */}
                <div className="overflow-x-auto">

                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-700/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                          Seller Info
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                          Contact
                        </th>
                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                          Shop
                        </th> */}
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredSellers.map((seller) => (
                        <tr
                          key={seller._id}
                          className="hover:bg-gray-700/50 transition"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-white">{seller.name || "N/A"}</p>
                              <p className="text-sm text-gray-400">{seller.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300">
                              <p>{seller.phone || "-"}</p>
                            </div>
                          </td>
                          {/* <td className="px-6 py-4">
                            <div className="text-sm text-gray-300">
                              <p className="font-medium">{seller.shopName || "-"}</p>
                              <p className="text-gray-500">{seller.address || "-"}</p>
                            </div>
                          </td> */}
                          <td className="px-6 py-4">
              <td className="px-6 py-4">
<span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
  Active
</span>
</td>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditModal(seller)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSeller(seller._id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition cursor-pointer"
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

                {/* TABLE FOOTER */}
                <div className="px-6 py-4 bg-gray-700/50 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Total: <span className="font-semibold text-white">{filteredSellers.length}</span> sellers
                  </p>
                </div>
              </div>
            )}
    

      {/* CREATE/EDIT SELLER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-2xl font-bold mb-6 text-white">
              {editingId ? "Edit Seller" : "Create Seller"}
            </div>

            <div className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editingId}
                  placeholder="seller@example.com"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password {!editingId && "*"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? "Leave blank to keep current password" : "••••••••"}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

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
              {/* <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={form.shopName}
                  onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                  placeholder="My Awesome Shop"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div> */}

              {/* ADDRESS */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St, City, Country"
                  rows={2}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div> */}

              {/* STATUS */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div> */}
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-600 px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={createOrUpdateSeller}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition cursor-pointer"
              >
                {editingId ? "Update Seller" : "Create Seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

