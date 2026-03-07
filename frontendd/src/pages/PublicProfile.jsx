import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PhoneFrame from "../component/PhoneFrame";
import IconTile from "../component/IconTile";
import { api } from "../api/client";
   import { Info, Phone, Shield, FileText,Menu } from "lucide-react";
import toast from "react-hot-toast";

// Complete Brand Icons with Official Colors
const ICONS = {
  instagram: {
    bg: "linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)",
    img: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
  },

  facebook: {
    bg: "#1877F2",
    img: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
  },

  whatsapp: {
    bg: "#25D366",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
  },

youtube: {
  bg: "#FF0000",
  img: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
},
  linkedin: {
    bg: "#0A66C2",
    img: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
  },

  zomato: {
    bg: "#E23744",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png",
  },

  booking: {
    bg: "#003580",
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg",
  },

  tripadvisor: {
    bg: "#34E0A1",
    img: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Tripadvisor_logo.svg",
  },

  google: {
    bg: "#FFFFFF",
    img: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
  },
location: {
  bg: "linear-gradient(135deg, #5ddf7f, #0F9D58, #1E8E3E)",
  img: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
},
tripadvisor: {
  bg: "#34E0A1",
  img: "https://cdn-icons-png.flaticon.com/512/733/733633.png",
},
booking: {
  bg: "#003580",
  img: "https://cdn-icons-png.flaticon.com/512/2111/2111604.png",
},
  website: {
    bg: "#2563EB",
    img: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
  },
};


export default function PublicProfile() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [menuPage, setMenuPage] = useState(null);

useEffect(() => {
  let alive = true;

  async function loadData() {
    try {
      setLoading(true);

      // fetch brand public data
      const res = await api.get(`/brands/public/${slug}`);

      if (alive) {
        setData(res.data);
      }

      // track QR scan
     const a = await api.post(`/qr-code/scan/${slug}`);
     console.log("Scan tracked:", a.data);

    } catch (err) {

      if (alive) {
        setData(null);
      }

    } finally {

      if (alive) {
        setLoading(false);
      }

    }
  }

  if (slug) {
    loadData();
  }

  return () => {
    alive = false;
  };

}, [slug]);

  const enabledLinks = useMemo(() => {
    if (!data?.links) return [];
    return data.links.filter((l) => l.enabled !== false);
  }, [data]);

  if (loading) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </PhoneFrame>
    );
  }

  if (!data) {
    return (
      <PhoneFrame>
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div>
            <div className="text-lg font-semibold">Profile not found</div>
            <div className="text-sm text-gray-500 mt-1">
              Invalid QR / slug.
            </div>
          </div>
        </div>
      </PhoneFrame>
    );
  }

  const accent = data?.theme?.accentColor || "#B08D57";

  const suggestions =
    data?.reviewSuggestions?.length > 0
      ? data.reviewSuggestions
      : CATEGORY_SUGGESTIONS[data?.category || "cafe"];

  return (
    <PhoneFrame>
      <div className="min-h-screen bg-white relative">

        {/* MENU BUTTON */}
        <button
          onClick={() => setMenuOpen(true)}
          className="absolute left-4 top-4 text-xl cursor-pointer z-10 text-gray-700 bg-gray-100 p-2 rounded-lg"
        >
         <Menu />
        </button>

        {/* HEADER */}
        <div className="pt-10 pb-6 px-5">
          <div className="flex flex-col items-center text-center">

            <div className="w-16 h-16 rounded-2xl bg-[#f2eee8] flex items-center justify-center overflow-hidden">
              {data.logoUrl ? (
                <img
                  src= {import.meta.env.VITE_APP_BRAND_LOGO_URL + data.logoUrl}
                  alt={data.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="text-xl font-semibold"
                  style={{ color: accent }}
                >
                  ☕
                </div>
              )}
            </div>

            <div className="mt-6 text-3xl font-extrabold text-gray-900">
              {data.headline}{" "}
              <span style={{ color: accent }}>
                {data.name}
              </span>
            </div>

            <div className="mt-2 text-sm text-gray-500 max-w-[320px]">
              {data.tagline}
            </div>

          </div>
        </div>

        {/* GOOGLE REVIEW CARD */}
        <div className="px-4 cursor-pointer">
          <button
            onClick={() => setShowReviews(true)}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-4 shadow-sm flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
                  alt="Google"
                  className="w-8 h-8 object-contain"
                />
              </div>

              <div className="text-left cursor-pointer">
                <div className="font-semibold text-sm">
                  Write a Google Review
                </div>
                <div className="text-xs text-gray-500 cursor-pointer">
                  Help others discover us
                </div>
              </div>

            </div>

            <div className="text-gray-400 text-xl ">›</div>

          </button>
        </div>

        {/* CONNECT LINKS */}
        <div className="px-4 pb-10">

<div className="mt-5 bg-white/80 backdrop-blur border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="text-sm font-semibold text-center">
              Connect With Us
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">

              {enabledLinks.map((l, index) => {

                const key = l.label?.toLowerCase()?.replace(/\s+/g, "");
                const predefinedIcon = key && ICONS[key] ? ICONS[key] : null;

                const iconData = predefinedIcon
                  ? predefinedIcon
                  : {
                      bg: "#f3f4f6",
                      img: ICONS.google.img,
                    };

                return (
                  <IconTile
                    key={index}
                    icon={iconData}
                    label={l.label}
                    onClick={() => {
                      if (l.url) {
                        window.open(l.url, "_blank");
                      }
                    }}
                  />
                );
              })}

            </div>

          </div>

        </div>
        

        {/* REVIEW SUGGESTION MODAL */}
        {showReviews && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-2xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">

              <div className="text-center">
                <div className="text-lg font-bold">
                  Review Suggestions
                </div>
                <div className="text-sm text-gray-500 italic">
                  (Click to Copy & Paste in Review Box)
                </div>
              </div>

              <hr className="my-4" />

              {suggestions.map((text, index) => (
                <div key={index} className="mb-6">

                  <p className="text-sm text-gray-800 mb-3">
                    {text}
                  </p>

                   <button
      onClick={() => {
        navigator.clipboard.writeText(text);

        // show toast first
       toast("Review copied. Opening Google Review...");
        // redirect after delay
        setTimeout(() => {
          window.location.href =
            data?.googleReviewUrl || "https://google.com";
        }, 1500);
      }}
      className="bg-[#406374] text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
    >
      Copy to Clipboard
    </button>


                  <hr className="mt-6" />

                </div>
              ))}

              <div className="flex justify-between mt-6">

                <button
                  onClick={() => setShowReviews(false)}
                  className="bg-gray-300 px-4 py-2 rounded-lg text-sm cursor-pointer"
                >
                  Go Back
                </button>

                <button
                  onClick={() =>
                    window.location.href =
                      data?.googleReviewUrl || "https://google.com"
                  }
                  className="bg-[#406374] text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                >
                  Write Your Own
                </button>

              </div>

            </div>
          </div>
        )}

        {/* SIDE MENU */}

{/* SIDE MENU */}
{menuOpen && (
  <div className="fixed inset-0 z-50">

    {/* overlay */}
    <div
      className="absolute inset-0 bg-black/40 "
      onClick={() => setMenuOpen(false)}
    />

    {/* menu panel */}
    <div className="absolute right-0 top-0 h-full w-[80%] bg-white shadow-xl">

      {/* header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <div className="text-lg font-semibold">Menu</div>

        <button
          className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
          onClick={() => setMenuOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* menu items */}
      <div className="py-2 ">

        <button
          onClick={() => setMenuPage("about")}
          className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 cursor-pointer"
        >
          <Info className="text-blue-500 w-5 h-5" />
          <span className="text-gray-700">About Us</span>
        </button>

        <button
          onClick={() => setMenuPage("contact")}
          className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 cursor-pointer"
        >
          <Phone className="text-blue-500 w-5 h-5" />
          <span className="text-gray-700">Contact</span>
        </button>

        <button
          onClick={() => setMenuPage("privacy")}
          className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 cursor-pointer"
        >
          <Shield className="text-blue-500 w-5 h-5" />
          <span className="text-gray-700">Privacy Policy</span>
        </button>

        <button
          onClick={() => setMenuPage("terms")}
          className="flex items-center gap-4 w-full px-6 py-4 hover:bg-gray-50 cursor-pointer"
        >
          <FileText className="text-blue-500 w-5 h-5" />
          <span className="text-gray-700">Terms & Conditions</span>
        </button>

      </div>
    </div>
  </div>
)}

        {/* MENU CONTENT MODAL */}
        {menuPage && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white rounded-xl w-[90%] max-h-[80vh] overflow-y-auto p-5">

              <div className="flex justify-between mb-4">
                <div className="font-semibold capitalize">{menuPage}</div>
                <button className="cursor-pointer" onClick={() => setMenuPage(null)}>✕</button>
              </div>

              {menuPage === "about" && <p>{data?.aboutUs}</p>}

              {menuPage === "contact" && (
                <p>
                  Contact Number:{" "}
                  <a href={`tel:${data?.contactNumber}`}>
                    {data?.contactNumber}
                  </a>
                </p>
              )}

              {menuPage === "privacy" && (
                <p>{data?.privacyPolicy}</p>
              )}

              {menuPage === "terms" && (
                <p>{data?.termsConditions}</p>
              )}

            </div>
          </div>
        )}

      </div>
    </PhoneFrame>
  );
}






const CATEGORY_SUGGESTIONS = {
  cafe: [
    "Amazing coffee and cozy atmosphere. Highly recommend!",
    "Best place to relax and enjoy a great cup of coffee.",
    "Friendly staff and delicious snacks.",
    "Perfect spot for meetings and chill time."
  ],
  restaurant: [
    "Food was absolutely delicious and fresh.",
    "Great ambiance and excellent service.",
    "Loved the taste and presentation of dishes.",
    "Highly recommend for family dinners."
  ],
  gym: [
    "Well-maintained equipment and clean environment.",
    "Professional trainers and motivating atmosphere.",
    "Great place to achieve fitness goals.",
    "Affordable membership with top facilities."
  ],
  shop: [
    "Wide variety of products and reasonable prices.",
    "Excellent customer service and quick billing.",
    "Quality products and helpful staff.",
    "Best shopping experience in the area."
  ],
  hotel: [
    "Clean rooms and outstanding hospitality.",
    "Comfortable stay and great service.",
    "Highly recommend for business and family trips.",
    "Good value for money and friendly staff."
  ]
};