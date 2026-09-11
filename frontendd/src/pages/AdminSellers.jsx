import Modal from "../component/Modal";
import TablePagination from "../component/TableControls";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Plus, Search, X } from "lucide-react";
import ConfirmDialog from "../component/ConfirmDialog";

export default function AdminSellers() {
  const nav = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const [confirmOpen, setConfirmOpen] = useState(false);
const [sellerToDelete, setSellerToDelete] = useState(null);
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

async function handleConfirmDelete() {
  try {
    await api.delete(`/sellers/${sellerToDelete}`);
    toast.success("Seller deleted");
    fetchSellers();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete seller");
  } finally {
    setConfirmOpen(false);
    setSellerToDelete(null);
  }
}
  function openCreateModal() {
    resetForm();
    setEditingId(null);
    setShowModal(true);
  }
function deleteSeller(id) {
  setSellerToDelete(id);
  setConfirmOpen(true);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading sellers...</p>
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
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Sellers</h1>
            <p className="text-slate-500">Manage and register all sellers</p>
          </div>
          <button
            onClick={openCreateModal}
            className="btn btn-primary inline-flex whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Seller</span>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="card-compact mb-6 animate-fade-in">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, or shop..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="input-field pl-10 w-full"
              />
            </div>
            <div className="text-sm text-slate-500 flex items-center">
              <span className="font-medium text-slate-700">{filteredSellers.length}</span> sellers
            </div>
          </div>
        </div>

        {/* TABLE */}
        {filteredSellers.length === 0 ? (
          <div className="card-elevated text-center py-16 animate-fade-in">
            <Pencil className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg mb-2">
              {searchTerm ? "No sellers match your search" : "No sellers registered yet"}
            </p>
            {!searchTerm && (
              <>
                <p className="text-gray-500 text-sm mb-6">Add your first seller to get started</p>
                <button
                  onClick={openCreateModal}
                  className="btn btn-primary inline-flex"
                >
                  <Plus className="w-4 h-4" />
                  Add Seller
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="card-elevated overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name & Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredSellers.slice((Math.min(page, Math.max(1, Math.ceil(filteredSellers.length / 10))) - 1) * 10, Math.min(page, Math.max(1, Math.ceil(filteredSellers.length / 10))) * 10).map((seller) => (
                    <tr key={seller._id} className="hover:bg-slate-100 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center font-bold text-blue-700">
                            {seller.name?.charAt(0)?.toUpperCase() || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{seller.name || "N/A"}</p>
                            <p className="text-xs text-gray-500 truncate">{seller.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          {seller.phone ? (
                            <a href={`tel:${seller.phone}`} className="hover:text-blue-700 transition">
                              {seller.phone}
                            </a>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-success text-xs">Active</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(seller)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 hover:text-blue-700 transition"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSeller(seller._id)}
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

            <TablePagination page={page} total={filteredSellers.length} onChange={setPage} />
          </div>
        )}
      </div>

      {/* CREATE/EDIT SELLER MODAL */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)} label="Seller details">
          <div className="modal-content max-w-2xl animate-fade-in-up">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{editingId ? "Edit Seller" : "Add Seller"}</h2>
                <p className="text-slate-500 text-sm mt-1">{editingId ? "Update seller information" : "Create a new seller account"}</p>
              </div>
              <button aria-label="Close dialog"
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-900 transition p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5 mb-6">
              {/* EMAIL */}
              <div>
                <label className="label label-required">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!!editingId}
                  placeholder="seller@example.com"
                  className="input-field disabled:opacity-50"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="label">{editingId ? "Password (leave blank to keep current)" : "Password"} {!editingId && <span className="text-red-500">*</span>}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingId ? "••••••••" : "••••••••"}
                  className="input-field"
                />
              </div>

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
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={createOrUpdateSeller}
                className="btn btn-primary"
              >
                {editingId ? "Update Seller" : "Create Seller"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Seller"
        message="Are you sure you want to delete this seller? This action cannot be undone."
        onCancel={() => {
          setConfirmOpen(false);
          setSellerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

