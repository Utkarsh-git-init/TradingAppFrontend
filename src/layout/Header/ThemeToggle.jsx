import {IoMoon, IoSunny} from "react-icons/io5";
import {useTheme} from "../../context/theme/ThemeProvider.jsx";

function ThemeToggle(){
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === "dark";
    return (
        <div className="flex items-center gap-3 p-4">

            {/* Theme Toggle */}
            <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Toggle theme"
                onClick={toggleTheme}
                className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full p-1
                        transition-colors duration-300 ease-in-out
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${isDark ? "bg-blue-600" : "bg-gray-300"}`}
            >
                {/* Icons inside switch */}
                <span className="absolute inset-0 flex items-center justify-between px-1.5 text-sm">
                        <IoSunny

                            className={`transition-opacity duration-300 ${
                                isDark ? "opacity-40" : "opacity-100"
                            }`}
                        />

                        <IoMoon

                            className={`transition-opacity duration-300 ${
                                isDark ? "opacity-100" : "opacity-40"
                            }`}
                        />


                    </span>

                {/* Movable knob */}
                <span
                    className={`relative z-10 block h-6 w-6 transform rounded-full
                            bg-white shadow-md
                            transition-transform duration-300 ease-in-out
                            ${isDark ? "translate-x-6" : "translate-x-0"}`}
                />
            </button>

        </div>
    )
}
export default ThemeToggle