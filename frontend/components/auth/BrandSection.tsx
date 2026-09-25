export const BrandSection = () => {
    return(
          <section className="relative hidden overflow-hidden px-12 py-16 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-xl font-bold text-[#07111f]">
                T
              </div>

              <div>
                <p className="text-lg font-semibold">
                  Dhaka Tesla Pool
                </p>

                <p className="text-xs text-slate-400">
                  Smarter rides across Dhaka
                </p>
              </div>
            </div>

            <div className="mt-20 max-w-xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
                Ride together
              </p>

              <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
                Share a seat.
                <br />
                Split the fare.
                <br />
                <span className="text-cyan-300">
                  Beat the traffic.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
                Dhaka Tesla Pool connects passengers heading in
                similar directions and helps drivers fill
                available seats efficiently.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xl font-semibold">1</p>
              <p className="mt-1 text-xs text-slate-400">
                Request a ride
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xl font-semibold">2</p>
              <p className="mt-1 text-xs text-slate-400">
                Join a pool
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-xl font-semibold">3</p>
              <p className="mt-1 text-xs text-slate-400">
                Split the fare
              </p>
            </div>
          </div>
        </section>
    )
}