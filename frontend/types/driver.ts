import type { Ride, RideStatus } from "./ride";

export type PoolStatus =
  | "OPEN"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED";

export interface DriverPool {
  id: number;
  vehicleId: number;
  pickupZone: string;
  status: PoolStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DriverRequestsResponse {
  success: boolean;
  requests: Ride[];
}

export interface DriverPoolData {
  pool: DriverPool;
  rides: Ride[];
}

export interface DriverPoolResponse {
  success: boolean;
  pool: DriverPoolData | null;
}

export interface AcceptRideResponse {
  success: boolean;
  poolId: number;
  rideId: number;
  status: RideStatus;
  seatsUsed: number;
  capacity: number;
}

export interface PoolActionResponse {
  success: boolean;
  poolId: number;
  status: PoolStatus;
  rides: number[];
}

export interface DriverHistoryItem {
  pool: DriverPool;
  rides: Ride[];
}

export interface DriverHistoryResponse {
  success: boolean;
  history: DriverHistoryItem[];
}