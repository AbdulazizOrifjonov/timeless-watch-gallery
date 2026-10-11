"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { LogIn, UserPlus, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { useAuth, isSuperAdminPhone, normalizePhone, formatUzPhone, getUzPhoneDigits } from "@/lib/auth";
import { cn } from "@/lib/utils";

function AuthForm() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanPhone = normalizePhone(phone);
  const phoneDigits = getUzPhoneDigits(phone);
  const isAdminPhoneDetected = isSuperAdminPhone(phone);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (phoneDigits.length < 9) {
      setError("Iltimos, to'liq 9 xonali telefon raqamingizni kiriting.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      // 1. KIRISH (LOGIN) - Hamma uchun parol talab qilinadi
      if (!password.trim()) {
        setError("Iltimos, parolingizni kiriting.");
        setLoading(false);
        return;
      }

      const res = await login(cleanPhone, password, fullName);
      setLoading(false);

      if (!res.ok) {
        setError(res.error || "Kirishda xatolik yuz berdi.");
        return;
      }

      if (res.isAdmin) {
        router.push("/admin");
      } else if (redirect) {
        const target = redirect.startsWith("/") ? redirect : `/${redirect}`;
        router.push(target);
      } else {
        router.push("/profile");
      }
    } else {
      // 2. RO'YXATDAN O'TISH (SIGN UP)
      if (fullName.trim().length < 2) {
        setError("Iltimos, ism-familiyangizni kiriting.");
        setLoading(false);
        return;
      }

      if (!password.trim()) {
        setError("Iltimos, parolingizni kiriting.");
        setLoading(false);
        return;
      }

      const res = await signup(fullName, cleanPhone, password);
      setLoading(false);

      if (!res.ok) {
        setError(res.error || "Ro'yxatdan o'tishda xatolik yuz berdi.");
        return;
      }

      if (res.isAdmin) {
        router.push("/admin");
      } else if (redirect) {
        const target = redirect.startsWith("/") ? redirect : `/${redirect}`;
        router.push(target);
      } else {
        router.push("/profile");
      }
    }
  }

  return (
    <div className="container-shop flex min-h-[75vh] items-center justify-center py-12 sm:py-16">
      <div className="w-full max-w-md rounded-3xl border border-navy-100 bg-white p-6 sm:p-8 shadow-xl shadow-navy-950/5">
        
        {/* 2 XIL REJIM TABLARI: Kirish vs Ro'yxatdan o'tish */}
        <div className="flex rounded-2xl bg-navy-50/80 p-1 mb-6 border border-navy-100/70">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccessMsg("");
              setPassword("");
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all",
              mode === "login"
                ? "bg-white text-navy-950 shadow-xs border border-navy-100/50"
                : "text-navy-900/50 hover:text-navy-900"
            )}
          >
            <LogIn size={15} />
            <span>Kirish</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccessMsg("");
              setPassword("");
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all",
              mode === "signup"
                ? "bg-white text-navy-950 shadow-xs border border-navy-100/50"
                : "text-navy-900/50 hover:text-navy-900"
            )}
          >
            <UserPlus size={15} />
            <span>Ro'yxatdan o'tish</span>
          </button>
        </div>

        {/* Sarlavha */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
            {mode === "login" ? "Xush kelibsiz" : "Yangi hisob yaratish"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-navy-900/50">
            {mode === "login"
              ? "Hisobingizga kirish uchun telefon raqamingizni kiriting"
              : "Timeless — The Watch Gallery'dan to'liq foydalanish uchun ro'yxatdan o'ting"}
          </p>
        </div>

        {/* Super Admin Tanilganda Chiqadigan Nishon */}
        {isAdminPhoneDetected && (
          <div className="mb-5 rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-orange-50/80 p-3.5 text-xs text-amber-950 flex items-center gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-sm">Super Admin aniqlandi</p>
              <p className="text-[11px] text-amber-900/70 mt-0.5">
                Admin panelga kirish uchun parolni kiriting.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ro'yxatdan o'tish rejimida Ism kiritish */}
          {mode === "signup" && (
            <div className="animate-in fade-in duration-200">
              <label className="mb-1 block text-xs font-semibold text-navy-900">
                Ism va Familiya <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-navy-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-navy-950 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 transition"
                placeholder="Ism va familiyangizni kiriting"
              />
            </div>
          )}

          {/* Telefon raqam */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-navy-900">
              Telefon raqam <span className="text-danger">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => {
                const formatted = formatUzPhone(e.target.value);
                setPhone(formatted);
                setError("");
              }}
              onKeyDown={(e) => {
                const target = e.currentTarget;
                if (
                  (e.key === "Backspace" || e.key === "Delete") &&
                  (target.selectionStart ?? 0) <= 5 &&
                  target.selectionStart === target.selectionEnd
                ) {
                  e.preventDefault();
                }
              }}
              className="w-full rounded-xl border border-navy-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-navy-950 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 transition"
              placeholder="+998 -- --- -- --"
              autoComplete="username"
            />
          </div>

          {/* Parol maydoni (Hamma uchun) */}
          <div className="animate-in fade-in duration-200">
            <label className="mb-1 block text-xs font-semibold text-navy-900">
              Parol <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className={cn(
                  "w-full rounded-xl border border-navy-200/80 bg-white px-3.5 py-2.5 text-sm font-medium text-navy-950 outline-none focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 pr-10 transition",
                  isAdminPhoneDetected && "border-amber-300 bg-amber-50/20 focus:border-amber-500 focus:ring-amber-400/20"
                )}
                placeholder="Parolingizni kiriting"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-900/40 hover:text-navy-900 transition cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="mt-1.5 text-[11px] text-navy-900/60 leading-tight">
                <strong>Eslatma:</strong> Bu parolni eslab qoling. Boshqa qurilmalardan (telefon, kompyuter) o'z hisobingizga kirish uchun xuddi shu parol va telefon raqamingizdan foydalanasiz.
              </p>
            )}
          </div>

          {/* Xatolik xabari */}
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger/5 p-3 text-xs text-danger flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes("ro'yxatdan o'tmagan") && mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setError("");
                    }}
                    className="block mt-1.5 font-bold text-navy-950 hover:underline"
                  >
                    👉 Ro'yxatdan o'tish bo'limiga o'tish
                  </button>
                )}
                {error.includes("allaqachon ro'yxatdan o'tgan") && mode === "signup" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setError("");
                    }}
                    className="block mt-1.5 font-bold text-navy-950 hover:underline"
                  >
                    👉 Kirish bo'limiga o'tish
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Muvaffaqiyat xabari */}
          {successMsg && (
            <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-xs text-success flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Yuborish tugmasi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-navy-900 py-3 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-50 transition active:scale-[0.99] shadow-md shadow-navy-900/10 cursor-pointer"
          >
            {loading
              ? "Kutilmoqda..."
              : mode === "login"
              ? isAdminPhoneDetected
                ? "Super Admin sifatida kirish"
                : "Kirish"
              : "Ro'yxatdan o'tish"}
          </button>
        </form>

        {/* Pastki eslatma */}
        <div className="mt-6 rounded-2xl bg-navy-50/60 p-3.5 text-center text-xs text-navy-900/50 leading-relaxed border border-navy-100/60">
          {mode === "login" ? (
            <p>
              Hisobingiz yo'qmi?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="font-bold text-navy-950 hover:underline cursor-pointer"
              >
                Ro'yxatdan o'ting
              </button>
            </p>
          ) : (
            <p>
              Oldin ro'yxatdan o'tganmisiz?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className="font-bold text-navy-950 hover:underline cursor-pointer"
              >
                Kirish bo'limiga o'ting
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy-50/30">
      <Header active="/login" />
      <Suspense
        fallback={
          <div className="container-shop flex min-h-[75vh] items-center justify-center text-sm text-navy-900/50">
            Yuklanmoqda...
          </div>
        }
      >
        <AuthForm />
      </Suspense>
      <Footer />
    </div>
  );
}

