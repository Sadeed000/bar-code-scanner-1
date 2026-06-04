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

          {/* PAYMENT INFO */}
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
{/* LOGO UPLOAD */}
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

          setForm({
            ...form,
            logoFile: file,
          });
        }}
      />
    </label>

    {form?.logoFile && (
      <span className="text-xs md:text-sm text-gray-300 flex items-center">
        ✓ {form.logoFile.name}
      </span>
    )}
  </div>

{/* LOGO PREVIEW */}
{(form?.logoFile || form?.logoUrl) && (
  <div>
    <p className="text-xs text-gray-400 mt-2">
      {form?.logoFile ? "Preview:" : "Current logo:"}
    </p>
{console.log(import.meta.env.VITE_APP_BRAND_LOGO_URL+form.logoUrl)}
    <img
      src={
        form?.logoFile
          ? URL.createObjectURL(form.logoFile)
          : `${import.meta.env.VITE_APP_BRAND_LOGO_URL}${form.logoUrl}`
      }
      alt="logo preview"
      className="h-20 w-full max-w-[220px] mt-2 object-contain border border-gray-600 rounded-lg p-2 bg-gray-800"
    />
  </div>
)}
</div>


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
      <span className="text-xs md:text-sm text-gray-300 flex items-center">
        ✓ {form.watermarkFile.name}
      </span>
    )}
  </div>

{/* WATERMARK PREVIEW */}
{(form?.watermarkFile || form?.watermarkUrl) && (
  <div>
    <p className="text-xs text-gray-400 mt-2">
      {form?.watermarkFile ? "Preview:" : "Current watermark:"}
    </p>

    <img
      src={
        form?.watermarkFile
          ? URL.createObjectURL(form.watermarkFile)
          : `${import.meta.env.VITE_APP_BRAND_LOGO_URL}${form.watermarkUrl}`
      }
      alt="watermark preview"
      className="h-20 w-full max-w-[220px] mt-2 object-contain border border-gray-600 rounded-lg p-2 bg-gray-800"
    />
  </div>
)}
</div>
  
        </div>
      </div>


{/* GALLERY UPLOAD */}
<div className="sm:col-span-2 lg:col-span-2">
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
      <span className="text-xs md:text-sm text-gray-300">
        ✓ {(form?.galleryFiles?.length || 0) + (form?.gallery?.length || 0)} images selected
      </span>
    )}
  </div>

  {/* EXISTING IMAGES (Edit Mode) */}
  {form?.gallery?.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {form.gallery.map((img, i) => (
        <img
          key={`existing-${i}`}
          src={`${import.meta.env.VITE_APP_BRAND_LOGO_URL}${img}`}
          alt="gallery"
          className="h-20 w-full object-cover border border-gray-600 rounded-lg"
        />
      ))}
    </div>
  )}

  {/* NEW UPLOADED FILES PREVIEW */}
  {form?.galleryFiles?.length > 0 && (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {form.galleryFiles.map((file, i) => (
        <img
          key={`new-${i}`}
          src={URL.createObjectURL(file)}
          alt="preview"
          className="h-20 w-full object-cover border border-gray-600 rounded-lg"
        />
      ))}
    </div>
  )}
</div>
      {/* GALLERY UPLOAD */}
      {/* <div>
        <h3 className="text-base md:text-lg font-semibold text-white mb-4">Gallery (Up to 6 images)</h3>
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
                    className="h-20 w-full object-cover border border-gray-600 rounded-lg"
                  />
                  <p className="text-xs text-gray-300 mt-1">{form.galleryFiles[i].name}</p>
                </div>
              )}
              {form?.gallery?.[i] && !form?.galleryFiles?.[i] && (
                <div className="mt-2">
                  <img
                    src={form.gallery[i]}
                    alt={`current gallery ${i + 1}`}
                    className="h-20 w-full object-cover border border-gray-600 rounded-lg"
                  />
                  <p className="text-xs text-gray-400">Current image</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div> */}

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
              {/* <input
                placeholder="BG Color"
                value={l.bg}
                onChange={(e) => updateLink(i, "bg", e.target.value)}
                className={inputClass}
              /> */}
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