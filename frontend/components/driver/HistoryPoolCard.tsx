import type { DriverHistoryItem } from "@/types/driver";
import { paisa } from "@/lib/api";

interface HistoryPoolCardProps {
  item: DriverHistoryItem;
}

export default function HistoryPoolCard({
  item,
}: HistoryPoolCardProps) {
  const { pool, rides } = item;

  const totalSeats = rides.reduce(
    (total, ride) => total + ride.seats,
    0,
  );

  const totalFare = rides.reduce(
    (total, ride) => total + ride.farePaisa,
    0,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">
            Completed Pool
          </p>

          <h3 className="mt-1 text-lg font-bold text-gray-900">
            Pool #{pool.id}
          </h3>
        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Completed
        </span>
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
            Total Seats
          </p>

          <p className="mt-1 font-medium text-gray-900">
            {totalSeats}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Total Fare
          </p>

          <p className="mt-1 font-medium text-gray-900">
            {paisa(totalFare)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-200 pt-5">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Rides
        </h4>

        <div className="space-y-3">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">
                    Ride #{ride.id}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {ride.pickupZone} → {ride.destZone}
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  {paisa(ride.farePaisa)}
                </p>
              </div>

              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>
                  {ride.seats} seat{ride.seats !== 1 ? "s" : ""}
                </span>

                <span>
                  {ride.paymentMethod}
                </span>

                <span>
                  {ride.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}