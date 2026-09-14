import LogoUpload from "./LogoUpload";
import DynamicLinksEditor from "./DynamicLinksEditor";
import { useState, useEffect, useRef } from "react";
import { api, assetUrl } from "../api/client";
import toast from "react-hot-toast";


// Web-safe stacks only — no webfont request, so a slow or blocked CDN can never
// leave a brand page without its font.
const FONT_OPTIONS = [
  { label: "Default (System)", value: "" },
  { label: "Georgia (Elegant Serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Palatino (Luxury Serif)", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: "Garamond (Classic Serif)", value: "Garamond, Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Helvetica / Arial", value: "Helvetica, Arial, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New (Mono)", value: "'Courier New', Courier, monospace" },
];

const THEME_DEFAULTS = {
  logoSize: 112,
  fontFamily: "",
  headingSize: 30,
  headingColor: "#111827",
  taglineSize: 14,
  taglineColor: "#6b7280",
};

export default function BrandForm({ form, setForm, canEditPayment = true }) {

  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const dropdownRef = useRef(null);

  // Must merge, not replace — replacing the theme object drops every other
  // appearance setting the admin already chose.
  function updateTheme(field, value) {
    setForm({
      ...form,
      theme: { ...(form?.theme || {}), [field]: value, ...(field === "headingColor" ? { accentColor: value } : {}) },
    });
  }

  function themeValue(field) {
    if (field === "headingColor") return form?.theme?.accentColor || form?.theme?.headingColor || THEME_DEFAULTS.headingColor;
    return form?.theme?.[field] ?? THEME_DEFAULTS[field];
  }

  function updateReview(index, field, value) {
    const updated = [...form.reviews];
    updated[index][field] = value;
    setForm({ ...form, reviews: updated });
  }

  function addReview() {
    setForm({
      ...form,
      reviews: [
        ...(form?.reviews || []),
        { name: "", rating: "", date: "", message: "" }
      ],
    });
  }

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
      return true;
    } catch (err) {
      toast.error("Could not create category");
      return false;
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
        setCategorySearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const inputClass = "input-field";
  const labelClass = "label";

  return (
<div className="space-y-6">
      {/* BASIC INFO */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">


          <div>
            <label className={labelClass}>Brand Name</label>
            <input
              placeholder="Brand Name"
              value={form?.name || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className={inputClass}
            />
            <div className="mt-4 space-y-4">
              {/* FONT FAMILY */}
              <div>
                <label className={labelClass}>Font Style</label>
                <select
                  value={themeValue("fontFamily")}
                  onChange={(e) => updateTheme("fontFamily", e.target.value)}
                  className={inputClass}
                  style={{ fontFamily: themeValue("fontFamily") || undefined }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* HEADING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Brand Name Size — {themeValue("headingSize")}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={themeValue("headingSize")}
                    onChange={(e) => updateTheme("headingSize", Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className={labelClass}>Brand Name Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeValue("headingColor")}
                      onChange={(e) => updateTheme("headingColor", e.target.value)}
                      className="h-10 w-16 border border-slate-200 rounded-lg cursor-pointer bg-slate-100"
                    />
                    <input
                      type="text"
                      value={themeValue("headingColor")}
                      onChange={(e) => updateTheme("headingColor", e.target.value)}
                      className={inputClass}
                      placeholder="#111827"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div>
            <label className={labelClass}>Slug</label>
            <input
              placeholder="Slug (auto-generated if empty)"
              value={form?.slug || ""}
              onChange={(e) =>
                setForm({ ...form, slug: e.target.value })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Tagline</label>
            <input
              placeholder="Short tagline"
              value={form?.tagline || ""}
              onChange={(e) =>
                setForm({ ...form, tagline: e.target.value })
              }
              className={inputClass}
            />
            <div className="mt-4 space-y-4">
              {/* TAGLINE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    Tagline Size — {themeValue("taglineSize")}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="36"
                    value={themeValue("taglineSize")}
                    onChange={(e) => updateTheme("taglineSize", Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tagline Color</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={themeValue("taglineColor")}
                      onChange={(e) => updateTheme("taglineColor", e.target.value)}
                      className="h-10 w-16 border border-slate-200 rounded-lg cursor-pointer bg-slate-100"
                    />
                    <input
                      type="text"
                      value={themeValue("taglineColor")}
                      onChange={(e) => updateTheme("taglineColor", e.target.value)}
                      className={inputClass}
                      placeholder="#6b7280"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

{/* 
          <div>
            <label className={labelClass}>Owner Phone</label>
            <input
              placeholder="+91 98765 43210"
              value={form?.ownerPhone || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  ownerPhone: e.target.value,
                })
              }
              className={inputClass}
            />
          </div> */}

         <div>
  <label className={labelClass}>Category</label>
  <div className="relative" ref={dropdownRef}>
    <div
      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-slate-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition cursor-pointer"
    >
      {form?.category || "Choose category"}
    </div>

    {showCategoryDropdown && (
      <div className="absolute w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-60 overflow-y-auto z-50">
        
        <input
          type="text"
          placeholder="Search category..."
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          className="w-full px-4 py-2 bg-slate-100 text-slate-900 border-b border-slate-200 outline-none"
        />

        {categorySearch.trim() && !categories.some(c => c.toLowerCase() === categorySearch.trim().toLowerCase()) && (
          <button type="button" className="px-4 py-2 text-blue-700" onClick={async () => {
            const name = categorySearch.trim();
            if (!await createCategory(name)) return;
            setForm(current => ({ ...current, category: name }));
            setShowCategoryDropdown(false);
            setCategorySearch("");
          }}>+ Create "{categorySearch.trim()}"</button>
        )}
        {categories
          .filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()))
          .map((c, i) => (
            <div
              key={i}
              onClick={() => {
                setForm({ ...form, category: c });
                setShowCategoryDropdown(false);
                setCategorySearch("");
              }}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer text-sm transition-colors"
            >
              {c}
            </div>
          ))}

      </div>
    )}
  </div>
</div>

          {/* PAYMENT INFO */}
          {canEditPayment && <>
          <div>
            <label className={labelClass}>Payment Type</label>
            <select
              className={inputClass}
              value={form?.paymentType || "cash"}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Amount</label>
            <input
              type="number"
              placeholder="Amount paid"
              value={form?.amount || ""}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
</>}
<LogoUpload form={form} setForm={setForm}  />

{/* WATERMARK UPLOAD */}
<div className="sm:col-span-2 lg:col-span-2">
  <label className={labelClass}>Watermark Image</label>

  <div className="flex flex-wrap gap-2">
    <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg cursor-pointer text-xs md:text-sm whitespace-nowrap font-medium transition">
      Choose File
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;

          setForm({
            ...form,
            watermarkFile: file,
          });
        }}
      />
    </label>

    {form?.watermarkFile && (
      <span className="text-xs md:text-sm text-slate-700 flex items-center">
        ✓ {form.watermarkFile.name}
      </span>
    )}
  </div>

{(form?.watermarkFile || form?.watermarkUrl) && (
  <div>
    <p className="text-xs text-slate-500 mt-2">
      {form?.watermarkFile ? "Preview:" : "Current watermark:"}
    </p>

    <img
      src={
        form?.watermarkFile
          ? URL.createObjectURL(form.watermarkFile)
          : assetUrl(form.watermarkUrl)
      }
      alt="watermark preview"
      className="h-20 w-full max-w-[220px] mt-2 object-contain border border-slate-200 rounded-lg p-2 bg-white"
    />
  </div>
)}
</div>


{/* BACKGROUND TEMPLATE UPLOAD */}
<div className="sm:col-span-2 lg:col-span-2">
  <label className={labelClass}>Background Theme Template</label>
  <p className="text-xs text-gray-500 mb-2">
    Optional. Upload a full-page background image (portrait, e.g. 900×1600).
    Leave empty to keep the plain background.
  </p>

  <div className="flex flex-wrap gap-2">
    <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg cursor-pointer text-xs md:text-sm whitespace-nowrap font-medium transition">
      Choose File
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;

          setForm({
            ...form,
            backgroundFile: file,
          });
        }}
      />
    </label>

    {form?.backgroundFile && (
      <span className="text-xs md:text-sm text-slate-700 flex items-center">
        ✓ {form.backgroundFile.name}
      </span>
    )}

    {(form?.backgroundFile || form?.backgroundUrl) && (
      <button
        type="button"
        onClick={() =>
          setForm({ ...form, backgroundFile: null, backgroundUrl: "" })
        }
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer"
      >
        Remove
      </button>
    )}
  </div>

  {/* BACKGROUND PREVIEW */}
  {(form?.backgroundFile || form?.backgroundUrl) && (
    <div>
      <p className="text-xs text-slate-500 mt-2">
        {form?.backgroundFile ? "Preview:" : "Current background:"}
      </p>

      <img
        src={
          form?.backgroundFile
            ? URL.createObjectURL(form.backgroundFile)
            : assetUrl(form.backgroundUrl)
        }
        alt="background preview"
        className="h-40 w-full max-w-[160px] mt-2 object-cover border border-slate-200 rounded-lg bg-white"
      />
    </div>
  )}
</div>

        </div>
      </div>


{/* GALLERY UPLOAD */}
{/* <div className="sm:col-span-2 lg:col-span-2">
  <label className={labelClass}>Gallery Images (Max 6)</label>

  <div className="flex flex-wrap gap-2">
    <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg cursor-pointer text-xs md:text-sm font-medium transition">
      Upload Images
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const newFiles = Array.from(e.target.files || []);

          const existingFiles = form.galleryFiles || [];
          const existingGallery = form.gallery || [];

          const remainingSlots = 6 - (existingFiles.length + existingGallery.length);

          if (remainingSlots <= 0) {
            alert("Maximum 6 images allowed");
            return;
          }

          const filesToAdd = newFiles.slice(0, remainingSlots);

          const mergedFiles = [...existingFiles, ...filesToAdd];

          setForm({
            ...form,
            galleryFiles: mergedFiles,
          });

          e.target.value = null;
        }}
      />
    </label>

    {(form?.galleryFiles?.length || form?.gallery?.length) > 0 && (
      <span className="text-xs md:text-sm text-slate-700">
        ✓ {(form?.galleryFiles?.length || 0) + (form?.gallery?.length || 0)} images selected
      </span>
    )}
  </div>

  {form?.gallery?.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {form.gallery.map((img, i) => (
        <img
          key={`existing-${i}`}
          src={assetUrl(img)}
          alt="gallery"
          className="h-20 w-full object-cover border border-slate-200 rounded-lg"
        />
      ))}
    </div>
  )}

  {form?.galleryFiles?.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {form.galleryFiles.map((file, i) => (
        <img
          key={`new-${i}`}
          src={URL.createObjectURL(file)}
          alt="preview"
          className="h-20 w-full object-cover border border-slate-200 rounded-lg"
        />
      ))}
    </div>
  )}
</div> */}


      {/* GALLERY UPLOAD */}
      {/* <div>
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">Gallery (Up to 6 images)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i}>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg cursor-pointer text-xs md:text-sm whitespace-nowrap font-medium transition block text-center">
                Choose Image {i + 1}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const updatedFiles = [...(form.galleryFiles || [])];
                    updatedFiles[i] = file;
                    setForm({ ...form, galleryFiles: updatedFiles });
                  }}
                />
              </label>
              {form?.galleryFiles?.[i] && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(form.galleryFiles[i])}
                    alt={`gallery ${i + 1}`}
                    className="h-20 w-full object-cover border border-slate-200 rounded-lg"
                  />
                  <p className="text-xs text-slate-700 mt-1">{form.galleryFiles[i].name}</p>
                </div>
              )}
              {form?.gallery?.[i] && !form?.galleryFiles?.[i] && (
                <div className="mt-2">
                  <img
                    src={assetUrl(form.gallery[i])}
                    alt={`current gallery ${i + 1}`}
                    className="h-20 w-full object-cover border border-slate-200 rounded-lg"
                  />
                  <p className="text-xs text-slate-500">Current image</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div> */}

      <DynamicLinksEditor form={form} setForm={setForm} />

      {/* BRAND INFORMATION */}
      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">Brand Information</h3>
        <div className="space-y-4">
          {/* <div>
            <label className={labelClass}>Headline</label>
            <input
              placeholder="Main headline"
              value={form?.headline || ""}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Headline Accent</label>
            <input
              placeholder="Accent text"
              value={form?.headlineAccent || ""}
              onChange={(e) => setForm({ ...form, headlineAccent: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Subtext</label>
            <textarea
              placeholder="Additional description"
              value={form?.subtext || ""}
              onChange={(e) => setForm({ ...form, subtext: e.target.value })}
              className={inputClass}
              rows={2}
            />
          </div> */}

          <div>
            <label className={labelClass}>About Us</label>
            <textarea
              placeholder="Write about the brand..."
              value={form?.aboutUs || ""}
              onChange={(e) => setForm({ ...form, aboutUs: e.target.value })}
              className={inputClass}
              rows={3}
            />
          </div>

          <div>
            <label className={labelClass}>Owner Name</label>
            <input
              placeholder="Owner full name"
              value={form?.ownerName || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  ownerName: e.target.value,
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Contact Number</label>
            <input
              placeholder="+91 9876543210"
              value={form?.contactNumber || ""}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Google Review URL</label>
            <input
              placeholder="https://g.page/r/xxxx/review"
              value={form?.googleReviewUrl || ""}
              onChange={(e) => setForm({ ...form, googleReviewUrl: e.target.value })}
              className={inputClass}
            />
          </div>

                <div>
            <label className={labelClass}>Pat Pooja Url</label>
            <input
              placeholder="https://g.page/r/xxxx/review"
              value={form?.patPoojaUrl || ""}
              onChange={(e) => setForm({ ...form, patPoojaUrl: e.target.value })}
              className={inputClass}
            />
          </div>


          {/* APPEARANCE EDITOR */}
 
          <div>
            <label className={labelClass}>Privacy Policy</label>
            <textarea
              placeholder="Enter privacy policy..."
              value={form?.privacyPolicy || ""}
              onChange={(e) => setForm({ ...form, privacyPolicy: e.target.value })}
              className={inputClass}
              rows={3}
            />
          </div>

          <div>
            <label className={labelClass}>Terms & Conditions</label>
            <textarea
              placeholder="Enter terms and conditions..."
              value={form?.termsConditions || ""}
              onChange={(e) => setForm({ ...form, termsConditions: e.target.value })}
              className={inputClass}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* QR CODE */}
      {form?.qrCodeUrl && (
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">QR Code</h3>
          <img
            src={assetUrl(form.qrCodeUrl)}
            alt="QR Code"
            className="w-32 md:w-40 border border-slate-200 rounded-lg p-4 bg-white"
          />
          <a
            href={assetUrl(form.qrCodeUrl)}
            download
            className="block text-blue-700 hover:text-blue-700 text-xs md:text-sm mt-3 font-medium transition cursor-pointer"
          >
            ⬇️ Download QR Code
          </a>
        </div>
      )}
    </div>
  );
}