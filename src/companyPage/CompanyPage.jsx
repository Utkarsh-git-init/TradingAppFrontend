import Graph from "./graph/Graph.jsx";
import {useTheme} from "../context/theme/ThemeProvider.jsx";
import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";

function CompanyPage() {
    const theme = useTheme();
    const [coompany, setCoompany] = useState(null);
    const {companyId} = useParams();
    useEffect(() => {
        const baseUrl=import.meta.env.VITE_API_BASE_URL;
        fetch(baseUrl+"/company/"+companyId,{
            method: "GET",
        }).then(res => res.json())
            .then(data=>{
                setCoompany(data);
                console.log(data);
            })
    }, [companyId]);
    return (
        <>
            <div className="p-2 lg:pl-13">
                <label className="text-xl">
                    {coompany?.name}
                </label>
            </div>
            <Graph/>
        </>

    );
}

export default CompanyPage;