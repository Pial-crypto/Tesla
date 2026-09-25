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
  id: string;
  pickup_zone: string;
  dest_zone: string;
  seats: number;
  pool_id?: string | null;
  fare_paisa: number;
  status: RideStatus;
}

export  interface FareEstimate {
  solo: number;
  ifPooled: number;
}

export interface RideHistoryEvent {
  from_status?: string | null;
  to_status: string;
  at: string;
}

