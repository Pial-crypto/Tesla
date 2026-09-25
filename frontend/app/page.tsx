"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setSession, getUser } from "../lib/api";
import { MobileLogo } from "@/components/auth/MobileLogo";
import { Form } from "@/components/auth/Form";
import { BrandSection } from "@/components/auth/BrandSection";
import { SignupData,LoginData } from "@/types/auth";


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

      const body: SignupData | LoginData =
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
        body
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

       <BrandSection></BrandSection>
      

      
        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

        
         
<MobileLogo></MobileLogo>
        <Form
  mode={mode}
  form={form}
  error={error}
  busy={busy}
  setMode={setMode}
  setError={setError}
  updateField={updateField}
  submit={submit}
  fillDemo={fillDemo}
/>

            <p className="mt-5 text-center text-xs text-slate-600">
              Dhaka Tesla Pool · Ride sharing MVP
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}