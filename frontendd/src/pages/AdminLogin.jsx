import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");


async function onSubmit(e) {
  e.preventDefault();
  setErr("");

  try {
    const res = await api.post("/auth/login", { email, password });

    const token = res?.data?.data?.token;
    const user = res?.data?.data?.user;

    console.log("Login Response:", res.data);

    if (!token || !user) {
      throw new Error("Invalid response from server");
    }

    // Set axios auth header immediately
    setAuthToken(token);

    // Use auth context to login - this updates state and localStorage
    login(token, user);

    toast.success("Logged in Successfully!");

    // Redirect based on role - immediate redirect with no delay
    if (user?.role?.toUpperCase() === "ADMIN") {
      nav("/admin", { replace: true });
    } else {
      nav("/admin/brands", { replace: true });
    }

  } catch (err) {
    console.log("Login Error:", err);

    setErr("Invalid login");
    toast.error(err?.response?.data?.message ||
      (!err.response ? "Cannot reach the server. Check your connection and try again." : "Login failed"));
  }
}
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold gradient-text mb-2">Sparrownix</div>
          <p className="text-gray-400">Admin Dashboard</p>
        </div>

        {/* Login Card */}
        <form onSubmit={onSubmit} className="card-elevated">
          <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials to access the admin panel</p>

          {/* Email Field */}
          <div className="mb-6">
            <label className="label label-required">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label className="label label-required">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm font-medium">{err}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full py-3 font-semibold text-lg mb-4"
          >
            Sign In
          </button>

          {/* Footer */}
          <div className="text-center text-gray-400 text-sm">
            <p>Demo credentials available on request</p>
          </div>
        </form>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl">
          <p className="text-gray-400 text-xs">
            🔐 This is a secure admin panel. Never share your credentials with anyone.
          </p>
        </div>
      </div>
    </div>
  );
}
