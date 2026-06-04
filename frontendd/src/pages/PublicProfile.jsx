import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PhoneFrame from "../component/PhoneFrame";
import IconTile from "../component/IconTile";
import { api } from "../api/client";
   import { Info, Phone, Shield, FileText,Menu, Hamburger } from "lucide-react";
   import { ArrowLeft, Gem, Star, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import {CATEGORY_SUGGESTIONS }from "../utils/review-suggestion";
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
google_review: {
  bg: "#ffffff",
  img:'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'
}
};


export default function PublicProfile() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isMenuAnimating, setIsMenuAnimating] = useState(false);
  const [menuPage, setMenuPage] = useState(null);
const [currentImage, setCurrentImage] = useState(0);

const [skip, setSkip] = useState(0);

  const [visibleReviews, setVisibleReviews] = useState([]);
const [showGallery, setShowGallery] = useState(false);
  // Smooth transition handlers
const openReviewModal = async () => {

  try {

    const res = await api.get(
      `/reviews/category/${data.category}?skip=${skip}`
    );

    setVisibleReviews(res.data);

    setSkip(prev => prev + 10);

    setIsModalAnimating(true);
    setTimeout(() => setShowReviews(true), 10);

  } catch (err) {
    console.log(err);
  }

};
  const closeReviewModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => setShowReviews(false), 300);
  };

  const openMenu = () => {
    setIsMenuAnimating(true);
    setTimeout(() => setMenuOpen(true), 10);
  };

  const closeMenu = () => {
    setIsMenuAnimating(false);
    setTimeout(() => setMenuOpen(false), 300);
  };

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
    setTimeout(() => {
      setLoading(false);
      setShowSplash(false);
    }, 1800); // splash delay

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
if (loading || showSplash) {
  return (
    <PhoneFrame>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100">

        {/* LOGO */}
        <div className="w-26 h-26 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden animate-[fadeIn_0.8s_ease]">

          {data?.logoUrl ? (
            <img
              src={import.meta.env.VITE_APP_BRAND_LOGO_URL + data.logoUrl}
              alt="logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-3xl">☕</div>
          )}

        </div>

        {/* BRAND NAME */}
        <div className="mt-6 text-xl font-semibold text-gray-800 animate-[fadeUp_1s_ease]">
          {data?.name || "Loading"}
        </div>

        {/* TAGLINE */}
        <div className="text-sm text-gray-500 mt-1 animate-[fadeUp_1.2s_ease]">
          {data?.tagline || "Welcome"}
        </div>

        {/* PROGRESS BAR */}
        <div className="w-40 h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-black animate-[loader_1.5s_linear_infinite]"></div>
        </div>

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



function getRandomReviews(list, previous = [], count = 10) {
  if (!list || list.length === 0) return [];

  // remove reviews that were shown previously
  let available = list.filter((r) => !previous.includes(r));

  // if remaining reviews are less than required, reset pool
  if (available.length < count) {
    available = list;
  }
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
  return (
    <PhoneFrame>
<div className="min-h-screen bg-white relative overflow-hidden">
{data?.watermarkUrl && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
    <img
      src={import.meta.env.VITE_APP_BRAND_LOGO_URL + data.watermarkUrl}
      alt="watermark"
      className="w-[280px] md:w-[300px] opacity-[0.04] object-contain"
    />
  </div>
)}
        {/* MENU BUTTON */}
   <button
  onClick={openMenu}
  className="absolute right-4 top-4 text-xl cursor-pointer z-10 text-gray-700 bg-gray-100 p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
>
  <Menu />
</button>

        {/* HEADER */}
        <div className="pt-10 pb-6 px-5">
          <div className="flex flex-col items-center text-center">

            <div className="w-18 h-18 rounded-2xl bg-[#f2eee8] flex items-center justify-center overflow-hidden">
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
<div className="px-4 mt-4">
  <button
    onClick={openReviewModal}
    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
  >
    <div className="flex items-center gap-4">

      {/* GOOGLE ICON */}
      <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
          alt="Google"
          className="w-7 h-7 object-contain"
        />
      </div>

      {/* TEXT */}
      <div className="text-left">
        <p className="text-sm font-semibold text-gray-800">
          Write a Google Review
        </p>
        <p className="text-xs text-gray-500">
          Help others discover us
        </p>
      </div>

    </div>

    {/* ARROW */}
    <div className="text-gray-400 text-2xl leading-none">
      ›
    </div>

  </button>
</div>


        {/* CONNECT LINKS */}
        <div className="px-4 pb-10">

<div className="mt-5 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="text-sm font-semibold text-center">
              Connect With Us
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">

              {enabledLinks.map((l, index) => {

     const key = l.label?.toLowerCase()?.replace(/\s+/g, "");
const predefinedIcon = key && ICONS[key] ? ICONS[key] : null;

let iconData;

if (l.icon) {
  // Backend icon → show inside white circle
  iconData = {
    img: l.icon,
    bg: "#ffffff",
  };
} else if (predefinedIcon) {
  // Predefined icons
  iconData = predefinedIcon;
} else {
  // fallback
  iconData = {
    img: ICONS.google.img,
    bg: "#f3f4f6",
  };
}

                return (
                  <>
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

                  </>
                
                  
                );
              })}
              <IconTile
  icon={ICONS.google_review}
  label="Review"
  
  onClick={openReviewModal}
/>
{data?.gallery?.length > 0 && (
  <IconTile
    icon={{
      img: "https://cdn-icons-png.flaticon.com/512/2659/2659360.png",
      bg: "#f3f4f6",
    }}
    label="Gallery"
    onClick={() => setShowGallery(true)}
  />
)}

            </div>

          </div>

        </div>
        
        {/* PAT POOJA CARD */}
{data?.patPoojaUrl && (
<div className="px-4 ">
  <button
    onClick={() => window.open(data.patPoojaUrl, "_blank")}
    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
  >
    <div className="flex items-center gap-4">

      {/* PAT POOJA ICON */}
      <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
        <span className="text-lg">    <Hamburger />
</span>
      </div>

      {/* TEXT */}
      <div className="text-left">
        <p className="text-sm font-semibold text-gray-800">
          Pat Pooja
        </p>
        <p className="text-xs text-gray-500">
          Blessings and offerings
        </p>
      </div>

    </div>

    {/* ARROW */}
    <div className="text-gray-400 text-2xl leading-none">
      ›
    </div>

  </button>
</div>
)}


        {/* REVIEW SUGGESTION MODAL */}
{(showReviews || isModalAnimating) && (
<div className={`absolute inset-0 bg-black/50 flex items-center justify-center z-40 transition-all duration-300 ease-in-out ${showReviews ? 'opacity-100' : 'opacity-0'}`}>
<div className={`bg-[#f7f8fa] w-full max-w-[420px] h-full max-h-[90%] rounded-3xl overflow-y-auto shadow-xl transform transition-all duration-300 ease-out ${showReviews ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
 {/* HEADER */}
<div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-6 flex items-center justify-between rounded-t-3xl relative">

  {/* BACK BUTTON */}
  <button
    onClick={closeReviewModal}
    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
  >
    <ArrowLeft size={18} className="text-gray-700" />
  </button>

  {/* CENTER TITLE */}
  <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">

    <div className="w-11 h-11 rounded-xl bg-[#0f172a] flex items-center justify-center shadow-md">
      <Gem size={18} className="text-white" />
    </div>

    <h2 className="text-sm font-semibold text-gray-800 whitespace-nowrap">
      Choose a Review & Share
    </h2>

  </div>

  {/* RIGHT SPACE (to balance back button) */}
  <div className="w-10"></div>

</div>

      {/* REVIEWS */}
      <div className="px-4 py-5 space-y-4">

        {visibleReviews.map((text, index) => (


          <div
            key={index}
            className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm"
          >

            {/* STARS */}
            <div className="flex gap-1 mb-3 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#facc15" stroke="#facc15" />
              ))}
            </div>

            {/* REVIEW TEXT */}
            <p className="text-sm text-gray-800 leading-relaxed">
              {text}
            </p>

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-4">

              <span className="text-xs text-gray-500">
                {text.length} characters
              </span>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(text);
                  toast("Review copied. Opening Google Review...");
                  setTimeout(() => {
                    window.location.href =
                      data?.googleReviewUrl || "https://google.com";
                  }, 1500);
                }}
                className="bg-[#1a2332] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0f1620] flex items-center gap-2"
              >
                <Copy size={16} />
                Copy Review
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* FOOTER BUTTON */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-4 rounded-b-3xl">

        <button
          onClick={() =>
            window.location.href =
              data?.googleReviewUrl || "https://google.com"
          }
          className="w-full bg-[#1a2332] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#0f1620] flex items-center justify-center gap-2"
        >
          <ExternalLink size={18} />
          Open Google Review Page
        </button>

      </div>

    </div>

  </div>
)}

{showReviews }
        {/* SIDE MENU */}

{/* SIDE MENU */}
{(menuOpen || isMenuAnimating) && (
  <div className="fixed inset-0 z-50">

    {/* overlay */}
    <div
      className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-in-out ${menuOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={closeMenu}
    />

    {/* menu panel */}
    <div className={`absolute right-0 top-0 h-full w-[80%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

      {/* header */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <div className="text-lg font-semibold">Menu</div>

        <button
          className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer transition-colors duration-200"
          onClick={closeMenu}
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


{/* GALLERY MODAL */}
{/* MODERN GALLERY MODAL */}
{showGallery && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

    <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-6 relative">

      {/* CLOSE */}
      <button
        onClick={() => setShowGallery(false)}
        className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-black"
      >
        ✕
      </button>

      <h3 className="text-lg font-semibold text-center mb-4">
        Gallery
      </h3>

      {/* MAIN IMAGE */}
      <div className="flex items-center justify-center mb-5">
        <img
          src={import.meta.env.VITE_APP_BRAND_LOGO_URL + data.gallery[currentImage]}
          alt="gallery"
          className="max-h-[420px] object-contain rounded-xl"
        />
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 overflow-x-auto justify-center">

        {data.gallery.map((img, index) => (
          <img
            key={index}
            src={import.meta.env.VITE_APP_BRAND_LOGO_URL + img}
            alt="thumb"
            onClick={() => setCurrentImage(index)}
            className={`w-20 h-20 object-cover rounded-lg cursor-pointer border transition 
              ${currentImage === index ? "border-black" : "border-gray-200"}`}
          />
        ))}

      </div>

      {/* NAV BUTTONS */}
      <button
        onClick={() =>
          setCurrentImage((prev) =>
            prev === 0 ? data.gallery.length - 1 : prev - 1
          )
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
      >
        ‹
      </button>

      <button
        onClick={() =>
          setCurrentImage((prev) =>
            prev === data.gallery.length - 1 ? 0 : prev + 1
          )
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10 flex items-center justify-center"
      >
        ›
      </button>

    </div>
  </div>
)}
    </PhoneFrame>
  );
}






// const CATEGORY_SUGGESTIONS = {
//   cafe: [
//     "Amazing coffee and cozy atmosphere. Highly recommend!",
//     "Best place to relax and enjoy a great cup of coffee.",
//     "Friendly staff and delicious snacks.",
//     "Perfect spot for meetings and chill time."
//   ],
//   restaurant: [
//     "Food was absolutely delicious and fresh.",
//     "Great ambiance and excellent service.",
//     "Loved the taste and presentation of dishes.",
//     "Highly recommend for family dinners."
//   ],
//   gym: [
//     "Well-maintained equipment and clean environment.",
//     "Professional trainers and motivating atmosphere.",
//     "Great place to achieve fitness goals.",
//     "Affordable membership with top facilities."
//   ],
//   shop: [
//     "Wide variety of products and reasonable prices.",
//     "Excellent customer service and quick billing.",
//     "Quality products and helpful staff.",
//     "Best shopping experience in the area."
//   ],
//   hotel: [
//     "Clean rooms and outstanding hospitality.",
//     "Comfortable stay and great service.",
//     "Highly recommend for business and family trips.",
//     "Good value for money and friendly staff."
//   ]
// };