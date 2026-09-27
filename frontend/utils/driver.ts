import type { PoolStatus } from "@/types/driver";

export const NEXT_POOL_ACTION: Record<
  Exclude<PoolStatus, "COMPLETED">,
  {
    label: string;
    path: string;
  }
> = {
  OPEN: {
    label: "Mark Arrived",
    path: "/driver/pool/arrive",
  },

  DRIVER_ARRIVED: {
    label: "Start Trip",
    path: "/driver/pool/start",
  },

  STARTED: {
    label: "Complete Trip",
    path: "/driver/pool/complete",
  },
};

export function getPoolStatusLabel(status: PoolStatus): string {
  switch (status) {
    case "OPEN":
      return "Open";

    case "DRIVER_ARRIVED":
      return "Driver Arrived";

    case "STARTED":
      return "Trip Started";

    case "COMPLETED":
      return "Completed";

    default:
      return status;
  }
}

export function getPoolStatusClass(status: PoolStatus): string {
  switch (status) {
    case "OPEN":
      return "bg-blue-100 text-blue-700";

    case "DRIVER_ARRIVED":
      return "bg-yellow-100 text-yellow-700";

    case "STARTED":
      return "bg-green-100 text-green-700";

    case "COMPLETED":
      return "bg-gray-100 text-gray-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}