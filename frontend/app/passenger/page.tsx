"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ActiveRide } from "@/components/passenger/ActiveRide";
import { ErrorAlert } from "@/components/passenger/ErrorAlert";
import { Header } from "@/components/passenger/Header";
import { PassengerHero } from "@/components/passenger/PassengerHero";
import { PoolingInfo } from "@/components/passenger/PoolingInfo";
import { RideHistory } from "@/components/passenger/RideHistory";
import { RideRequestForm } from "@/components/passenger/RideRequestForm";

import { api, clearSession, getUser } from "@/lib/api";
import { getErrorMessage } from "@/lib/ride";

import type { User } from "@/types/auth";
import type {
  FareEstimate,
  PaymentMethod,
  Ride,
  RideHistoryEvent,
} from "@/types/ride";

export default function PassengerPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [pickup, setPickup] = useState("Banani");
  const [destination, setDestination] = useState("Mohakhali");
  const [seats, setSeats] = useState(1);
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  const [estimate, setEstimate] = useState<FareEstimate | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [history, setHistory] = useState<
    Record<string, RideHistoryEvent[] | null>
  >({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await api<Ride[]>("/rides");
      setRides(data.rides);
      setError("");
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    }
  }, []);

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (user === null) {
      router.replace("/");
      return;
    }

    if (user.role !== "PASSENGER") {
      router.replace("/driver");
      return;
    }

    void load();

    const timer = window.setInterval(() => {
      void load();
    }, 4000);

    return () => {
      window.clearInterval(timer);
    };
  }, [user, router, load]);

  useEffect(() => {
    if (user === undefined || user === null) {
      return;
    }

    if (user.role !== "PASSENGER") {
      return;
    }

    if (pickup === destination) {
      setEstimate(null);
      return;
    }

    const fetchEstimate = async () => {
      try {
        const data = await api<FareEstimate>(
          `/fare/estimate?from=${encodeURIComponent(
            pickup,
          )}&to=${encodeURIComponent(destination)}&seats=${seats}`,
        );

        setEstimate(data);
      } catch {
        setEstimate(null);
      }
    };

    void fetchEstimate();
  }, [user, pickup, destination, seats]);

  const active = rides.find((ride) =>
    ["REQUESTED", "MATCHED", "DRIVER_ARRIVED", "STARTED"].includes(
      ride.status,
    ),
  );

  const past = rides.filter((ride) =>
    ["COMPLETED", "CANCELLED"].includes(ride.status),
  );

  const handlePickupChange = (value: string) => {
    setPickup(value);

    if (value === destination) {
      setEstimate(null);
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);

    if (value === pickup) {
      setEstimate(null);
    }
  };

  const handleSeatsChange = (value: number) => {
    setSeats(value);

    if (pickup === destination) {
      setEstimate(null);
    }
  };

  async function requestRide(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setBusy(true);

    try {
      await api("/rides", {
        method: "POST",
        body: {
          pickup,
          destination,
          seats: Number(seats),
          paymentMethod: payment,
        },
      });

      await load();
    } catch (requestError: unknown) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function cancelRide(id: string) {
    setError("");

    try {
      await api(`/rides/${id}/cancel`, {
        method: "POST",
      });

      await load();
    } catch (cancelError: unknown) {
      setError(getErrorMessage(cancelError));
    }
  }

  async function toggleHistory(id: string) {
    if (history[id]) {
      setHistory((current) => ({
        ...current,
        [id]: null,
      }));

      return;
    }

    try {
      const timeline = await api<RideHistoryEvent[]>(
        `/rides/${id}/history`,
      );

      setHistory((current) => ({
        ...current,
        [id]: timeline,
      }));
    } catch (toggleError: unknown) {
      setError(getErrorMessage(toggleError));
    }
  }

  function logout() {
    clearSession();
    setUser(null);
    router.replace("/");
  }

  if (user === undefined) {
    return null;
  }

  if (user === null) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#070b14] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <Header logout={logout} user={user} />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <PassengerHero active={!!active} />

        {error && <ErrorAlert error={error} />}

        {active ? (
          <ActiveRide active={active} cancelRide={cancelRide} />
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
            <RideRequestForm
              pickup={pickup}
              destination={destination}
              seats={seats}
              payment={payment}
              estimate={estimate}
              busy={busy}
              onPickupChange={handlePickupChange}
              onDestinationChange={handleDestinationChange}
              onSeatsChange={handleSeatsChange}
              onPaymentChange={setPayment}
              onSubmit={requestRide}
            />

            <PoolingInfo />
          </section>
        )}

        <RideHistory
          past={past}
          history={history}
          onToggleHistory={toggleHistory}
        />
      </div>
    </main>
  );
}