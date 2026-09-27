import type { DriverPoolData } from "@/types/driver";
import PoolRideCard from "./PoolRideCard";
import StatusBadge from "./StatusBadge";

interface CurrentPoolProps {
  poolData: DriverPoolData | null;
}

export default function CurrentPool({
  poolData,
}: CurrentPoolProps) {
  if (!poolData) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          No active pool
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Accept a ride request to create or join a pool.
        </p>
      </div>
    );
  }

  const { pool, rides } = poolData;

  const seatsUsed = rides.reduce(
    (total, ride) => total + ride.seats,
    0,
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              Current Pool
            </p>

            <h2 className="mt-1 text-xl font-bold text-gray-900">
              Pool #{pool.id}
            </h2>
          </div>

          <StatusBadge status={pool.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Pickup Zone
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {pool.pickupZone}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Seats Used
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {seatsUsed}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">
              Passengers
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {rides.length}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Pool Rides
          </h3>

          <span className="text-sm text-gray-500">
            {rides.length} ride{rides.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid gap-4">
          {rides.map((ride) => (
            <PoolRideCard
              key={ride.id}
              ride={ride}
            />
          ))}
        </div>
      </div>
    </div>
  );
}