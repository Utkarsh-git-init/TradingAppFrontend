import './App.css'
import Homepage from "./homepage/Homepage.jsx";
import {Route, Routes} from "react-router-dom";
import MainLayout from "./layout/MainLayout.jsx";
import CompanyPage from "./companyPage/CompanyPage.jsx";

function App() {

    return (
        <div className="dark:bg-zinc-900 dark:text-white">
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path="/" element={<Homepage/>}/>
                    <Route path="/company/:companyId" element={<CompanyPage/>}/>
                </Route>
            </Routes>
        </div>
    )
}

export default App
