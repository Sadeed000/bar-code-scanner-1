import { useEffect, useState } from "react";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminPayments() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredBrands = brands.filter(
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Payments</h1>
          <p className="text-gray-400 text-sm md:text-base">View brand payment information</p>
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

        {/* TABLE */}
        {filteredBrands.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-400 text-lg">
              {searchTerm ? "No brands match your search" : "No brands found"}
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            {/* RESPONSIVE TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Brand Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Slug
                    </th>

                       <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Payment Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                 
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {console.log("Filtered Brands:", filteredBrands)}
  {filteredBrands.map((brand) => (
    <tr key={brand._id} className="hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
        {brand.name || "N/A"}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
        {brand.slug || "-"}
      </td>

    <td className="px-6 py-4 whitespace-nowrap text-sm">
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
    {brand?.createdBy?.name || "-"}
  </span>
</td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-300 capitalize">
          {brand.paymentType || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-green-400">
          ₹{brand.amount || 0}
        </span>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}