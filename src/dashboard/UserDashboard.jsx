import {useAuth} from "../context/auth/UseAuth.jsx";
import { IoIosLogOut } from "react-icons/io";

function UserDashboard() {
    const {user,logout} =useAuth()
    return (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
            {/* Status / WIP Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Work in Progress
            </div>

            {/* Welcome Heading */}
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
                Welcome, <span className="text-blue-600 dark:text-blue-400">{user.username}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                Your dashboard is currently under construction. Check back soon for live updates.
            </p>

            {/* Action / Logout */}
            <div className="mt-8">
                <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-red-500/30 hover:bg-red-50 hover:text-red-600 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                >
                    <IoIosLogOut size={20}/>
                    Sign out
                </button>
            </div>
        </div>
    )
}

export default UserDashboard;