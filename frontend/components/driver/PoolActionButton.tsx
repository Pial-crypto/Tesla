import type { PoolStatus } from "@/types/driver";
import { NEXT_POOL_ACTION } from "@/utils/driver";

interface PoolActionButtonProps {
  status: PoolStatus;
  onAction: () => void;
  loading?: boolean;
}

export default function PoolActionButton({
  status,
  onAction,
  loading = false,
}: PoolActionButtonProps) {
  if (status === "COMPLETED") {
    return null;
  }

  const action = NEXT_POOL_ACTION[status];

  if (!action) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={loading}
      className="w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? "Processing..." : action.label}
    </button>
  );
}