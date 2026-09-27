import type { Ride } from "@/types/ride";
import RequestCard from "./RequestCard";

interface RequestListProps {
  requests: Ride[];
  onAccept: (rideId: number) => void;
  acceptingRideId?: number | null;
}

export default function RequestList({
  requests,
  onAccept,
  acceptingRideId = null,
}: RequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          No ride requests
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          There are currently no available ride requests for you.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {requests.map((ride) => (
        <RequestCard
          key={ride.id}
          ride={ride}
          onAccept={onAccept}
          accepting={acceptingRideId === ride.id}
        />
      ))}
    </div>
  );
}