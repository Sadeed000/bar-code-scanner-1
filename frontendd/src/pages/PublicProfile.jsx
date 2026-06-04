import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PhoneFrame from "../component/PhoneFrame";
import IconTile from "../component/IconTile";
import ContactDialog from "../component/ContactDialog";
import { api } from "../api/client";
import { Info, Phone, Shield, FileText, Menu, Hamburger } from "lucide-react";
import { ArrowLeft, Gem, Star, Copy, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";


import agoda from "../assets/icons/agoda.png";
import airbnb from "../assets/icons/airbnb.png";
import amazon from "../assets/icons/amazon.png";
import booking from "../assets/icons/booking.png";
import contact from "../assets/icons/contact.png";
import fb from "../assets/icons/fb.png";
import flipcart from "../assets/icons/flipcart.png";
import gallery from "../assets/icons/gallery.png";
import gmail from "../assets/icons/gmail.png";
import goibibo from "../assets/icons/goibibo.png";
import insta from "../assets/icons/insta.png";
import linkedin from "../assets/icons/linkedin.png";
import location from "../assets/icons/location.png";
import myntra from "../assets/icons/myntra.png";
import makemytrip from "../assets/icons/mytrip.png";
import net from "../assets/icons/net.png";
import oyo from "../assets/icons/oyo.png";
import petpooja from "../assets/icons/petpooja.png";
import call from "../assets/icons/call_us.png";
import swiggy from "../assets/icons/swiggy.png";
import tripadvisor from "../assets/icons/tripadvisor.png";
import wp from "../assets/icons/wp.png";
import youtube from "../assets/icons/youtube.png";
import zomoto from "../assets/icons/zomoto.png";
import menu from "../assets/icons/menu.png";
import google from "../assets/icons/google.png";
import jewellery_catalogue from '../assets/icons/jewellery_catalogue.jpeg'
import jewellery_group from '../assets/icons/jewellery_group.jpeg'

const ICONS = {

  instagram: {
    bg: "linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)",
    img: insta,
  },

  facebook: {
    bg: "linear-gradient(135deg,#1877F2,#3b82f6)",
    img: fb,
  },


  whatsapp: {
    bg: "linear-gradient(135deg,#25D366,#16a34a)",
    img: wp,
  },

  booking: {
    bg: "linear-gradient(135deg,#003580,#1e3a8a)",
    img: booking,
  },

  zomato: {
    bg: "linear-gradient(135deg,#ef4444,#dc2626)",
    img: zomoto,
  },

  google: {
    bg: "linear-gradient(135deg,#4285F4,#34A853,#FBBC05,#EA4335)",
    img: google,
  },

  tripadvisor: {
    bg: "linear-gradient(135deg,#34E0A1,#10b981)",
    img: tripadvisor,
  },

  youtube: {
    bg: "linear-gradient(135deg,#ff0000,#dc2626)",
    img: youtube,
  },

  gallery: {
    bg: "",
    img: gallery,
  },

  petpooja: {
    bg: "",
    img: petpooja,
  },

  menu: {
    bg: "",
    img: menu,
  },

    jewellery_group: {
    bg: "",
    img: jewellery_group,
  },


    jewellery_catalogue: {
    bg: "",
    img: jewellery_catalogue,
  },


  myntra: {
    bg: "linear-gradient(135deg,#ff3f6c,#f093fb)",
    img: myntra,
  },

  makemytrip: {
    bg: "linear-gradient(135deg,#ff6b35,#f7931e)",
    img: makemytrip,
  },

  airbnb: {
    bg: "linear-gradient(135deg,#ff5a5f,#c4112a)",
    img: airbnb,
  },

  
  gmail: {
    bg: "linear-gradient(135deg,#ff5a5f,#c4112a)",
    img: gmail,
  },
  agoda: {
    bg: "linear-gradient(135deg,#e11d48,#be123c)",
    img: agoda,
  },

  amazon: {
    bg: "linear-gradient(135deg,#ff9900,#f59e0b)",
    img: amazon,
  },

  flipkart: {
    bg: "linear-gradient(135deg,#2874f0,#1d4ed8)",
    img: flipcart,
  },

  goibibo: {
    bg: "linear-gradient(135deg,#ee2e24,#b91c1c)",
    img: goibibo,
  },

  linkedin: {
    bg: "linear-gradient(135deg,#0077b5,#2563eb)",
    img: linkedin,
  },

  swiggy: {
    bg: "linear-gradient(135deg,#fc8019,#ea580c)",
    img: swiggy,
  },

  oyo: {
    bg: "linear-gradient(135deg,#ef4444,#991b1b)",
    img: oyo,
  },

  contact: {
    bg: "linear-gradient(135deg,#06b6d4,#0891b2)",
    img: contact,
  },

  location: {
    bg: "linear-gradient(135deg,#22c55e,#15803d)",
    img: location,
  },

  call: {
    bg: "linear-gradient(135deg,#10b981,#047857)",
    img: call,
  },

  website: {
    bg: "linear-gradient(135deg,#6366f1,#4338ca)",
    img: net,
  },

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
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [currentReviewUrl, setCurrentReviewUrl] = useState(null);
  // Smooth transition handlers
  const openReviewModal = async (reviewUrl = null) => { 
    setCurrentReviewUrl(reviewUrl);    // Start animation immediately
    setIsModalAnimating(true);
    setIsReviewsLoading(true);
    
    // Show modal with slight delay to trigger animation
    setTimeout(() => setShowReviews(true), 50);

    try {
      const res = await api.get(
        `/reviews/category/${data.category}`
      );

      setVisibleReviews(res.data);

    } catch (err) {
      console.log(err);
    } finally {
      setIsReviewsLoading(false);
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
          <div className="text-sm text-gray-500 mt-2 animate-[fadeUp_1.2s_ease]">
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
        <div className="pt-10 px-5">
          <div className="flex flex-col items-center text-center">

            <div className="w-28 h-27 flex items-center justify-center overflow-hidden">
              {data.logoUrl ? (
                <img
                  src={import.meta.env.VITE_APP_BRAND_LOGO_URL + data.logoUrl}
                  alt={data.name}
                  className="w-full h-full object-cover rounded-2xl"
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

            <div className="text-3xl font-extrabold text-gray-900">
              {data.headline}{" "}
              <span style={{ color: accent }}>
                {data.name}
              </span>
            </div>

            <div className="mt-1 text-sm text-gray-500 max-w-[320px]">
              {data.tagline}
            </div>

          </div>
        </div>
        {/* GOOGLE REVIEW CARD */}
        <div className="px-4 mt-4">
          <button
            onClick={() => openReviewModal(data?.googleReviewUrl)}
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

        // Normalize label to support variants like "jewellery group", "jewellery_group", "jewellerygroup"
        const rawKey = l.label?.toLowerCase() || "";
        const keyNoSpaces = rawKey.replace(/[\s-]+/g, "");
        const keyUnderscore = rawKey.replace(/[\s-]+/g, "_");
        const keyAlnum = rawKey.replace(/[^\w]+/g, "");

        // Skip special platforms that we handle separately
        const specialPlatforms = ["booking", "makemytrip", "airbnb"];
        if (specialPlatforms.includes(rawKey)) {
          return null;
        }

        const predefinedIcon = ICONS[keyNoSpaces] || ICONS[keyUnderscore] || ICONS[keyAlnum] || ICONS[rawKey] || null;

        const formattedLabel = l.label
          ? String(l.label)
              .replace(/[_-]+/g, " ")
              .replace(/\s+/g, " ")
              .trim()
          : "";

        let iconData;

        if (l.icon) {
          // Backend icon → show inside colored tile
          iconData = {
            img: l.icon,
            bg: "transparent",
          };
        } else if (predefinedIcon) {
          // Predefined icons
          iconData = predefinedIcon;
        } else {
          // fallback
          iconData = {
            img: ICONS?.google.img,
            bg: "#f3f4f6",
          };
        }

        return (
          <IconTile
            key={index}
            icon={iconData}
            label={formattedLabel}
            onClick={() => {
              if (l.url) {
                window.open(l.url, "_blank");
              }
            }}
          />
        );
      })}

      {/* {data?.gallery?.length > 0 && (
        <IconTile
          icon={{
            img: gallery,
            bg: "#f3f4f6",
          }}
          label="Gallery"
          onClick={() => setShowGallery(true)}
        />
      )} */}

{console.log(enabledLinks)}
      {enabledLinks.some(l => l.label?.toLowerCase() === "booking") && (
        <IconTile
          icon={ICONS.booking}
          label="booking"
          onClick={() => {
            const bookingLink = enabledLinks.find(l => l.label?.toLowerCase() === "booking" && l.url);
            if (bookingLink?.url) {
              window.open(bookingLink.url, "_blank");
            } else {
              toast.error("Booking URL not configured");
            }
          }}
        />
      )}

      {enabledLinks.some(l => l.label?.toLowerCase() === "makemytrip") && (
        <IconTile
          icon={ICONS.makemytrip}
          label="MakeMyTrip"
          onClick={() => {
            const tripLink = enabledLinks.find(l => l.label?.toLowerCase() === "makemytrip" && l.url);
            if (tripLink?.url) {
              window.open(tripLink.url, "_blank");
            } else {
              toast.error("MakeMyTrip URL not configured");
            }
          }}
        />
      )}

      {enabledLinks.some(l => l.label?.toLowerCase() === "airbnb") && (
        <IconTile
          icon={ICONS.airbnb}
          label="Airbnb"
          onClick={() => {
            const airbnbLink = enabledLinks.find(l => l.label?.toLowerCase() === "airbnb" && l.url);
            if (airbnbLink?.url) {
              window.open(airbnbLink.url, "_blank");
            } else {
              toast.error("Airbnb URL not configured");
            }
          }}
        />
      )}

      {(data?.ownerPhone || data?.contactNumber) && (
        <IconTile
          icon={ICONS.contact}
          label="Contact"
          onClick={() => setShowContactDialog(true)}
        />
      )}

    </div>

  </div>

</div>

{/* PAT POOJA CARD */}
{data?.patPoojaUrl && (
  <div className="px-4 pb-6">
    <button
      onClick={() => window.open(data.patPoojaUrl, "_blank")}
      className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
    >
      <div className="flex items-center gap-4">

        {/* PAT POOJA ICON */}
        <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
          <img
  src={petpooja}
  alt="PetPooja"
  className="w-6 h-6 object-contain"
/>
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

{/* POWERED BY FOOTER */}
<div className="px-4 pb-6">
    <p className="text-xs text-gray-600 text-center">
      Powered by <span className="font-semibold text-gray-800">Sparrownix</span>
    </p>
</div>
        {/* REVIEW SUGGESTION MODAL */}
        {(showReviews || isModalAnimating) && (
          <div className={`fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-40 transition-all duration-300 ease-in-out ${showReviews ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white w-full sm:w-[95%] sm:max-w-[420px] max-h-[85vh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all duration-300 ease-out flex flex-col ${showReviews ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>

              {/* FIXED HEADER */}
              <div className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-100 px-4 sm:px-6 py-5 sm:py-6 flex items-center justify-center rounded-t-3xl flex-shrink-0 sticky top-0 z-10">

                {/* BACK BUTTON - Left */}
                <button
                  onClick={closeReviewModal}
                  className="absolute left-4 sm:left-6 w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0"
                >
                  <ArrowLeft size={18} className="text-gray-700" />
                </button>

                {/* CENTER TITLE */}
                <div className="flex flex-col items-center gap-2">
                  {/* <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gray-900 flex items-center justify-center shadow-sm flex-shrink-0">
                    <Gem size={20} className="text-white" />
                  </div> */}
                  <h2 className="text-sm sm:text-base font-bold text-gray-900 text-center">
                    Choose a Review & Share
                  </h2>
                </div>

                {/* RIGHT SPACE (to balance back button) */}
                <div className="absolute right-4 sm:right-6 w-9 sm:w-10 flex-shrink-0"></div>

              </div>

              {/* SCROLLABLE REVIEWS AREA */}
              <div className="flex-1 overflow-y-auto px-3 sm:px-4 pt-6 sm:pt-8 pb-32 sm:pb-5 space-y-3 sm:space-y-4 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30">
                
                {/* REVIEWS LIST */}
                {visibleReviews?.reviews?.map((text, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition flex-shrink-0"
                    style={{
                      animation: `fadeIn 0.4s ease-out forwards`,
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >

                    {/* STARS */}
                    <div className="flex gap-1 mb-3 sm:mb-4 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="#facc15" stroke="#facc15" />
                      ))}
                    </div>

                    {/* REVIEW TEXT */}
                    <p className="text-base sm:text-sm text-gray-800 leading-relaxed sm:leading-relaxed break-words mb-4 sm:mb-5 font-medium whitespace-normal">
                      "{text}"
                    </p>

                    {/* FOOTER - Character count LEFT, Copy button RIGHT */}
                    <div className="flex items-center justify-between gap-2">

                      <span className="text-xs text-gray-500">
                        {text.length} characters
                      </span>

                      <button
                        onClick={() => {
                          if (!currentReviewUrl) {
                            toast.error("Review URL not configured");
                            return;
                          }
                          navigator.clipboard.writeText(text);
                          toast("Review copied. Opening platform...");
                          setTimeout(() => {
                            window.location.href = currentReviewUrl;
                          }, 1500);
                        }}
                        className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-gray-900 transition flex items-center gap-2 flex-shrink-0"
                      >
                        <Copy size={16} />
                        Copy Review
                      </button>

                    </div>

                  </div>
                ))}

              </div>

              {/* FIXED FOOTER BUTTON */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-5 rounded-b-3xl flex-shrink-0 shadow-lg">
                    
                <button
                  onClick={() => {
                    if (!currentReviewUrl) {
                      toast.error("Review URL not configured");
                      return;
                    }
                    window.location.href = currentReviewUrl;
                  }}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold transition flex items-center justify-center gap-2 shadow-md"
                >
                  <ExternalLink size={18} />
                  Open Platform
                </button>

              </div>

            </div>

          </div>
        )}

        {showReviews}
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

      {/* CONTACT DIALOG */}
      <ContactDialog 
        data={data}
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        accent={accent}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </PhoneFrame>
  );
}




