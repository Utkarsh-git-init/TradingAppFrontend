import {Outlet} from "react-router-dom";
import {useEffect, useState} from "react";

function MainPage() {
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    return (
        <>
            <div>
                <button
                    onClick={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                    }
                >
                    Toggle Theme
                </button>
            </div>
            heloo this is layout
            <Outlet/>
        </>
    )
}
export default MainPage;