import { statusLabel } from "@/lib/ride";
import { RideStatus, STEPS } from "@/types/ride";

export function Lifecycle({ status }: { status: RideStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15">
          ✕
        </span>
        <div>
          <p className="font-semibold">Ride cancelled</p>
          <p className="text-xs text-red-300/70">This ride is no longer active.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status as (typeof STEPS)[number]);

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-[560px] items-start">
        {STEPS.map((step, index) => {
          const done = index < currentIndex;
          const current = index === currentIndex;

          return (
            <div key={step} className="flex flex-1 items-start">
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition",
                    done
                      ? "border-cyan-400 bg-cyan-400 text-slate-950"
                      : current
                        ? "border-cyan-300 bg-cyan-300/15 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.18)]"
                        : "border-slate-700 bg-slate-900 text-slate-600",
                  ].join(" ")}
                >
                  {done ? "✓" : index + 1}
                </div>
                <span
                  className={[
                    "mt-2 text-center text-[10px] font-medium uppercase tracking-wide",
                    done || current ? "text-slate-200" : "text-slate-600",
                  ].join(" ")}
                >
                  {statusLabel(step)}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`mt-[18px] h-px flex-1 ${
                    index < currentIndex ? "bg-cyan-400/60" : "bg-slate-800"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}