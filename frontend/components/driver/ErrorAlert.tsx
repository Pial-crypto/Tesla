interface ErrorAlertProps {
  message: string | null;
  onClose?: () => void;
}

export default function ErrorAlert({
  message,
  onClose,
}: ErrorAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
    >
      <div>
        <p className="text-sm font-semibold">
          Something went wrong
        </p>

        <p className="mt-1 text-sm">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-red-600 hover:bg-red-100"
          aria-label="Close error"
        >
          ×
        </button>
      )}
    </div>
  );
}