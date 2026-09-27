import type { PoolStatus } from "@/types/driver";
import {
  getPoolStatusClass,
  getPoolStatusLabel,
} from "@/utils/driver";

interface StatusBadgeProps {
  status: PoolStatus;
}

export default function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getPoolStatusClass(
        status,
      )}`}
    >
      {getPoolStatusLabel(status)}
    </span>
  );
}