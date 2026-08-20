import './App.css'
import Homepage from "./homepage/Homepage.jsx";
import {Route, Routes} from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import CompanyPage from "./companyPage/CompanyPage.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import RegisterPage from "./auth/RegisterPage.jsx";
import UserDashboard from "./dashboard/UserDashboard.jsx";

function App() {

    return (
        <div className="bg-zinc-100 dark:bg-zinc-950 dark:text-white min-h-screen flex flex-col ">
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Homepage/>}/>
                    <Route path="/company/:companyId" element={<CompanyPage/>}/>
                    <Route path="/dashboard" element={<UserDashboard/>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                </Route>

            </Routes>
        </div>
    )
}

export default App
