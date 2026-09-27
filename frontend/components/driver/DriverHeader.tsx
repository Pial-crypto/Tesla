interface DriverHeaderProps {
  driverName?: string;
  onLogout: () => void;
}

export default function DriverHeader({
  driverName,
  onLogout,
}: DriverHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Dhaka Tesla Pool
          </p>

          <h2 className="mt-1 text-lg font-bold text-gray-900">
            Driver Portal
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {driverName && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {driverName}
              </p>

              <p className="text-xs text-gray-500">
                Driver
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}