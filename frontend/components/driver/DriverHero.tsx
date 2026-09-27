interface DriverHeroProps {
  driverName?: string;
}

export default function DriverHero({
  driverName,
}: DriverHeroProps) {
  return (
    <section className="rounded-3xl bg-black px-6 py-8 text-white shadow-sm sm:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-white/60">
          Driver Dashboard
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome{driverName ? `, ${driverName}` : ""}
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
          Manage ride requests, handle your current pool,
          and review completed trips from one place.
        </p>
      </div>
    </section>
  );
}