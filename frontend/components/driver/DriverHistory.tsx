import type { DriverHistoryItem } from "@/types/driver";
import HistoryPoolCard from "./HistoryPoolCard";

interface DriverHistoryProps {
  history: DriverHistoryItem[];
}

export default function DriverHistory({
  history,
}: DriverHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          No trip history
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Completed pools will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <HistoryPoolCard
          key={item.pool.id}
          item={item}
        />
      ))}
    </div>
  );
}