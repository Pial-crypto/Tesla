import type { FormEvent } from "react";
import { paisa } from "@/lib/api";
import type { FareEstimate, PaymentMethod } from "@/types/ride";
import { ZONES } from "@/types/ride";
import { SelectField } from "./SelectField";

interface RideRequestFormProps {
  pickup: string;
  destination: string;
  seats: number;
  payment: PaymentMethod;
  estimate: FareEstimate | null;
  busy: boolean;
  onPickupChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  onSeatsChange: (value: number) => void;
  onPaymentChange: (value: PaymentMethod) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RideRequestForm({
  pickup,
  destination,
  seats,
  payment,
  estimate,
  busy,
  onPickupChange,
  onDestinationChange,
  onSeatsChange,
  onPaymentChange,
  onSubmit,
}: RideRequestFormProps) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 sm:p-7">
      <div className="mb-7">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-xl">
          🚕
        </div>
        <h2 className="text-xl font-bold">Request a ride</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Choose your route and seats. If another passenger is heading in a compatible direction,
          your ride may be pooled.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Pickup" value={pickup} onChange={onPickupChange}>
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </SelectField>

          <SelectField label="Destination" value={destination} onChange={onDestinationChange}>
            {ZONES.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Seats" value={seats} onChange={(value) => onSeatsChange(Number(value))}>
            {[1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value} seat{value > 1 ? "s" : ""}
              </option>
            ))}
          </SelectField>

          <SelectField label="Payment" value={payment} onChange={(value) => onPaymentChange(value as PaymentMethod)}>
            <option value="CASH">Cash</option>
            <option value="TESLAPAY">TeslaPay · Simulated</option>
          </SelectField>
        </div>

        {pickup === destination && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-xs text-amber-300">
            Pickup and destination must be different.
          </div>
        )}

        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Estimated fare
              </p>
              <p className="mt-1 text-2xl font-bold">{estimate ? paisa(estimate.solo) : "—"}</p>
            </div>

            {estimate && (
              <div className="text-right">
                <p className="text-xs text-slate-500">If pooled</p>
                <p className="mt-1 text-sm font-bold text-emerald-300">{paisa(estimate.ifPooled)}</p>
              </div>
            )}
          </div>

          {estimate && (
            <p className="mt-3 text-[11px] text-slate-600">
              Final fare may change if the ride is pooled according to the matching rules.
            </p>
          )}
        </div>

        <button
          disabled={busy || pickup === destination}
          type="submit"
          className="h-12 w-full rounded-xl bg-cyan-400 px-5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Requesting ride…" : "Request ride"}
        </button>
      </form>
    </div>
  );
}
