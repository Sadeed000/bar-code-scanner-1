import TablePagination, { TableSearch } from "../component/TableControls";
import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminPayments() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      setLoading(true);
      const res = await api.get("/brands");
      setBrands(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  }

  const filteredBrands = brands.filter(b => paymentFilter === "all" || b.paymentType === paymentFilter).filter(
    (b) =>
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Payments</h1>
          <p className="text-slate-500 text-sm md:text-base">View brand payment information</p>
        </div>

        <TableSearch value={searchTerm} onChange={value => { setSearchTerm(value); setPage(1); }} placeholder="Search brands by name or slug…"><select aria-label="Payment type" value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} className="input-field sm:w-44"><option value="all">All payment types</option><option value="cash">Cash</option><option value="online">Online</option></select></TableSearch>
        {/* TABLE */}
        {filteredBrands.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-slate-500 text-lg">
              {searchTerm ? "No brands match your search" : "No brands found"}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {/* RESPONSIVE TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Brand Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Slug
                    </th>

                       <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Amount
                    </th>
                 
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  
  {filteredBrands.slice((page - 1) * 10, page * 10).map((brand) => (
    <tr key={brand._id} className="hover:bg-slate-100">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
        {brand.name || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
        {brand.slug || "-"}
      </td>

    <td className="px-6 py-4 whitespace-nowrap text-sm">
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-700 border border-blue-500/30">
    {brand?.createdBy?.name || "-"}
  </span>
</td>
      <td className="px-6 py-4">
        <span className="text-sm text-slate-700 capitalize">
          {brand.paymentType || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-green-700">
          ₹{brand.amount || 0}
        </span>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
            <TablePagination page={page} total={filteredBrands.length} onChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}