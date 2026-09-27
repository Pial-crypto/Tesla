import { api } from "./api";

import type {
  AcceptRideResponse,
  DriverHistoryResponse,
  DriverPoolResponse,
  DriverRequestsResponse,
  PoolActionResponse,
} from "@/types/driver";

export async function getDriverRequests() {
  return api<DriverRequestsResponse>("/driver/requests");
}

export async function getDriverPool() {
  return api<DriverPoolResponse>("/driver/pool");
}

export async function getDriverHistory() {
  return api<DriverHistoryResponse>("/driver/history");
}

export async function acceptDriverRide(
  rideId: number,
): Promise<AcceptRideResponse> {
  return api<AcceptRideResponse>(`/driver/rides/${rideId}/accept`, {
    method: "POST",
  });
}

export async function arriveAtPool(): Promise<PoolActionResponse> {
  return api<PoolActionResponse>("/driver/pool/arrive", {
    method: "POST",
  });
}

export async function startPool(): Promise<PoolActionResponse> {
  return api<PoolActionResponse>("/driver/pool/start", {
    method: "POST",
  });
}

export async function completePool(): Promise<PoolActionResponse> {
  return api<PoolActionResponse>("/driver/pool/complete", {
    method: "POST",
  });
}