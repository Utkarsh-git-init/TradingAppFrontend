import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Homepage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [priceData, setPriceData] = useState({
        current: new Map(),
        previous: new Map()
    });

    useEffect(() => {
        fetch(baseUrl + "/company")
            .then(res => res.json())
            .then(data => {
                setCompanies(data);

                setPriceData({
                    current: new Map(
                        data.map(company => [
                            company.id,
                            company.currentPrice
                        ])
                    ),
                    previous: new Map()
                });

                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
    }, [baseUrl]);


    useEffect(() => {
        const eventSource = new EventSource(
            baseUrl + "/stream/prices"
        );

        eventSource.onmessage = (event) => {
            const prices = JSON.parse(event.data);

            setPriceData(prev => ({
                previous: prev.current,
                current: new Map(
                    prices.map(price => [
                        price.companyId,
                        price.currentPrice
                    ])
                )
            }));
        };

        eventSource.onerror = (event) => {
            console.error("SSE Error:", event);
        };

        return () => {
            eventSource.close();
        };
    }, [baseUrl]);


    const getPrice = (company) => {
        return priceData.current.get(company.id)
            ?? company.currentPrice;
    };


    const getPriceDirection = (company) => {
        const currentPrice =
            priceData.current.get(company.id);

        const previousPrice =
            priceData.previous.get(company.id);

        if (currentPrice == null || previousPrice == null) {
            return "neutral";
        }

        if (currentPrice > previousPrice) return "up";
        if (currentPrice < previousPrice) return "down";

        return "neutral";
    };


    if (loading) {
        return (
            <div className="
                min-h-[80vh]
                flex
                items-center
                justify-center
            ">
                <div className="text-center">

                    <div className="
                        w-8
                        h-8
                        border-2
                        border-gray-400
                        border-t-transparent
                        rounded-full
                        animate-spin
                        mx-auto
                        mb-3
                    " />

                    <p className="text-gray-500">
                        Loading market...
                    </p>

                </div>
            </div>
        );
    }


    return (
        <main className="
            min-h-screen
            px-3
            py-5
            sm:px-5
            sm:py-6
            md:px-8
            lg:px-10
        ">


            {/* HERO */}
            <section className="mb-6 sm:mb-8">

                <div className="
                    flex
                    items-end
                    justify-between
                    gap-4
                ">

                    <div>

                        {/* LIVE STATUS */}
                        <div className="
                            flex
                            items-center
                            gap-2
                            mb-2
                        ">
                            <span className="
                                w-2
                                h-2
                                rounded-full
                                bg-[#00C853]
                                animate-pulse
                            " />

                            <span className="
                                text-xs
                                sm:text-sm
                                text-gray-500
                                dark:text-gray-400
                            ">
                                LIVE MARKET
                            </span>
                        </div>


                        <h1 className="
                            text-2xl
                            sm:text-3xl
                            md:text-4xl
                            font-bold
                            tracking-tight
                        ">
                            Market Overview
                        </h1>


                        <p className="
                            hidden
                            sm:block
                            mt-2
                            text-sm
                            md:text-base
                            text-gray-500
                            dark:text-gray-400
                        ">
                            Explore companies and follow live price movements.
                        </p>

                    </div>


                    {/* COMPANY COUNT */}
                    <div className="
                        text-right
                        shrink-0
                    ">

                        <p className="
                            text-[10px]
                            sm:text-xs
                            uppercase
                            tracking-wide
                            text-gray-500
                        ">
                            Companies
                        </p>

                        <p className="
                            text-2xl
                            sm:text-3xl
                            font-bold
                        ">
                            {companies.length}
                        </p>

                    </div>

                </div>

            </section>


            {/* COMPANY LIST */}
            <section className="
                rounded-xl
                sm:rounded-2xl
                border
                border-gray-200
                dark:border-gray-800
                overflow-hidden
            ">


                {/* TABLE HEADER */}
                <div className="
                    grid
                    grid-cols-[28px_minmax(0,1fr)_auto]
                    sm:grid-cols-[45px_2fr_1fr_130px]
                    lg:grid-cols-[50px_2fr_1fr_1fr_150px]

                    items-center

                    px-3
                    py-3

                    sm:px-4
                    sm:py-4

                    text-[10px]
                    sm:text-xs

                    font-semibold
                    uppercase
                    tracking-wider

                    text-gray-500
                    dark:text-gray-400

                    border-b
                    border-gray-200
                    dark:border-gray-800
                ">

                    <span>#</span>

                    <span>Company</span>

                    <span className="hidden sm:block">
                        Sector
                    </span>

                    <span className="hidden lg:block">
                        Symbol
                    </span>

                    <span className="text-right">
                        Price
                    </span>

                </div>


                {/* COMPANIES */}
                <div>

                    {companies.map((company) => {

                        const currentPrice =
                            getPrice(company);

                        const direction =
                            getPriceDirection(company);


                        const priceClass =
                            direction === "up"
                                ? "text-[#00C853]"
                                : direction === "down"
                                    ? "text-[#FF1744]"
                                    : "text-gray-900 dark:text-white";


                        return (
                            <Link
                                key={company.id}
                                to={`/company/${company.id}`}

                                className="
                                    grid

                                    grid-cols-[28px_minmax(0,1fr)_auto]

                                    sm:grid-cols-[45px_2fr_1fr_130px]

                                    lg:grid-cols-[50px_2fr_1fr_1fr_150px]

                                    items-center

                                    px-3
                                    py-3

                                    sm:px-4
                                    sm:py-4

                                    border-b
                                    border-gray-100
                                    dark:border-gray-800

                                    transition

                                    hover:bg-gray-50
                                    dark:hover:bg-white/[0.03]

                                    active:bg-gray-100
                                    dark:active:bg-white/[0.05]
                                "
                            >


                                {/* NUMBER */}
                                <span className="
                                    text-xs
                                    sm:text-sm
                                    text-gray-400
                                ">
                                    {String(company.id).padStart(
                                        2,
                                        "0"
                                    )}
                                </span>


                                {/* COMPANY */}
                                <div className="min-w-0">

                                    <div className="
                                        font-semibold
                                        text-sm
                                        sm:text-base

                                        truncate
                                    ">
                                        {company.name}
                                    </div>


                                    {/* MOBILE INFO */}
                                    <div className="
                                        flex
                                        items-center
                                        gap-2

                                        mt-1

                                        text-[10px]
                                        sm:hidden

                                        text-gray-500
                                        dark:text-gray-400
                                    ">

                                        <span>
                                            {company.symbol}
                                        </span>

                                        <span className="
                                            w-1
                                            h-1
                                            rounded-full
                                            bg-gray-500
                                        " />

                                        <span className="truncate">
                                            {company.sector}
                                        </span>

                                    </div>


                                    {/* EXCHANGE FOR MOBILE */}
                                    <div className="
                                        text-[10px]
                                        text-gray-500
                                        mt-1
                                        sm:hidden
                                    ">
                                        {company.exchange}
                                    </div>

                                </div>


                                {/* SECTOR */}
                                <span className="
                                    hidden
                                    sm:block

                                    text-xs
                                    md:text-sm

                                    truncate

                                    text-gray-500
                                    dark:text-gray-400
                                ">
                                    {company.sector}
                                </span>


                                {/* SYMBOL */}
                                <span className="
                                    hidden
                                    lg:block

                                    text-sm
                                    font-mono

                                    text-gray-500
                                    dark:text-gray-400
                                ">
                                    {company.symbol}
                                </span>


                                {/* PRICE */}
                                <div className="
                                    text-right
                                    pl-2
                                    shrink-0
                                ">

                                    <div
                                        className={`
                                            font-semibold
                                            font-mono

                                            text-sm
                                            sm:text-base

                                            transition-colors
                                            duration-300

                                            ${priceClass}
                                        `}
                                    >
                                        ₹{
                                        Number(
                                            currentPrice
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )
                                    }
                                    </div>


                                    <div className="
                                        hidden
                                        sm:block

                                        text-[10px]
                                        sm:text-xs

                                        text-gray-500

                                        mt-1
                                    ">
                                        {company.exchange}
                                    </div>

                                </div>

                            </Link>
                        );
                    })}

                </div>

            </section>


            {/* FOOTER */}
            <section className="
                mt-4
                flex
                items-center
                justify-between

                text-[10px]
                sm:text-xs

                text-gray-500
            ">

                <span>
                    {companies.length} companies
                </span>

                <div className="
                    flex
                    items-center
                    gap-1.5
                ">
                    <span className="
                        w-1.5
                        h-1.5
                        rounded-full
                        bg-[#00C853]
                    " />

                    <span>
                        Prices update live
                    </span>
                </div>

            </section>

        </main>
    );
}

export default Homepage;