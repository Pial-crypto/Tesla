import type { Ride } from "@/types/ride";
import { paisa } from "@/lib/api";

interface RequestCardProps {
  ride: Ride;
  onAccept: (rideId: number) => void;
  accepting?: boolean;
}

export default function RequestCard({
  ride,
  onAccept,
  accepting = false,
}: RequestCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ride #{ride.id}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Passenger request
          </p>
        </div>

        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
          Requested
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Pickup</p>
          <p className="mt-1 font-medium text-gray-900">
            {ride.pickupZone}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Destination</p>
          <p className="mt-1 font-medium text-gray-900">
            {ride.destZone}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Seats</p>
          <p className="mt-1 font-medium text-gray-900">
            {ride.seats}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Current Fare</p>
          <p className="mt-1 font-medium text-gray-900">
            {paisa(ride.farePaisa)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onAccept(ride.id)}
        disabled={accepting}
        className="mt-5 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {accepting ? "Accepting..." : "Accept Ride"}
      </button>
    </div>
  );
}