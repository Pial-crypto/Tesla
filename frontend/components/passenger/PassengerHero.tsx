export const PassengerHero = ({active}: {active: boolean}) => {
    return(
        <section className="mb-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
            Passenger
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {active ? "Your ride is on the way." : "Where are you going?"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Request a Tesla, see your estimated fare, and follow every step of
            your journey in real time.
          </p>
        </section>
    )
}