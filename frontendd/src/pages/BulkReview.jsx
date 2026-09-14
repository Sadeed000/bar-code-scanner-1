import TablePagination, { TableSearch } from "../component/TableControls";
import { UploadCloud, Layers } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { api } from "../api/client";

export default function BulkReviewsPage() {

  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState([]);
  const [summarySearch, setSummarySearch] = useState("");
  const [summaryPage, setSummaryPage] = useState(1);
  const [summaryTotal, setSummaryTotal] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [summaryRefresh, setSummaryRefresh] = useState(0);
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
  fetchCategories();
}, []);

  useEffect(() => {
    const controller = new AbortController();
    setSummaryLoading(true);
    setSummaryError("");
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/reviews/summary", {
          params: { page: summaryPage, limit: 10, q: summarySearch.trim() },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setSummary(data.items);
        setSummaryTotal(data.total);
        setSummaryPage(data.page);
      } catch (err) {
        if (!controller.signal.aborted) setSummaryError(err.response?.data?.message || "Could not load reviews. Please try again.");
      } finally {
        if (!controller.signal.aborted) setSummaryLoading(false);
      }
    }, summarySearch ? 350 : 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [summaryPage, summarySearch, summaryRefresh]);

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

      setSummaryLoading(true);
      setSummaryRefresh(value => value + 1);

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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            <UploadCloud size={25} className="mb-3 text-blue-700" />Bulk Reviews Upload
          </h1>
          <p className="text-slate-500">
            Upload category wise reviews using CSV
          </p>
        </div>

        {/* FORM CARD */}

        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            {/* Left: category + file */}
            <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end">
              <div className="w-full md:w-56">
                <label className="text-xs md:text-sm text-slate-700 block mb-1.5">
                  Select Category
                </label>

     <div className="relative">

  <button type="button" aria-expanded={showCategoryDropdown}
    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm cursor-pointer"
  >
    {category || "Choose category"}
  </button>

  {showCategoryDropdown && (

    <div className="absolute w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-60 overflow-y-auto z-50">

      <input
        type="text"
        placeholder="Search category..."
        value={categorySearch}
        onChange={(e) => setCategorySearch(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 text-slate-900 border-b border-slate-200 outline-none"
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
  className="px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer text-sm transition-colors"
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
          className="px-4 py-2 text-blue-700 hover:bg-slate-100 cursor-pointer text-sm"
        >
          + Create "{categorySearch}"
        </div>

      )}

    </div>

  )}

</div>
              </div>

              <div className="w-full">
                <label className="text-xs md:text-sm text-slate-700 block mb-1.5">
                  Upload CSV File
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 text-sm"
                />
              </div>
            </div>

            {/* Middle: overwrite checkbox */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
  <span className="text-sm text-slate-700 mr-1">Overwrite reviews</span>

  <button
    type="button"
    role="switch"
    aria-label="Overwrite reviews"
    aria-checked={overwriteExisting}
    onClick={() => setOverwriteExisting(!overwriteExisting)}
    className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${
      overwriteExisting ? "bg-blue-600" : "bg-slate-300"
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

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-8">

            <div className="p-4 border-b border-slate-200 text-slate-900 font-semibold">
              CSV Preview ({reviews.length} reviews)
            </div>

            <div className="max-h-[300px] overflow-y-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Review</th>
                  </tr>
                </thead>

                <tbody>

                  {reviews.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-200 hover:bg-slate-100"
                    >
                      <td className="px-4 py-3 text-slate-500">
                        {i + 1}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
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
        <TableSearch value={summarySearch} onChange={value => { setSummaryLoading(true); setSummarySearch(value); setSummaryPage(1); }} placeholder="Search categories or uploaders…" />

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="p-4 border-b border-slate-200 text-slate-900 font-semibold">
            <span className="flex items-center gap-2"><Layers size={18} className="text-slate-400" />Uploaded Review Categories</span>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Review Count</th>
                  <th className="px-4 py-3 text-left">Uploaded By</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
{summaryLoading && <tr><td colSpan="4" className="text-center py-6 text-slate-500"><span role="status">Reviews are loading...</span></td></tr>}
{!summaryLoading && summaryError && <tr><td colSpan="4" className="text-center py-6"><p role="alert" className="text-red-700 mb-3">{summaryError}</p><button type="button" className="btn btn-secondary btn-small" onClick={() => { setSummaryLoading(true); setSummaryRefresh(value => value + 1); }}>Try again</button></td></tr>}
{!summaryLoading && !summaryError && summary.length === 0 && (
  <tr>
    <td
      colSpan="4"
      className="text-center py-6 text-slate-500"
    >
      {summarySearch ? "No categories match your search" : "No reviews uploaded yet"}
    </td>
  </tr>
)}

{!summaryLoading && !summaryError && summary.map((item) => (
    <tr
      key={item._id}
      className="border-b border-slate-200 hover:bg-slate-100"
    >

      <td className="px-4 py-3 text-slate-700 capitalize">
        {item.category}
      </td>

      <td className="px-4 py-3 text-slate-700">
        {item.reviewCount}
      </td>

      <td className="px-4 py-3 text-slate-700">
        {item.uploadedBy}
      </td>

      <td className="px-4 py-3 text-slate-500">
        {new Date(item.createdAt).toLocaleDateString()}
      </td>

    </tr>
))}

              </tbody>

            </table>

          </div>
          {!summaryLoading && !summaryError && <TablePagination page={summaryPage} total={summaryTotal} onChange={page => { setSummaryLoading(true); setSummaryPage(page); }} />}
        </div>

      </div>

    </div>
  );
}