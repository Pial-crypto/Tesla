import type { FormEvent } from "react";

type Mode = "login" | "signup";

type FormData = {
  name: string;
  email: string;
  password: string;
};

type UpdateField = (
  field: keyof FormData,
  value: string
) => void;

type SubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => void | Promise<void>;

type FillDemo = (email: string) => void;

interface FormProps {
  mode: Mode;
  form: FormData;
  error: string;
  busy: boolean;
  setMode: (mode: Mode) => void;
  setError: (error: string) => void;
  updateField: UpdateField;
  submit: SubmitHandler;
  fillDemo: FillDemo;
}

export const Form = ({
  mode,
  form,
  error,
  busy,
  setMode,
  setError,
  updateField,
  submit,
  fillDemo,
}: FormProps) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-medium text-cyan-300">
          {mode === "login" ? "Welcome back" : "Get started"}
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

      <form onSubmit={submit} className="space-y-5">
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
              updateField("password", e.target.value)
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
  );
};