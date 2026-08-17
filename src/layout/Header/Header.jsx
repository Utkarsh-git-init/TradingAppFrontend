import ThemeToggle from "./ThemeToggle.jsx";
import {Link} from "react-router-dom";

function Header() {

    return (
        <div className="flex flex-row flex-wrap items-center justify-between
        pl-2 pr-2
        lg:pr-10 lg:pl-10
        ">
            <div>
                <Link to="/">
                    <span className="text-2xl">TRADECURSE</span>
                </Link>

            </div>
            <ThemeToggle/>
        </div>
    )
}
export default Header;