import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAuthToken } from "../api/client";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

async function onSubmit(e) {
  e.preventDefault();
  setErr("");

  try {
    const res = await api.post("/auth/login", { email, password });

    const token = res.data.data.token;
    const user = res.data.data.user;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setAuthToken(token);

    toast.success("Logged in Successfully!");
    if (user.role === "ADMIN") {
      nav("/admin");
    } else {
      nav("/admin/brands");
    }

  } catch (err) {
    setErr("Invalid login");
    console.log("Error:", err);
    toast.error(err.response?.data?.message || "Login failed");
  }
}
  return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-6">
        <div className="text-xl font-bold">Admin Login</div>
        <div className="text-sm text-gray-500 mt-1">Manage QR profiles</div>

        <div className="mt-5">
          <label className="text-xs text-gray-600">Email</label>
          <input className="w-full border rounded-xl px-3 py-2 mt-1"
          placeholder="demo@gmail.com"  value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mt-3">
          <label className="text-xs text-gray-600">Password</label>
          <input type="password" className="w-full border rounded-xl px-3 py-2 mt-1"
            placeholder="******"  value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {err && <div className="text-sm text-red-600 mt-3">{err}</div>}

        <button className="w-full mt-5 bg-black text-white rounded-xl py-2 font-semibold">
          Login
        </button>
      </form>
    </div>
  );
}