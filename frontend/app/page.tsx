"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setSession, getUser } from "../lib/api";

export default function Home() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const user = getUser();

    if (user) {
      router.replace(user.role === "DRIVER" ? "/driver" : "/passenger");
    }
  }, [router]);

  function updateField(
    field: "name" | "email" | "password",
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setBusy(true);

    try {
      const path =
        mode === "login" ? "/auth/login" : "/auth/signup";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              role: "PASSENGER",
            };

      const data = await api(path, {
        method: "POST",
        body,
      });

      setSession(data.token, data.user);

      router.push(
        data.user.role === "DRIVER"
          ? "/driver"
          : "/passenger"
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function fillDemo(email: string) {
    setMode("login");

    setForm({
      name: "",
      email,
      password: "password123",
    });

    setError("");
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

        {/* Left / Brand section */}
        <section className="relative hidden overflow-hidden px-12 py-16 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-xl font-bold text-[#07111f]">
                T
              </div>

              <div>
                <p className="text-lg font-semibold">
                  Dhaka Tesla Pool
                </p>

                <p className="text-xs text-slate-400">
                  Smarter rides across Dhaka
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Ride together
              </p>

              <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                Share a seat.
                <br />
                Split the fare.
                <br />
                <span className="text-cyan-300">
                  Beat the traffic.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
                Dhaka Tesla Pool connects passengers heading in
                similar directions and helps drivers fill
                available seats efficiently.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xl font-semibold">1</p>
              <p className="mt-1 text-xs text-slate-400">
                Request a ride
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xl font-semibold">2</p>
              <p className="mt-1 text-xs text-slate-400">
                Join a pool
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xl font-semibold">3</p>
              <p className="mt-1 text-xs text-slate-400">
                Split the fare
              </p>
            </div>
          </div>
        </section>

        {/* Right / Auth */}
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 font-bold text-[#07111f]">
                T
              </div>

              <div>
                <p className="font-semibold">
                  Dhaka Tesla Pool
                </p>

                <p className="text-xs text-slate-400">
                  Smarter rides across Dhaka
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">

              <div className="mb-7">
                <p className="mb-2 text-sm font-medium text-cyan-300">
                  {mode === "login"
                    ? "Welcome back"
                    : "Get started"}
                </p>

                <h2 className="text-2xl font-bold tracking-tight">
                  {mode === "login"
                    ? "Sign in to your account"
                    : "Create your passenger account"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {mode === "login"
                    ? "Continue your journey with Dhaka Tesla Pool."
                    : "Create an account and start sharing rides."}
                </p>
              </div>

              {/* Tabs */}
              <div className="mb-7 grid grid-cols-2 rounded-xl bg-black/20 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    mode === "signup"
                      ? "bg-white text-slate-900 shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign up
                </button>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form
                onSubmit={submit}
                className="space-y-5"
              >
                {mode === "signup" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Full name
                    </label>

                    <input
                      required
                      value={form.name}
                      onChange={(e) =>
                        updateField("name", e.target.value)
                      }
                      placeholder="Nusrat Jahan"
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">
                    Email address
                  </label>

                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-200">
                      Password
                    </label>

                    {mode === "login" && (
                      <span className="text-xs text-slate-500">
                        8+ characters
                      </span>
                    )}
                  </div>

                  <input
                    required
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) =>
                      updateField(
                        "password",
                        e.target.value
                      )
                    }
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/10"
                  />
                </div>

                <button
                  disabled={busy}
                  type="submit"
                  className="w-full rounded-xl bg-cyan-300 px-4 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy
                    ? "Please wait..."
                    : mode === "login"
                    ? "Sign in"
                    : "Create passenger account"}
                </button>
              </form>

              {/* Demo accounts */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Demo accounts
                </p>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      fillDemo("jashim@oitesla.test")
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                  >
                    <span className="block font-medium text-white">
                      Jashim
                    </span>
                    <span className="text-slate-500">
                      Driver
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fillDemo("nusrat@oitesla.test")
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                  >
                    <span className="block font-medium text-white">
                      Nusrat
                    </span>
                    <span className="text-slate-500">
                      Passenger
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fillDemo("rafiq@oitesla.test")
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                  >
                    <span className="block font-medium text-white">
                      Rafiq
                    </span>
                    <span className="text-slate-500">
                      Passenger
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fillDemo("shirin@oitesla.test")
                    }
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-slate-300 transition hover:border-cyan-300/30 hover:bg-white/[0.06]"
                  >
                    <span className="block font-medium text-white">
                      Shirin
                    </span>
                    <span className="text-slate-500">
                      Passenger
                    </span>
                  </button>

                </div>

                <p className="mt-3 text-center text-[11px] text-slate-600">
                  Demo password: password123
                </p>
              </div>
            </div>

            <p className="mt-5 text-center text-xs text-slate-600">
              Dhaka Tesla Pool · Ride sharing MVP
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}