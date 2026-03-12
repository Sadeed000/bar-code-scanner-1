import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";

export default function BulkReviewsPage() {

  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

  const [categories, setCategories] = useState([]);
const [categorySearch, setCategorySearch] = useState("");
const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const fileInputRef = useRef(null);

  async function fetchCategories() {
  try {
    const res = await api.get("/reviews/categories");
    setCategories(res.data);
  } catch (err) {
    console.log(err);
  }
}

async function createCategory(name) {

  try {

    await api.post("/reviews/category", {
      category: name
    });

    toast.success("Category created");

    fetchCategories();

  } catch (err) {
    toast.error("Category already exists");
  }

}

  // Load uploaded categories
useEffect(() => {
  fetchSummary();
  fetchCategories();
}, []);

  async function fetchSummary() {
    try {
      const res = await api.get("/reviews/summary");
      setSummary(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  function handleFile(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = function (event) {
      const text = event.target.result;
      const rows = text.split("\n").filter(Boolean);

      const parsedReviews = rows.map((r) =>
        r.replace(/"/g, "").trim()
      );

      setReviews(parsedReviews);
    };

    reader.readAsText(selectedFile);
  }

  async function uploadReviews() {

    if (!category) {
      toast.error("Please select category");
      return;
    }

    if (!file) {
      toast.error("Please upload CSV file");
      return;
    }

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("category", category);
      formData.append("file", file);
      formData.append("overwriteExisting", overwriteExisting ? "true" : "false");

      await api.post("/reviews/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Reviews uploaded successfully");

      setFile(null);
      setReviews([]);
      setCategory("");
      setOverwriteExisting(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      fetchSummary();

    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }

  }

  return (
    <div className="p-4 md:p-8 w-full">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Bulk Reviews Upload
          </h1>
          <p className="text-gray-400">
            Upload category wise reviews using CSV
          </p>
        </div>

        {/* FORM CARD */}

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            {/* Left: category + file */}
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-56">
                <label className="text-xs md:text-sm text-gray-300 block mb-1.5">
                  Select Category
                </label>

     <div className="relative">

  <div
    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-200 text-sm cursor-pointer"
  >
    {category || "Choose category"}
  </div>

  {showCategoryDropdown && (

    <div className="absolute w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 max-h-60 overflow-y-auto z-50">

      <input
        type="text"
        placeholder="Search category..."
        value={categorySearch}
        onChange={(e) => setCategorySearch(e.target.value)}
        className="w-full px-3 py-2 bg-gray-900 text-white border-b border-gray-700 outline-none"
      />

      {categories
        .filter(c => c.includes(categorySearch.toLowerCase()))
        .map((c, i) => (

         <div
  key={i}
  onClick={() => {
    setCategory(c);
    setShowCategoryDropdown(false);
  }}
  className="px-4 py-2 text-gray-200 hover:bg-gray-700 hover:text-white cursor-pointer text-sm transition-colors"
>
  {c}
</div>
        ))}

      {categorySearch && !categories.includes(categorySearch.toLowerCase()) && (

        <div
          onClick={() => {
            createCategory(categorySearch);
            setCategory(categorySearch);
            setShowCategoryDropdown(false);
          }}
          className="px-4 py-2 text-blue-400 hover:bg-gray-700 cursor-pointer text-sm"
        >
          + Create "{categorySearch}"
        </div>

      )}

    </div>

  )}

</div>
              </div>

              <div className="w-full">
                <label className="text-xs md:text-sm text-gray-300 block mb-1.5">
                  Upload CSV File
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-gray-300 text-sm"
                />
              </div>
            </div>

            {/* Middle: overwrite checkbox */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
  <span className="text-sm text-gray-300 mr-1">Overwrite reviews</span>

  <button
    type="button"
    onClick={() => setOverwriteExisting(!overwriteExisting)}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
      overwriteExisting ? "bg-blue-500" : "bg-gray-700"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
        overwriteExisting ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
</div>

            {/* Right: button */}
            <div className="flex md:justify-end">
              <button
                onClick={uploadReviews}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 md:px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {loading ? "Uploading..." : "Upload Reviews"}
              </button>
            </div>
          </div>
        </div>

        {/* CSV PREVIEW */}

        {reviews.length > 0 && (

          <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden mb-8">

            <div className="p-4 border-b border-gray-700 text-white font-semibold">
              CSV Preview ({reviews.length} reviews)
            </div>

            <div className="max-h-[300px] overflow-y-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-700 text-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Review</th>
                  </tr>
                </thead>

                <tbody>

                  {reviews.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-700 hover:bg-gray-700/40"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {i + 1}
                      </td>

                      <td className="px-4 py-3 text-gray-200">
                        {r}
                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

        {/* UPLOADED REVIEW SUMMARY TABLE */}

        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">

          <div className="p-4 border-b border-gray-700 text-white font-semibold">
            Uploaded Review Categories
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-700 text-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Review Count</th>
                  <th className="px-4 py-3 text-left">Uploaded By</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
{summary.filter(item => item.reviewCount > 0).length === 0 && (
  <tr>
    <td
      colSpan="4"
      className="text-center py-6 text-gray-400"
    >
      No reviews uploaded yet
    </td>
  </tr>
)}

{summary
  .filter(item => item.reviewCount > 0)
  .map((item) => (
    <tr
      key={item._id}
      className="border-b border-gray-700 hover:bg-gray-700/40"
    >

      <td className="px-4 py-3 text-gray-200 capitalize">
        {item.category}
      </td>

      <td className="px-4 py-3 text-gray-300">
        {item.reviewCount}
      </td>

      <td className="px-4 py-3 text-gray-300">
        {item.uploadedBy}
      </td>

      <td className="px-4 py-3 text-gray-400">
        {new Date(item.createdAt).toLocaleDateString()}
      </td>

    </tr>
))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}