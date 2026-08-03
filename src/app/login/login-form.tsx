"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp } from "./actions";
import { Logo } from "@/components/logo";

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const message = searchParams.get("message");

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-8">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo className="flex-col gap-2" markClassName="h-12 w-16" textClassName="text-2xl" />
          <p className="text-sm text-zinc-500">
            발견한 맛집을 기록하고 다른 사용자의 추천도 찾아보세요.
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-zinc-100 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-full py-2 transition-colors ${
              mode === "signin"
                ? "bg-white text-black shadow"
                : "text-zinc-500"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-full py-2 transition-colors ${
              mode === "signup"
                ? "bg-white text-black shadow"
                : "text-zinc-500"
            }`}
          >
            회원가입
          </button>
        </div>

        {message && (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {mode === "signin" ? (
          <form action={signIn} className="flex flex-col gap-4">
            <Field label="이메일" name="email" type="email" required />
            <Field label="비밀번호" name="password" type="password" required />
            <button
              type="submit"
              className="mt-2 h-11 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838]"
            >
              로그인
            </button>
          </form>
        ) : (
          <form action={signUp} className="flex flex-col gap-4">
            <Field label="이름" name="displayName" type="text" required />
            <Field label="닉네임" name="nickname" type="text" required />
            <Field label="이메일" name="email" type="email" required />
            <Field
              label="비밀번호"
              name="password"
              type="password"
              required
              minLength={6}
            />
            <button
              type="submit"
              className="mt-2 h-11 rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838]"
            >
              회원가입
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
  minLength,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="h-11 rounded-lg border border-black/10 bg-transparent px-3 text-black outline-none focus:border-black/30"
      />
    </label>
  );
}
