export function PoolingInfo() {
  const steps = [
    ["01", "Choose your route", "Select pickup, destination and seats."],
    ["02", "We find a match", "Compatible rides can share the same Tesla."],
    ["03", "Pay less", "Pooled trips can receive a fare discount."],
  ];

  return (
    <aside className="rounded-3xl border border-white/5 bg-slate-900/50 p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        How pooling works
      </p>

      <div className="mt-6 space-y-6">
        {steps.map(([number, title, description]) => (
          <div key={number} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-950 text-[10px] font-bold text-cyan-300">
              {number}
            </span>

            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
