import { NavLink, Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { setAuthToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Tags, Users, ChartNoAxesCombined, CreditCard, Inbox, Star, Settings, Menu, LogOut, X, Bell, ChevronDown, ChevronRight, QrCode, ShieldCheck } from "lucide-react";

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, admin: true, end: true },
  { to: "/admin/brands", label: "Brands", icon: Tags },
  { to: "/admin/buyers", label: "Buyers & access", icon: ShieldCheck, admin: true },
  { to: "/admin/sellers", label: "Sellers", icon: Users, admin: true },
  { to: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined, admin: true },
  { to: "/admin/payments", label: "Payments", icon: CreditCard, admin: true },
  { to: "/admin/reviews", label: "AI Reviews", icon: Star, admin: true },
  { to: "/admin/contact-inbox", label: "Contact Inbox", icon: Inbox, admin: true },
];

export default function AdminLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const { user: authUser, logout: contextLogout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [popover, setPopover] = useState(null);
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const user = authUser || JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";
  const currentPage = location.pathname.startsWith("/admin/brands/") ? "Edit Brand" : location.pathname === "/admin/settings" ? "Settings" : navigation.find(item => item.to === location.pathname)?.label || "Workspace";

  useEffect(() => {
    function dismiss(event) {
      if (event.type === "keydown" && event.key === "Escape") {
        setPopover(null);
        setSidebarOpen(false);
        if (sidebarOpen) menuRef.current?.focus();
      }
      if (event.type === "pointerdown" && !headerRef.current?.contains(event.target)) setPopover(null);
    }
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", dismiss);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", dismiss);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector("button")?.focus();
    function trap(event) {
      if (event.key !== "Tab" || window.innerWidth >= 1024) return;
      const items = sidebarRef.current.querySelectorAll("a, button");
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", trap);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", trap); };
  }, [sidebarOpen]);

  function logout() {
    setAuthToken(null);
    contextLogout();
    nav("/admin/login", { replace: true });
  }
  const closeMenus = () => { setPopover(null); setSidebarOpen(false); };
  return (
    <div className="admin-shell min-h-screen lg:flex">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:z-[60] focus:bg-white focus:p-4">Skip to content</a>
      {sidebarOpen && <button tabIndex={-1} aria-label="Close navigation" onClick={() => { setSidebarOpen(false); menuRef.current?.focus(); }} className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden" />}
      <aside ref={sidebarRef} id="admin-navigation" aria-label="Main navigation" className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col p-5 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 ${sidebarOpen ? "visible" : "invisible lg:visible"}`}>
        <div className="flex items-center gap-3 px-2 pt-3 pb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"><QrCode size={23} /></div>
          <div><p className="text-lg font-semibold tracking-tight text-white">Sparrownix<span className="text-blue-300">.</span></p><p className="text-[9px] uppercase tracking-[.23em] text-slate-400">Management suite</p></div>
          <button aria-label="Close navigation" onClick={() => { setSidebarOpen(false); menuRef.current?.focus(); }} className="ml-auto lg:hidden"><X size={20} /></button>
        </div>
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Workspace</p>
        <nav className="space-y-1">
          {navigation.filter(item => item.admin ? isAdmin : isAdmin || ["SELLER", "BUYER"].includes(user?.role)).map(item => { const { to, label, icon: Icon, end } = item; return <NavLink key={to} to={to} end={end} onClick={closeMenus} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}><Icon size={19} /><span>{label}</span></NavLink>; })}
        </nav>
        {user?.role !== "BUYER" && <div className="mt-8 border-t border-white/10 pt-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Account</p>
          <NavLink to="/admin/settings" onClick={closeMenus} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}><Settings size={19} />Settings</NavLink>
        </div>}
        <div className="mt-auto pt-2">
          {/* <div className="rounded-xl border border-white/10 bg-white/[.03] p-4"><ShieldCheck size={20} className="mb-2 text-blue-200" /><p className="text-xs font-medium text-slate-200">Your workspace, connected.</p><p className="mt-1 text-xs leading-relaxed text-slate-400">Manage your brands and customer connections in one place.</p></div> */}
          <button onClick={logout} className="admin-nav-link w-full"><LogOut size={18} />Sign out</button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header ref={headerRef} className="sticky top-0 z-30 flex h-[50px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button ref={menuRef} onClick={() => setSidebarOpen(true)} aria-label="Open navigation" aria-controls="admin-navigation" aria-expanded={sidebarOpen} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Menu size={21} /></button>
            <span className="hidden text-slate-400 sm:inline">Workspace</span><ChevronRight size={14} className="hidden text-slate-300 sm:block" /><span className="truncate text-sm font-medium">{currentPage}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
           
            <div className="relative border-l border-slate-200 pl-3 sm:pl-5">
              <button aria-label="Account options" aria-expanded={popover === "profile"} onClick={() => setPopover(popover === "profile" ? null : "profile")} className="flex items-center gap-3 rounded-lg p-1 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-semibold text-blue-800">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                <span className="hidden sm:block"><span className="block max-w-36 truncate text-xs font-semibold text-slate-800">{user?.name || "User"}</span><span className="block text-[10px] capitalize text-slate-500">{user?.role?.toLowerCase() || "Account"}</span></span><ChevronDown size={14} className="text-slate-400" />
              </button>
              {popover === "profile" && <div className="header-popover animate-fade-in"><div className="border-b border-slate-100 p-3"><p className="font-semibold">{user?.name || "User"}</p><p className="break-all text-xs text-slate-500">{user?.email}</p></div>{user?.role !== "BUYER" && <Link to="/admin/settings" onClick={closeMenus}><Settings size={16} />Profile & settings</Link>}<button onClick={logout}><LogOut size={16} />Sign out</button></div>}
            </div>
          </div>
        </header>
        <main id="admin-main" tabIndex={-1} className="admin-content pb-10"><Outlet /></main>
      </div>
    </div>
  );
}
