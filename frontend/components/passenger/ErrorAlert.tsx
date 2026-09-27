export const ErrorAlert = ({error}: {error: string}) => {
    return(
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <span className="mt-0.5">⚠</span>

            <div>
              <p className="font-semibold">
                Something went wrong
              </p>

              <p className="mt-0.5 text-red-200/70">
                {error}
              </p>
            </div>
          </div>
    )
}