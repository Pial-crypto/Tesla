import { paisa } from "@/lib/api";
import { statusLabel } from "@/lib/ride";
import type { Ride, RideHistoryEvent, RideStatus } from "@/types/ride";
import { StatusBadge } from "./StatusBadge";

interface RideHistoryProps {
  past: Ride[];
  history: Record<string, RideHistoryEvent[] | null>;
  onToggleHistory: (id: string) => void;
}

export function RideHistory({ past, history, onToggleHistory }: RideHistoryProps) {
  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-white/5 bg-slate-900/60">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-5 sm:px-7">
        <div>
          <h2 className="font-bold">Ride history</h2>
          <p className="mt-1 text-xs text-slate-500">Your completed and cancelled rides.</p>
        </div>

        <span className="rounded-full border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          {past.length} ride{past.length !== 1 ? "s" : ""}
        </span>
      </div>

      {past.length === 0 ? (
        <div className="px-5 py-14 text-center sm:px-7">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg">
            🛣️
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-300">No ride history yet</p>
          <p className="mt-1 text-xs text-slate-600">Your completed trips will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {past.map((ride) => (
            <div key={ride.id} className="p-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">
                      {ride.pickup_zone} <span className="text-slate-600">→</span> {ride.dest_zone}
                    </p>
                    <StatusBadge status={ride.status} />
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    {ride.seats} seat{ride.seats > 1 ? "s" : ""}
                    {ride.pool_id ? " · pooled" : " · solo"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="text-lg font-bold text-slate-200">{paisa(ride.fare_paisa)}</span>
                  <button
                    onClick={() => onToggleHistory(ride.id)}
                    type="button"
                    className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-600 hover:text-white"
                  >
                    {history[ride.id] ? "Hide timeline" : "View timeline"}
                  </button>
                </div>
              </div>

              {history[ride.id] && (
                <div className="mt-5 rounded-2xl border border-white/5 bg-slate-950/60 p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                    Ride timeline
                  </p>

                  <div className="space-y-3">
                    {history[ride.id]?.map((event, index) => (
                      <div key={`${ride.id}-${index}`} className="flex gap-3 text-xs">
                        <div className="flex flex-col items-center">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          {index < (history[ride.id]?.length ?? 0) - 1 && (
                            <span className="mt-1 h-full w-px bg-slate-800" />
                          )}
                        </div>

                        <div className="pb-2">
                          <p className="font-medium text-slate-300">
                            {statusLabel(event.to_status as RideStatus)}
                          </p>
                          <p className="mt-0.5 text-slate-600">
                            {event.from_status ? `${statusLabel(event.from_status as RideStatus)} → ` : ""}
                            {new Date(event.at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
