"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DriverHeader from "@/components/driver/DriverHeader";
import DriverHero from "@/components/driver/DriverHero";
import DriverTabs, {
  type DriverTab,
} from "@/components/driver/DriverTabs";
import RequestList from "@/components/driver/RequestList";
import CurrentPool from "@/components/driver/CurrentPool";
import DriverHistory from "@/components/driver/DriverHistory";
import PoolActionButton from "@/components/driver/PoolActionButton";
import ErrorAlert from "@/components/driver/ErrorAlert";

import {
  acceptDriverRide,
  arriveAtPool,
  completePool,
  getDriverHistory,
  getDriverPool,
  getDriverRequests,
  startPool,
} from "@/lib/driver";

import { clearSession, getUser } from "@/lib/api";

import type {
  DriverHistoryItem,
  DriverPoolData,
} from "@/types/driver";
import type { Ride } from "@/types/ride";
import type { User } from "@/types/auth";
import { useAuth } from "@/hook/auth";

export default function DriverPage() {
  const router = useRouter();
  useAuth()

  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] =
    useState<DriverTab>("requests");

  const [requests, setRequests] = useState<Ride[]>([]);
  const [pool, setPool] = useState<DriverPoolData | null>(null);
  const [history, setHistory] = useState<DriverHistoryItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [acceptingRideId, setAcceptingRideId] =
    useState<number | null>(null);
  const [poolActionLoading, setPoolActionLoading] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    const data = await getDriverRequests();
    console.log(data,"Get driver req")
   
setRequests(data.rides ?? []);
  }, []);

  const loadPool = useCallback(async () => {
    const data = await getDriverPool();
    console.log(data,"Pool data")
    
    setPool(data.pool);
  }, []);

  const loadHistory = useCallback(async () => {
    const data = await getDriverHistory();
    console.log("history data",data)
    setHistory(data.history);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        loadRequests(),
        loadPool(),
        loadHistory(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load driver dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, [loadRequests, loadPool, loadHistory]);

  useEffect(() => {
    const currentUser = getUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    if (currentUser.role !== "DRIVER") {
      router.replace("/");
      return;
    }

    setUser(currentUser);
    void loadDashboard();
  }, [router, loadDashboard]);

  async function handleAccept(rideId: number) {
    try {
      setAcceptingRideId(rideId);
      setError(null);

      await acceptDriverRide(rideId);

      await Promise.all([
        loadRequests(),
        loadPool(),
      ]);

      setActiveTab("pool");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to accept ride.",
      );
    } finally {
      setAcceptingRideId(null);
    }
  }

  async function handlePoolAction() {
    if (!pool) {
      return;
    }

    try {
      setPoolActionLoading(true);
      setError(null);

      switch (pool.pool.status) {
        case "OPEN":
          await arriveAtPool();
          break;

        case "DRIVER_ARRIVED":
          await startPool();
          break;

        case "STARTED":
          await completePool();
          break;

        case "COMPLETED":
          return;
      }

      await Promise.all([
        loadPool(),
        loadRequests(),
      ]);

      if (pool.pool.status === "STARTED") {
        await loadHistory();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update pool.",
      );
    } finally {
      setPoolActionLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
          <p className="text-sm text-gray-500">
            Loading driver dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <DriverHeader
        driverName={user?.name}
        onLogout={handleLogout}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <DriverHero driverName={user?.name} />

          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
          />

          <DriverTabs
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {activeTab === "requests" && (
            <RequestList
              requests={requests}
              onAccept={handleAccept}
              acceptingRideId={acceptingRideId}
            />
          )}

          {activeTab === "pool" && (
            <div className="space-y-4">
              <CurrentPool poolData={pool} />

              {pool && (
                <PoolActionButton
                  status={pool.pool.status}
                  onAction={handlePoolAction}
                  loading={poolActionLoading}
                />
              )}
            </div>
          )}

          {activeTab === "history" && (
            <DriverHistory history={history} />
          )}
        </div>
      </div>
    </main>
  );
}