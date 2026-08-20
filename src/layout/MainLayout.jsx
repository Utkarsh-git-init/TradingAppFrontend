import {Outlet} from "react-router-dom";
import Header from "./Header/Header.jsx";

function MainLayout() {


    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}
export default MainLayout;