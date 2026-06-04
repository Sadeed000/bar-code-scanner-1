import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { setAuthToken } from "../api/client";
import {
  LayoutDashboard,
  Tags,
  Users,
  BarChart2,
  CreditCard,
  Inbox,
  Star,
  Settings,
  Menu,
  LogOut,
} from "lucide-react";

export default function AdminLayout() {
  const nav = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
    nav("/admin/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-900">
      {/* mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-gray-800">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-300 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-xl font-bold text-white">QR Admin</div>
        <button
          onClick={logout}
          className="text-gray-300 border border-gray-600 p-1 rounded-full hover:text-white hover:border-gray-500 cursor-pointer flex items-center justify-center"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* SIDEBAR */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto flex flex-col transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform md:translate-x-0 md:relative md:inset-auto md:h-auto`}
      >
        
   <div>
<div className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent tracking-wide">
  Sparrownix
</div>
<nav className="space-y-2">

  {/* Only ADMIN */}
  {user?.role === "ADMIN" && (
    <>
      <NavLink
        to="/admin"
        end
        className={({ isActive }) =>
          `block w-full text-left px-4 py-3 rounded-lg transition ${
            isActive
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`
        }
      >
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </div>
      </NavLink>

        {/* Visible for all roles */}
  <NavLink
    to="/admin/brands"
    className={({ isActive }) =>
      `block w-full text-left px-4 py-3 rounded-lg transition ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:bg-gray-700"
      }`
    }
  >
    <div className="flex items-center gap-2">
      <Tags className="w-4 h-4" />
      <span>Brands</span>
    </div>
  </NavLink>

       <NavLink
        to="/admin/sellers"
        className={({ isActive }) =>
          `block w-full text-left px-4 py-3 rounded-lg transition ${
            isActive
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`
        }
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>Seller Register</span>
        </div>
      </NavLink>

      <NavLink
        to="/admin/analytics"
        className={({ isActive }) =>
          `block w-full text-left px-4 py-3 rounded-lg transition ${
            isActive
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`
        }
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" />
          <span>Analytics</span>
        </div>
      </NavLink>

      <NavLink
        to="/admin/payments"
        className={({ isActive }) =>
          `block w-full text-left px-4 py-3 rounded-lg transition ${
            isActive
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`
        }
      >
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span>Payments</span>
        </div>
      </NavLink>
        <NavLink
  to="/admin/reviews"
  className={({ isActive }) =>
    `block w-full text-left px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-gray-700 text-white"
        : "text-gray-300 hover:bg-gray-700"
    }`
  }
>
  <div className="flex items-center gap-2">
    <Star className="w-4 h-4" />
    <span>AI Reviews</span>
  </div>
</NavLink>



      <NavLink
        to="/admin/contact-inbox"
        className={({ isActive }) =>
          `block w-full text-left px-4 py-3 rounded-lg transition ${
            isActive
              ? "bg-gray-700 text-white"
              : "text-gray-300 hover:bg-gray-700"
          }`
        }
      >
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4" />
          <span>Contact Inbox</span>
        </div>
      </NavLink>

     
    </>
  )}


  <NavLink
    to="/admin/settings"
    className={({ isActive }) =>
      `block w-full text-left px-4 py-3 rounded-lg transition ${
        isActive
          ? "bg-gray-700 text-white"
          : "text-gray-300 hover:bg-gray-700"
      }`
    }
  >
    <div className="flex items-center gap-2">
      <Settings className="w-4 h-4" />
      <span>Settings</span>
    </div>
  </NavLink>

</nav>
</div>
        {/* BOTTOM SECTION */}
        <div className="mt-auto pt-6 border-t border-gray-700">

          {/* USER INFO */}
          <div className="mb-4 p-3 rounded-lg bg-gray-700">
            <p className="text-sm text-white font-medium">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-300">
              {user?.role || "Role"}
            </p>
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="w-full border border-gray-600 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ">
        <Outlet />
      </div>

      {/* overlay when mobile sidebar open */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}
    </div>
  );
}