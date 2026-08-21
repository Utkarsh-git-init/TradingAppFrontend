import ThemeToggle from "./ThemeToggle.jsx";
import {Link} from "react-router-dom";
import {useAuth} from "../../context/auth/UseAuth.jsx";
import { IoLogInOutline } from "react-icons/io5";
import { MdAccountCircle } from "react-icons/md";

function Header() {
    const {user}= useAuth()

    return (
        <div className="flex flex-row flex-wrap items-center justify-between
        pl-2 pr-2
        lg:pr-10 lg:pl-10
        ">
    {/*        <Link to="/" className="group inline-flex items-center gap-2.5 outline-none">*/}
    {/*            /!* Icon Badge *!/*/}
    {/*            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-md shadow-blue-500/20 transition-transform duration-200 group-hover:scale-105">*/}
    {/*                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">*/}
    {/*                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />*/}
    {/*                    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-5 5-4-4-3 3" />*/}
    {/*                </svg>*/}
    {/*            </div>*/}

    {/*            /!* Brand Text *!/*/}
    {/*            <span className="text-xl font-extrabold tracking-tight text-zinc-900 transition-colors dark:text-zinc-50">*/}
    {/*    TRADE<span className="text-blue-600 dark:text-blue-500">CURSE</span>*/}
    {/*</span>*/}
    {/*        </Link>*/}

            <Link to="/" className="inline-block outline-none">
    <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 bg-clip-text text-2xl font-black tracking-tight text-transparent transition-opacity hover:opacity-90">
        TRADECURSE
    </span>
            </Link>
            <div className="flex flex-row items-center">
                <ThemeToggle/>
                <div>
                    <Link to={user ? "/dashboard" : "/login"}>
                        {
                            user?
                                <MdAccountCircle size={40}/>
                                :
                                <IoLogInOutline size={40}/>
                        }
                    </Link>
                </div>
            </div>
        </div>
    )
}
export default Header;