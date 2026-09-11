import { QrCode, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);


async function onSubmit(e) {
  e.preventDefault();
  setErr("");
  setSubmitting(true);

  try {
    const res = await api.post("/auth/login", { email: email.trim().toLowerCase(), password }, { timeout: 15000 });

    const token = res?.data?.data?.token;
    const user = res?.data?.data?.user;



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
    const message = err?.response?.data?.message ||
      (err.code === "ECONNABORTED" ? "The server took too long to respond. Please try again." :
        !err.response ? "Cannot reach the server. Check your connection and try again." : "Login failed. Please try again.");
    setErr(message);
    toast.error(message);
  } finally { setSubmitting(false); }
}
  return (
    <div className="admin-login min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy-950 p-14 text-white lg:flex">
        <div className="relative z-10 flex items-center gap-3"><QrCode size={32} /><span className="text-2xl font-semibold tracking-tight">Sparrownix.</span></div>
        <div className="relative z-10 max-w-md py-20"><p className="mb-5 text-xs font-medium uppercase tracking-[.22em] text-blue-200">Your brand. More connected.</p><h1 className="text-5xl font-semibold leading-[1.15] tracking-tight">A thoughtful space<br />to manage it all.</h1><p className="mt-6 text-base leading-relaxed text-slate-400">Your brands, customer connections, and insights. Together in one beautifully organized workspace.</p><div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-xs text-slate-300"><span>Brand management</span><span>QR analytics</span><span>Customer connections</span></div></div>
        <p className="relative z-10 text-xs text-slate-500">Sparrownix Management Suite</p>
        <div aria-hidden="true" className="absolute -bottom-72 -right-48 h-[600px] w-[600px] rounded-full border border-white/5" /><div aria-hidden="true" className="absolute -bottom-48 -right-24 h-[400px] w-[400px] rounded-full border border-white/5" />
      </aside>
      <main className="flex min-h-screen items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-10 flex items-center gap-2 text-lg font-semibold text-navy-900 lg:hidden"><QrCode size={27} />Sparrownix.</div>
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-navy-900 shadow-sm"><ShieldCheck size={25} /></div>
          <h2 className="text-3xl font-semibold tracking-tight text-navy-950">Welcome back</h2><p className="mt-2 mb-8 text-sm text-slate-500">Sign in to your management workspace.</p>
          <form onSubmit={onSubmit} className="space-y-5">
            <div><label htmlFor="login-email" className="label">Email address</label><input id="login-email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} autoComplete="username" className="input-field" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div><label htmlFor="login-password" className="label">Password</label><div className="relative"><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="input-field pr-12" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1 rounded-lg p-2.5 text-slate-400 hover:text-slate-700">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            {err && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
            <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3">{submitting ? "Signing inâ€¦" : "Sign in"}<ArrowRight size={17} /></button>
          </form>
          <p className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">Sparrownix Â· Management Suite</p>
        </div>
      </main>
    </div>
  );
}

