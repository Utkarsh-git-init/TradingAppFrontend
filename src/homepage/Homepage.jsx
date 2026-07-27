import {useEffect, useState} from "react";

function Homepage() {
    const [companies, setCompanies] = useState([]);
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);
    const baseUrl=import.meta.env.VITE_API_BASE_URL;
    useEffect(() => {
        fetch(baseUrl+"/company",{
            method:'GET',
        }).then(res=>res.json())
        .then(data=>{
            console.log(data);
            setCompanies(data);
        })
    }, [baseUrl]);
    const [livePrices, setLivePrices] = useState([]);
    useEffect(() => {
        const eventSource=new EventSource(
            baseUrl+'/stream/prices',
        )
        eventSource.onmessage=(event)=>{
            const prices=JSON.parse(event.data);
            setLivePrices(prices);
        }
        eventSource.onerror=(event)=>{
            console.error(event)
        }
        return () => {
            eventSource.close()
        }
    },[baseUrl])


    return (
        <div>
            {
                companies.map((company) => {
                    const matchedItem=livePrices.find((live) => live?.companyId=== company.id);
                    return (
                        <div key={company.id}>
                            {company.id}---
                            {company.name}   ---
                            {company.currentPrice}
                            ----
                            {matchedItem?.companyId}
                            ----
                            livePrices
                            ----
                            {matchedItem?.currentPrice}
                        </div>
                    )
                })
            }
            <div>
                <button
                    onClick={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                    }
                >
                    Toggle Theme
                </button>
            </div>
        </div>
    )
}
export default Homepage