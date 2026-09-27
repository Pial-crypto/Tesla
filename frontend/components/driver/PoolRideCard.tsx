import type { Ride } from "@/types/ride";
import { paisa } from "@/lib/api";
import StatusBadge from "./StatusBadge";

interface PoolRideCardProps {
  ride: Ride;
}

export default function PoolRideCard({
  ride,
}: PoolRideCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-semibold text-gray-900">
            Ride #{ride.id}
          </h4>

          <p className="mt-1 text-sm text-gray-500">
            Passenger #{ride.id}
          </p>
        </div>

        <StatusBadge
          status={
            ride.status === "REQUESTED"
              ? "OPEN"
              : ride.status === "MATCHED"
                ? "OPEN"
                : ride.status === "DRIVER_ARRIVED"
                  ? "DRIVER_ARRIVED"
                  : ride.status === "STARTED"
                    ? "STARTED"
                    : "COMPLETED"
          }
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500">Pickup</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {ride.pickupZone}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Destination</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {ride.destZone}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Seats</p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {ride.seats}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Passenger Fare
          </span>

          <span className="font-semibold text-gray-900">
            {paisa(ride.farePaisa)}
          </span>
        </div>
      </div>
    </div>
  );
}