import { X, Phone, Mail, MapPin, Globe, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactDialog({ data, isOpen, onClose, accent }) {
  if (!isOpen) return null;

  const handleCopyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleSaveContact = () => {
    // Create VCF (vCard) format contact
    const contactName = data?.ownerName || data?.name || "Contact";
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${contactName}
ORG:${data?.name || ""}
${data?.ownerPhone ? `TEL:${data.ownerPhone}` : data?.contactNumber ? `TEL:${data.contactNumber}` : ""}
${data?.ownerEmail ? `EMAIL:${data.ownerEmail}` : ""}
${data?.address ? `ADR:;;${data.address}` : ""}
${data?.website ? `URL:${data.website}` : ""}
END:VCARD`;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(navigator.userAgent);
    
 if (isMobile) {
  try {
    const dataUrl =
      "data:text/vcard;charset=utf-8," + encodeURIComponent(vcard);

    window.location.href = dataUrl;

  } catch (err) {
    console.error("Error opening contact:", err);
    toast.error("Could not save contact");
    onClose();
    return;
  }
}else {
      // For desktop: Download as file
      const blob = new Blob([vcard], { type: "text/vcard" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${contactName}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    
    toast.success("Contact saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 transition-all duration-300 ease-in-out opacity-100">
      <div className="bg-white w-full sm:w-[95%] sm:max-w-[420px] rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 ease-out scale-100 opacity-100 translate-y-0">
        
        {/* HEADER */}
        <div className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-100 px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-between rounded-t-3xl sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Contact Details
          </h2>
          <button
            onClick={onClose}
            className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-4">
          
          {/* BUSINESS NAME AND CONTACT PERSON */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center overflow-hidden">
              {data?.logoUrl ? (
                <img
                  src={import.meta.env.VITE_APP_BRAND_LOGO_URL + data.logoUrl}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">☕</span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900" style={{ color: accent }}>
              {data?.ownerName || data?.name || "Contact"}
            </h3>
            {data?.name && data?.ownerName && (
              <p className="text-sm text-gray-500 mt-1">{data.name}</p>
            )}
            {data?.tagline && (
              <p className="text-sm text-gray-500 mt-1">{data.tagline}</p>
            )}
          </div>

          {/* CONTACT ITEMS */}
          <div className="space-y-3">
            
            {/* PHONE */}
            {(data?.ownerPhone || data?.contactNumber) && (
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-semibold text-gray-900">{data?.ownerPhone || data?.contactNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(data?.ownerPhone || data?.contactNumber, "Phone")}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Copy size={16} className="text-gray-600" />
                </button>
              </div>
            )}

            {/* OWNER NAME */}
            {data?.ownerName && (
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Person</p>
                    <p className="text-sm font-semibold text-gray-900">{data.ownerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(data.ownerName, "Contact Person")}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Copy size={16} className="text-gray-600" />
                </button>
              </div>
            )}

            {/* EMAIL */}
            {data?.ownerEmail && (
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{data.ownerEmail}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(data.ownerEmail, "Email")}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Copy size={16} className="text-gray-600" />
                </button>
              </div>
            )}

            {/* ADDRESS */}
            {data?.address && (
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm font-semibold text-gray-900">{data.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(data.address, "Address")}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Copy size={16} className="text-gray-600" />
                </button>
              </div>
            )}

            {/* WEBSITE */}
            {data?.website && (
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Globe size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{data.website}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyToClipboard(data.website, "Website")}
                  className="p-2 hover:bg-gray-200 rounded-lg transition"
                >
                  <Copy size={16} className="text-gray-600" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* FOOTER BUTTON */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-5 rounded-b-3xl flex-shrink-0 shadow-lg flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl text-sm sm:text-base font-semibold transition"
          >
            Close
          </button>
          <button
            onClick={handleSaveContact}
            className="flex-1 text-white py-3 rounded-xl text-sm sm:text-base font-semibold transition"
            style={{ 
              backgroundColor: accent,
              opacity: 0.9 
            }}
            onMouseEnter={(e) => e.target.style.opacity = "1"}
            onMouseLeave={(e) => e.target.style.opacity = "0.9"}
          >
            Save Contact
          </button>
        </div>

      </div>
    </div>
  );
}
