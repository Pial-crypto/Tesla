export const ZONES = [
  "Banani",
  "Mohakhali",
  "Gulshan 1",
  "Farmgate",
  "Uttara",
  "Dhanmondi",
  "Mirpur",
  "Bashundhara",
] as const;

export const STEPS = [
  "REQUESTED",
  "MATCHED",
  "DRIVER_ARRIVED",
  "STARTED",
  "COMPLETED",
] as const;

export type RideStatus =
  | "REQUESTED"
  | "MATCHED"
  | "DRIVER_ARRIVED"
  | "STARTED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "TESLAPAY";

export interface Ride {
  id: number;
  pickupZone: string;
  destZone: string;
  seats: number;
  poolId: number | null;
  farePaisa: number;
  status: RideStatus;
}

export interface FareEstimate {
  solo: number;
  ifPooled: number;
}

export interface RideHistoryEvent {
  fromStatus?: string | null;
  toStatus: string;
  at: string;
}