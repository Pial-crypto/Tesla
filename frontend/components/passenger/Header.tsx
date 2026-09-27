import { User } from "@/types/auth"

export const Header=({logout,user}:{
    logout:()=>void,
    user:User
})=>{
    return(
        <header className="sticky top-0 z-20 border-b border-white/5 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-lg font-black text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.2)]">
              T
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Dhaka Tesla Pool</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Passenger dashboard
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-[11px] text-slate-500">Passenger</p>
            </div>
            <button
              onClick={logout}
              type="button"
              className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
    )
}