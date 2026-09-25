import { statusLabel } from "@/lib/ride";
import type { RideStatus } from "@/types/ride";

export function StatusBadge({ status }: { status: RideStatus }) {
  const styles: Record<RideStatus, string> = {
    REQUESTED: "border-amber-400/20 bg-amber-400/10 text-amber-300",
    MATCHED: "border-blue-400/20 bg-blue-400/10 text-blue-300",
    DRIVER_ARRIVED: "border-violet-400/20 bg-violet-400/10 text-violet-300",
    STARTED: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    COMPLETED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    CANCELLED: "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}
