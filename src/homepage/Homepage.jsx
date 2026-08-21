import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Homepage() {
    const [market, setMarket] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);

    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [priceData, setPriceData] = useState({
        current: new Map(),
        previous: new Map(),
    });

    useEffect(() => {
        fetch(baseUrl + "/market")
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to load market");
                }
                return res.json();
            })
            .then((data) => {
                setMarket(data.market);
                setCompanies(data.companies);

                setPriceData({
                    current: new Map(
                        data.companies.map((company) => [
                            company.id,
                            company.currentPrice,
                        ])
                    ),
                    previous: new Map(),
                });

                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [baseUrl]);

    useEffect(() => {
        const eventSource = new EventSource(baseUrl + "/stream/prices");

        eventSource.onmessage = (event) => {
            const prices = JSON.parse(event.data);

            setPriceData((prev) => ({
                previous: prev.current,
                current: new Map(
                    prices.map((price) => [price.companyId, price.currentPrice])
                ),
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
        return priceData.current.get(company.id) ?? company.currentPrice;
    };

    const getPriceDirection = (company) => {
        const currentPrice = priceData.current.get(company.id);
        const previousPrice = priceData.previous.get(company.id);

        if (currentPrice == null || previousPrice == null) {
            return "neutral";
        }
        if (currentPrice > previousPrice) {
            return "up";
        }
        if (currentPrice < previousPrice) {
            return "down";
        }
        return "neutral";
    };

    const getLivePriceClass = (company) => {
        const direction = getPriceDirection(company);

        if (direction === "up") {
            return "text-[#00C853]";
        }
        if (direction === "down") {
            return "text-[#FF1744]";
        }
        return "text-gray-900 dark:text-white";
    };

    const getChangeClass = (change) => {
        if (change > 0) {
            return "text-[#00C853]";
        }
        if (change < 0) {
            return "text-[#FF1744]";
        }
        return "text-gray-500 dark:text-gray-400";
    };

    const formatPrice = (price) => {
        if (price == null) {
            return "-";
        }

        return Number(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const validCompanies = companies.filter(
        (company) => company.twentyFourHourChangePercent != null
    );

    const topGainers = [...validCompanies]
        .filter((company) => company.twentyFourHourChangePercent > 0)
        .sort(
            (a, b) =>
                b.twentyFourHourChangePercent - a.twentyFourHourChangePercent
        )
        .slice(0, 3);

    const topLosers = [...validCompanies]
        .filter((company) => company.twentyFourHourChangePercent < 0)
        .sort(
            (a, b) =>
                a.twentyFourHourChangePercent - b.twentyFourHourChangePercent
        )
        .slice(0, 3);

    if (loading) {
        return (
            <div className="flex min-h-[80vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                    <p className="text-zinc-500">Loading market...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen px-3 py-5 sm:px-5 sm:py-6 md:px-8 lg:px-10">
            {/* HERO */}
            <section className="mb-6 sm:mb-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-[#00C853]" />
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                LIVE MARKET
              </span>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                            Market Overview
                        </h1>

                        <p className="mt-2 hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block md:text-base">
                            Explore companies and follow live price movements.
                        </p>
                    </div>

                    <div className="shrink-0 text-right">
                        <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                            Companies
                        </p>
                        <p className="text-2xl font-bold sm:text-3xl">
                            {market?.totalCompanies ?? companies.length}
                        </p>
                    </div>
                </div>
            </section>

            {/* MARKET OVERVIEW */}
            {market && (
                <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
                    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl sm:p-4">
                        <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                            Gainers
                        </p>
                        <p className="mt-2 text-xl font-bold text-[#00C853] sm:text-2xl">
                            {market.gainers ?? "-"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl sm:p-4">
                        <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                            Losers
                        </p>
                        <p className="mt-2 text-xl font-bold text-[#FF1744] sm:text-2xl">
                            {market.losers ?? "-"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl sm:p-4">
                        <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                            Unchanged
                        </p>
                        <p className="mt-2 text-xl font-bold sm:text-2xl">
                            {market.unchanged ?? "-"}
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl sm:p-4">
                        <p className="text-[10px] uppercase tracking-wide text-zinc-500 sm:text-xs">
                            Average 24h
                        </p>
                        <p
                            className={`mt-2 text-xl font-bold sm:text-2xl ${getChangeClass(
                                market.averageChangePercent
                            )}`}
                        >
                            {market.averageChangePercent > 0 ? "+" : ""}
                            {market.averageChangePercent ?? "-"}%
                        </p>
                    </div>
                </section>
            )}

            {/* TOP GAINERS AND LOSERS */}
            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* TOP GAINERS */}
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-700/60">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-zinc-500">
                                Market Movers
                            </p>
                            <h2 className="mt-1 text-lg font-semibold">Top Gainers</h2>
                        </div>

                        <span className="rounded-full bg-[#00C853]/10 px-2.5 py-1 text-xs font-semibold text-[#00C853]">
              ↑ 24h
            </span>
                    </div>

                    <div>
                        {topGainers.length > 0 ? (
                            topGainers.map((company) => {
                                const currentPrice = getPrice(company);
                                const livePriceClass = getLivePriceClass(company);

                                return (
                                    <Link
                                        key={company.id}
                                        to={`/company/${company.id}`}
                                        className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 transition last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-white/[0.03]"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {company.name}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                {company.symbol}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={`font-mono text-sm font-medium transition-colors duration-300 ${livePriceClass}`}
                                            >
                                                ₹{formatPrice(currentPrice)}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-[#00C853]">
                                                +{company.twentyFourHourChangePercent}%
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-zinc-500">
                                No gainers available
                            </div>
                        )}
                    </div>
                </div>

                {/* TOP LOSERS */}
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl">
                    <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 dark:border-zinc-700/60">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-zinc-500">
                                Market Movers
                            </p>
                            <h2 className="mt-1 text-lg font-semibold">Top Losers</h2>
                        </div>

                        <span className="rounded-full bg-[#FF1744]/10 px-2.5 py-1 text-xs font-semibold text-[#FF1744]">
              ↓ 24h
            </span>
                    </div>

                    <div>
                        {topLosers.length > 0 ? (
                            topLosers.map((company) => {
                                const currentPrice = getPrice(company);
                                const livePriceClass = getLivePriceClass(company);

                                return (
                                    <Link
                                        key={company.id}
                                        to={`/company/${company.id}`}
                                        className="flex items-center justify-between gap-4 border-b border-zinc-100 px-4 py-3 transition last:border-b-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-white/[0.03]"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {company.name}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                {company.symbol}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p
                                                className={`font-mono text-sm font-medium transition-colors duration-300 ${livePriceClass}`}
                                            >
                                                ₹{formatPrice(currentPrice)}
                                            </p>
                                            <p className="mt-1 text-xs font-semibold text-[#FF1744]">
                                                {company.twentyFourHourChangePercent}%
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-zinc-500">
                                No losers available
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* COMPANY LIST */}
            <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-800/40 sm:rounded-2xl">
                <div className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center border-b border-zinc-200 px-3 py-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-700/60 dark:text-zinc-400 sm:grid-cols-[45px_2fr_1fr_130px] sm:px-4 sm:py-4 sm:text-xs lg:grid-cols-[50px_2fr_1fr_1fr_150px]">
                    <span>#</span>
                    <span>Company</span>
                    <span className="hidden sm:block">Sector</span>
                    <span className="hidden lg:block">Symbol</span>
                    <span className="text-right">Price</span>
                </div>

                <div>
                    {companies.map((company) => {
                        const currentPrice = getPrice(company);
                        const livePriceClass = getLivePriceClass(company);
                        const change = company.twentyFourHourChange;
                        const changePercent = company.twentyFourHourChangePercent;

                        return (
                            <Link
                                key={company.id}
                                to={`/company/${company.id}`}
                                className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center border-b border-zinc-100 px-3 py-3 transition hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-white/[0.03] dark:active:bg-white/[0.05] sm:grid-cols-[45px_2fr_1fr_130px] sm:px-4 sm:py-4 lg:grid-cols-[50px_2fr_1fr_1fr_150px]"
                            >
                <span className="text-xs text-zinc-400 sm:text-sm">
                  {String(company.id).padStart(2, "0")}
                </span>

                                <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold sm:text-base">
                                        {company.name}
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400 sm:hidden">
                                        <span>{company.symbol}</span>
                                        <span className="h-1 w-1 rounded-full bg-zinc-500" />
                                        <span className="truncate">{company.sector}</span>
                                    </div>

                                    {changePercent != null && (
                                        <div
                                            className={`mt-1 text-[10px] font-medium sm:hidden ${getChangeClass(
                                                change
                                            )}`}
                                        >
                                            {change > 0 ? "+" : ""}
                                            ₹{formatPrice(change)} ({changePercent > 0 ? "+" : ""}
                                            {changePercent}%)
                                        </div>
                                    )}
                                </div>

                                <span className="hidden truncate text-xs text-zinc-500 dark:text-zinc-400 sm:block md:text-sm">
                  {company.sector}
                </span>

                                <span className="hidden font-mono text-sm text-zinc-500 dark:text-zinc-400 lg:block">
                  {company.symbol}
                </span>

                                <div className="shrink-0 pl-2 text-right">
                                    <div
                                        className={`font-mono text-sm font-semibold transition-colors duration-300 sm:text-base ${livePriceClass}`}
                                    >
                                        ₹{formatPrice(currentPrice)}
                                    </div>

                                    {changePercent != null && (
                                        <div
                                            className={`mt-1 hidden text-[10px] sm:block sm:text-xs ${getChangeClass(
                                                change
                                            )}`}
                                        >
                                            {change > 0 ? "+" : ""}
                                            ₹{formatPrice(change)} ({changePercent > 0 ? "+" : ""}
                                            {changePercent}%)
                                        </div>
                                    )}

                                    <div className="mt-1 hidden text-[10px] text-zinc-500 lg:block">
                                        {company.exchange}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* FOOTER */}
            <section className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 sm:text-xs">
        <span>
          {market?.totalCompanies ?? companies.length} companies
        </span>

                <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C853]" />
                    <span>Prices update live</span>
                </div>
            </section>
        </main>
    );
}

export default Homepage;