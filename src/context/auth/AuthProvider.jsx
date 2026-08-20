import {useEffect, useState} from "react";
import {AuthContext} from "./AuthContext";
import {useNavigate} from "react-router-dom";

export function AuthProvider({ children }) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(baseUrl + "/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    localStorage.removeItem("token");
                    setUser(null);
                    return;
                }

                const userData = await response.json();

                setUser(userData);
            } catch (error) {
                console.error("Failed to authenticate user", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, [baseUrl]);

    function logout() {
        localStorage.removeItem("token");
        navigate("/login");
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}