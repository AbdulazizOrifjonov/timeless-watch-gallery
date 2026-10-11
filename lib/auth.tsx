"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AppUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  profileImage?: string;
  role: "user" | "admin" | "super_admin";
  createdAt: string;
}

export function getUzPhoneDigits(raw: string): string {
  let digits = (raw || "").replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  return digits.slice(0, 9);
}

// Ruxsat berilgan Super Admin raqamlari (.env orqali boshqariladi)
const envAdminNumbers = (process.env.NEXT_PUBLIC_ADMIN_PHONES || "901234567")
  .split(",")
  .map((p) => getUzPhoneDigits(p.trim()))
  .filter(Boolean);

export const ADMIN_NUMBERS = envAdminNumbers.length > 0 ? envAdminNumbers : ["901234567"];

export const ADMIN_PHONES = ADMIN_NUMBERS.map((n) => `+998${n}`);


export function formatUzPhone(input: string): string {
  const digits = getUzPhoneDigits(input);
  if (!digits) {
    return "+998 ";
  }
  let res = "+998 " + digits.slice(0, 2);
  if (digits.length > 2) {
    res += " " + digits.slice(2, 5);
  }
  if (digits.length > 5) {
    res += " " + digits.slice(5, 7);
  }
  if (digits.length > 7) {
    res += " " + digits.slice(7, 9);
  }
  return res;
}

export function normalizePhone(phone: string): string {
  const digits = getUzPhoneDigits(phone);
  return "+998" + digits;
}

export function isSuperAdminPhone(phone: string): boolean {
  const digits = getUzPhoneDigits(phone);
  // Faqat va faqat to'liq 9 ta raqam terilganda va ikkita raqamdan biriga 100% to'g'ri kelgandagina true!
  // Agar 1 ta raqam boshqa bo'lsa ham yoki 9 tadan kam bo'lsa darhol false!
  return digits.length === 9 && ADMIN_NUMBERS.includes(digits);
}

interface AuthValue {
  user: AppUser | null;
  ready: boolean;
  login: (
    phone: string,
    password?: string,
    fullName?: string
  ) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean; notRegistered?: boolean }>;
  signup: (
    fullName: string,
    phone: string,
    password?: string
  ) => Promise<{ ok: boolean; error?: string; isAdmin?: boolean; alreadyRegistered?: boolean }>;
  logout: () => void;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

const SESSION_KEY = "gws_session_id"; // store the user id
const LOCAL_USERS_KEY = "gws_local_users"; // localStorage fallback for users

function getLocalUsers(): Record<string, any> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLocalUser(user: any) {
  const users = getLocalUsers();
  users[user.id] = user;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function findLocalUserByPhone(phone: string): any | null {
  const users = getLocalUsers();
  return Object.values(users).find((u: any) => u.phone === phone) || null;
}

function findLocalUserById(id: string): any | null {
  const users = getLocalUsers();
  return users[id] || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSession() {
      const sessionId = localStorage.getItem(SESSION_KEY);
      if (sessionId) {
        let found = false;
        try {
          const { data, error } = await supabase.from("app_users").select("*").eq("id", sessionId).single();
          if (data && !error) {
            setUser({ id: data.id, fullName: data.full_name, phone: data.phone, role: data.role, createdAt: data.created_at, profileImage: data.profile_image, address: data.address });
            found = true;
          }
        } catch {}
        // localStorage fallback
        if (!found) {
          const local = findLocalUserById(sessionId);
          if (local) {
            setUser({ id: local.id, fullName: local.full_name, phone: local.phone, role: local.role, createdAt: local.created_at, profileImage: local.profile_image, address: local.address });
          }
        }
      }
      setReady(true);
    }
    loadSession();
  }, [supabase]);

  const login = useCallback(
    async (arg1: string, arg2?: string, arg3?: string) => {
      let fullName = "";
      let phone = arg1;
      let password = arg2;

      // Agar birinchi parametr ism bo'lib, ikkinchisi telefon raqam bo'lsa (eski chaqiruvlarni ham qo'llash)
      if (arg1 && arg2 && (arg2.includes("+998") || /^\d{9,12}$/.test(arg2.replace(/\s+/g, "")))) {
        fullName = arg1;
        phone = arg2;
        password = arg3;
      } else if (arg3) {
        fullName = arg3;
      }

      const cleanPhone = normalizePhone(phone);
      const isSuper = isSuperAdminPhone(cleanPhone);

      // 1. Agar Super Admin raqami bo'lsa
      if (isSuper) {
        const expectedPassword = (process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123").toLowerCase();
        if (!password || password.trim().toLowerCase() !== expectedPassword) {
          return { ok: false, error: "Admin paroli noto'g'ri!", isAdmin: true };
        }

        const adminName = fullName?.trim() || "Admin";

        // Supabase orqali qidirish
        let existing: any = null;
        let supabaseWorking = false;
        try {
          const { data } = await supabase
            .from("app_users")
            .select("*")
            .eq("phone", cleanPhone)
            .maybeSingle();
          if (data) {
            existing = data;
            supabaseWorking = true;
          }
        } catch {}

        if (existing && supabaseWorking) {
          const userData: AppUser = {
            id: existing.id,
            fullName: adminName,
            phone: existing.phone,
            role: "super_admin",
            createdAt: existing.created_at, profileImage: existing.profile_image, address: existing.address,
          };
          await supabase
            .from("app_users")
            .update({ role: "super_admin", full_name: adminName })
            .eq("id", existing.id);

          setUser(userData);
          localStorage.setItem(SESSION_KEY, userData.id);
          saveLocalUser({ id: userData.id, full_name: adminName, phone: cleanPhone, role: "super_admin", created_at: userData.createdAt });
          return { ok: true, isAdmin: true };
        }

        if (supabaseWorking) {
          // Supabase ishlayapti, lekin foydalanuvchi topilmadi — yaratish
          const { data: newUser, error: insertError } = await supabase
            .from("app_users")
            .insert({
              full_name: adminName,
              phone: cleanPhone,
              role: "super_admin",
              password: password || "admin123",
            })
            .select()
            .single();

          if (!insertError && newUser) {
            const userData: AppUser = {
              id: newUser.id,
              fullName: newUser.full_name,
              phone: newUser.phone,
              role: "super_admin",
              createdAt: newUser.created_at,
            };
            setUser(userData);
            localStorage.setItem(SESSION_KEY, userData.id);
            saveLocalUser({ id: userData.id, full_name: adminName, phone: cleanPhone, role: "super_admin", created_at: userData.createdAt });
            return { ok: true, isAdmin: true };
          }
        }

        // Supabase ishlamayapti — localStorage fallback
        const localExisting = findLocalUserByPhone(cleanPhone);
        const now = new Date().toISOString();
        const userId = localExisting?.id || crypto.randomUUID?.() || `admin_${Date.now()}`;
        const userData: AppUser = {
          id: userId,
          fullName: adminName,
          phone: cleanPhone,
          role: "super_admin",
          createdAt: localExisting?.created_at || now, profileImage: localExisting?.profile_image, address: localExisting?.address,
        };
        saveLocalUser({ id: userId, full_name: adminName, phone: cleanPhone, role: "super_admin", created_at: userData.createdAt });
        setUser(userData);
        localStorage.setItem(SESSION_KEY, userData.id);
        return { ok: true, isAdmin: true };
      }

      // 2. Oddiy foydalanuvchi: faqat oldin ro'yxatdan o'tgan bo'lsa kiritadi!
      let existing: any = null;
      let queryFailed = false;
      try {
        const { data, error: queryError } = await supabase
          .from("app_users")
          .select("*")
          .eq("phone", cleanPhone)
          .maybeSingle();
        if (queryError) { queryFailed = true; } else { existing = data; }
      } catch { queryFailed = true; }

      // localStorage fallback
      if (queryFailed || (!existing && !queryFailed)) {
        const localUser = findLocalUserByPhone(cleanPhone);
        if (localUser) { existing = localUser; }
      }

      if (!existing) {
        return {
          ok: false,
          error: "Ushbu telefon raqam ro'yxatdan o'tmagan! Iltimos, 'Ro'yxatdan o'tish' bo'limi orqali hisob oching.",
          notRegistered: true,
        };
      }

      if (existing.password && existing.password !== password) {
        return {
          ok: false,
          error: "Parol noto'g'ri kiritildi!",
        };
      }

      const userData: AppUser = {
        id: existing.id,
        fullName: existing.full_name,
        phone: existing.phone,
        role: existing.role,
        createdAt: existing.created_at, profileImage: existing.profile_image, address: existing.address,
      };

      setUser(userData);
      localStorage.setItem(SESSION_KEY, userData.id);
      return { ok: true, isAdmin: ["admin", "super_admin"].includes(existing.role) };
    },
    [supabase]
  );

  const signup = useCallback(
    async (fullName: string, phone: string, password?: string) => {
      const cleanPhone = normalizePhone(phone);
      const isSuper = isSuperAdminPhone(cleanPhone);

      let existing: any = null;
      try {
        const { data } = await supabase.from("app_users").select("*").eq("phone", cleanPhone).maybeSingle();
        if (data) existing = data;
      } catch {}

      if (!existing) {
        const localUser = findLocalUserByPhone(cleanPhone);
        if (localUser) existing = localUser;
      }

      const assignedRole = isSuper ? "super_admin" : "user";
      const cleanName = fullName.trim() || (isSuper ? "Admin" : "Foydalanuvchi");
      const userPassword = password?.trim() || "";

      if (existing) {
        // Agar ro'yxatdan o'tgan bo'lsa, xato bermaymiz. Yangi ism va parolni ustidan yozib yuboramiz (Upsert)
        const updateData = { full_name: cleanName, password: userPassword };
        try {
          await supabase.from("app_users").update(updateData).eq("id", existing.id);
        } catch {}

        const localUsers = getLocalUsers();
        if (localUsers[existing.id]) {
          localUsers[existing.id].full_name = cleanName;
          localUsers[existing.id].password = userPassword;
          localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
        }

        const userData: AppUser = {
          id: existing.id,
          fullName: cleanName,
          phone: existing.phone,
          role: existing.role,
          createdAt: existing.created_at || new Date().toISOString(),
          profileImage: existing.profile_image,
          address: existing.address
        };

        setUser(userData);
        localStorage.setItem(SESSION_KEY, existing.id);
        return { ok: true, isAdmin: isSuper };
      }

      let newUser: any = null;
      try {
        const { data, error: insertError } = await supabase.from("app_users").insert({
            full_name: cleanName,
            phone: cleanPhone,
            role: assignedRole,
            password: userPassword,
          }).select().single();
        if (!insertError && data) newUser = data;
      } catch {}

      if (!newUser) {
        const now = new Date().toISOString();
        const userId = crypto.randomUUID?.() || `user_${Date.now()}`;
        newUser = { id: userId, full_name: cleanName, phone: cleanPhone, role: assignedRole, password: userPassword, created_at: now };
        saveLocalUser(newUser);
      }

      const userData: AppUser = {
        id: newUser.id,
        fullName: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.created_at,
      };

      setUser(userData);
      localStorage.setItem(SESSION_KEY, userData.id);
      saveLocalUser(newUser);
      return { ok: true, isAdmin: isSuper };
    },
    [supabase]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<AppUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedUser = { ...prev, ...data };
      
      // LocalStorage ni ham yangilash (shunda rasmlar o'chib ketmaydi)
      const localUsers = getLocalUsers();
      if (localUsers[updatedUser.id]) {
        localUsers[updatedUser.id].full_name = updatedUser.fullName;
        localUsers[updatedUser.id].phone = updatedUser.phone;
        localUsers[updatedUser.id].profile_image = updatedUser.profileImage;
        localUsers[updatedUser.id].address = updatedUser.address;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(localUsers));
      }

      return updatedUser;
    });

    if (user?.id) {
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.full_name = data.fullName;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.profileImage !== undefined) updateData.profile_image = data.profileImage;
      if (data.address !== undefined) updateData.address = data.address;
      
      try {
        if (Object.keys(updateData).length > 0) {
          await supabase.from("app_users").update(updateData).eq("id", user.id);
        }
      } catch (e) {}
    }
  }, [user, supabase]);

  const isAdmin = !!user && ["admin", "super_admin"].includes(user.role);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}








