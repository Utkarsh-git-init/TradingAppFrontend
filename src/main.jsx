import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {BrowserRouter} from "react-router-dom";
import {ThemeProvider} from "./context/theme/ThemeProvider.jsx";
import {AuthProvider} from "./context/auth/AuthProvider.jsx";

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthProvider>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </AuthProvider>
    </BrowserRouter>

)
