import { paisa } from "@/lib/api";
import { statusLabel } from "@/lib/ride";
import type { Ride } from "@/types/ride";
import { Lifecycle } from "./LifeCycle";

export function ActiveRide({
  active,
  cancelRide,
}: {
  active: Ride;
  cancelRide: (id: string) => Promise<void> | void;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-400/15 bg-slate-900/70 shadow-2xl shadow-black/20">
      <div className="border-b border-white/5 bg-gradient-to-r from-cyan-400/[0.08] to-transparent px-5 py-5 sm:px-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                Active ride
              </span>
            </div>

            <h2 className="text-xl font-bold">
              {active.pickup_zone} <span className="text-slate-600">→</span> {active.dest_zone}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {active.seats} seat{active.seats > 1 ? "s" : ""}
              {active.pool_id ? " · Shared pool" : " · Private ride"}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[11px] uppercase tracking-wider text-slate-500">Current fare</p>
            <p className="mt-1 text-2xl font-bold text-cyan-300">{paisa(active.fare_paisa)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-7 p-5 sm:p-7">
        <Lifecycle status={active.status} />

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/5 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">{statusLabel(active.status)}</p>
            <p className="mt-1 text-xs text-slate-500">
              Your ride status updates automatically.
            </p>
          </div>

          {(active.status === "REQUESTED" || active.status === "MATCHED") && (
            <button
              onClick={() => cancelRide(active.id)}
              type="button"
              className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-400/15"
            >
              Cancel ride
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
