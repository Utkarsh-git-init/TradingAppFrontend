import ThemeToggle from "./ThemeToggle.jsx";

function Header() {

    return (
        <div className="flex flex-row flex-wrap items-center justify-between
        pl-2 pr-2
        lg:pr-10 lg:pl-10
        ">
            <div>
                <span className="text-2xl">TRADECURSE</span>
            </div>
            <ThemeToggle/>
        </div>
    )
}
export default Header;