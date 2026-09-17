"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setMessage("");

    const result = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    setMessage(
      isRegister
        ? "ثبت‌نام انجام شد. ایمیل خود را بررسی کنید."
        : "ورود با موفقیت انجام شد."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-5 rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">
          {isRegister ? "ثبت‌نام" : "ورود"}
        </h1>

        <input
          type="email"
          placeholder="ایمیل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="رمز عبور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <button
          onClick={handleSubmit}
          className="w-full rounded-lg bg-black p-3 text-white"
        >
          {isRegister ? "ثبت‌نام" : "ورود"}
        </button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm underline"
        >
          {isRegister
            ? "قبلاً حساب دارید؟ ورود"
            : "حساب ندارید؟ ثبت‌نام"}
        </button>

        {message && <p className="text-sm">{message}</p>}
      </div>
    </main>
  );
}