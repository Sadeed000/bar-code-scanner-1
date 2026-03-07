import { useState } from "react";

export default function BrandForm({ form, setForm }) {

  function updateLink(index, field, value) {
    const updated = [...form.links];
    updated[index][field] = value;
    setForm({ ...form, links: updated });
  }

  function addLink() {
    setForm({
      ...form,
      links: [
        ...(form?.links || []),
        { label: "", url: "", icon: "", bg: "", enabled: true },
      ],
    });
  }

  function removeLink(index) {
    const updated = [...form.links];
    updated.splice(index, 1);
    setForm({ ...form, links: updated });
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

  const inputClass = "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition";
  const labelClass = "block text-xs md:text-sm font-medium text-gray-300 mb-2";

  return (
<div className="space-y-6">
      {/* BASIC INFO */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Basic Information</h3>
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
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              className={inputClass}
              value={form?.category || "cafe"}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="cafe">Cafe</option>
              <option value="restaurant">Restaurant</option>
              <option value="gym">Gym</option>
              <option value="shop">Shop</option>
              <option value="hotel">Hotel</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label className={labelClass}>Logo Upload</label>
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
                    // Store the file object, not blob URL
                    setForm({ ...form, logoFile: file });
                  }}
                />
              </label>
              {form?.logoFile && (
                <span className="text-xs md:text-sm text-gray-300 flex items-center">
                  ✓ {form.logoFile.name}
                </span>
              )}
            </div>
            {form?.logoFile && (
              <img
                src={URL.createObjectURL(form.logoFile)}
                alt="logo preview"
                className="h-16 mt-3 object-contain border border-gray-600 rounded-lg p-2"
              />
            )}
            {form?.logoUrl && !form?.logoFile && (
              <div>
                <p className="text-xs text-gray-400 mt-2">Current logo:</p>
                <img
                  src={form.logoUrl}
                  alt="current logo"
                  className="h-16 mt-2 object-contain border border-gray-600 rounded-lg p-2"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM LINKS */}
      <div>
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Links</h3>
        <div className="space-y-3">
          {form?.links?.map((l, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 items-end">
              <input
                placeholder="Label"
                value={l.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="URL"
                value={l.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Icon URL"
                value={l.icon}
                onChange={(e) => updateLink(i, "icon", e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="BG Color"
                value={l.bg}
                onChange={(e) => updateLink(i, "bg", e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addLink}
            className="text-xs md:text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            + Add Link
          </button>
        </div>
      </div>

      {/* BRAND INFORMATION */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Brand Information</h3>
        <div className="space-y-4">
          <div>
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
          </div>

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
            <label className={labelClass}>Accent Color</label>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="color"
                value={form?.theme?.accentColor || "#B08D57"}
                onChange={(e) => setForm({ ...form, theme: { accentColor: e.target.value } })}
                className="h-10 w-16 md:w-20 border border-gray-600 rounded-lg cursor-pointer bg-gray-700"
              />
              <input
                type="text"
                value={form?.theme?.accentColor || "#B08D57"}
                onChange={(e) => setForm({ ...form, theme: { accentColor: e.target.value } })}
                className={inputClass}
                placeholder="#B08D57"
              />
            </div>
          </div>

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
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-base md:text-lg font-semibold text-white mb-4">QR Code</h3>
          <img
            src={form.qrCodeUrl}
            alt="QR Code"
            className="w-32 md:w-40 border border-gray-600 rounded-lg p-4 bg-white"
          />
          <a
            href={form.qrCodeUrl}
            download
            className="block text-blue-400 hover:text-blue-300 text-xs md:text-sm mt-3 font-medium transition cursor-pointer"
          >
            ⬇️ Download QR Code
          </a>
        </div>
      )}
    </div>
  );
}