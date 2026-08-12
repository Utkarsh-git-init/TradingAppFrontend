import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

function Homepage() {
    const [companies, setCompanies] = useState([]);

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
        <div className="min-h-screen
        pr-2 pl-2
        md:pr-4 md:pl:4 lg:pr-10 lg:pl-10
        ">
            <div className="grid grid-cols-[1fr_4fr_4fr_2fr] p-1 lg:p-2">
                <div >
                    <span>#</span>
                </div>
                <div>
                    <span>Name</span>
                </div>
                <div>
                    <span>Sector</span>
                </div>
                <div>
                    <span>Price</span>
                </div>
            </div>
            <hr className={"border-t-gray-500"}/>
            <div>
                {
                    companies.map((company) => {
                        const matchedItem=livePrices.find((live) => live?.companyId=== company.id);
                        return (
                            <div key={company.id}>
                                <div className="grid grid-cols-[1fr_4fr_4fr_2fr]
                                p-1 lg:p-2">
                                    <div >
                                        <span>{company.id}</span>
                                    </div>
                                    <div>
                                        <Link to={`/company/${company.id}`}>
                                            <span>{company.name}</span>
                                        </Link>

                                    </div>
                                    <div>
                                        <span>{company.sector}</span>
                                    </div>
                                    <div>
                                        <span>{matchedItem?.currentPrice}</span>
                                    </div>
                                </div>
                                <hr className={"border-t-gray-500"}/>
                            </div>

                        )
                    })
                }
            </div>
        </div>
    )
}
export default Homepage