import Graph from "./graph/Graph.jsx";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PriceRange from "./PriceRange.jsx";

function CompanyPage() {
    const [company, setCompany] = useState(null);
    const { companyId } = useParams();

    useEffect(() => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;

        fetch(`${baseUrl}/company/${companyId}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("Failed to fetch company");
                }

                return res.json();
            })
            .then((data) => {
                setCompany(data);
                console.log(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, [companyId]);

    if (!company) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">
                    Loading company...
                </div>
            </div>
        );
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: company.currency || "INR",
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatMarketCap = (value) => {
        if (value >= 1_00_000_00_000_00_000) {
            return `₹${(value / 1_00_000_00_000_00_000).toFixed(2)} L Cr`;
        }

        if (value >= 1_00_000_00_000) {
            return `₹${(value / 1_00_000_00_000).toFixed(2)} Cr`;
        }

        return formatCurrency(value);
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">

            {/* ================= COMPANY HEADER ================= */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">

                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                    {/* Left Side */}
                    <div className="flex items-center gap-4">

                        {/* Logo Placeholder */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl font-bold text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
                            {company.symbol?.substring(0, 2)}
                        </div>

                        {/* Company Info */}
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {company.name}
                                </h1>

                                <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-gray-300">
                                    {company.symbol}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                    {company.exchange}
                                </span>

                                <span className="text-gray-300 dark:text-zinc-700">
                                    •
                                </span>

                                <span className="text-gray-500 dark:text-gray-400">
                                    {company.sector}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="lg:text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Current Price
                        </p>

                        <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(company.currentPrice)}
                        </p>

                        <p
                            className={`mt-1 text-sm font-medium ${
                                company.changes?.TWENTY_FOUR_HOURS >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            }`}
                        >
                            {company.changes?.TWENTY_FOUR_HOURS >= 0 ? "+" : ""}
                            {company.changes?.TWENTY_FOUR_HOURS ?? 0}%
                            <span className="ml-1 text-gray-400">
                                Today
                            </span>
                        </p>
                    </div>
                </div>
            </div>


            {/* ================= CHART SECTION ================= */}

            <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                <div className="h-[520px] w-full">
                    <Graph  companySymbol={company.symbol} companyId={company.id} />
                </div>
            </div>


            {/* ================= QUICK STATS ================= */}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

                <StatCard
                    label="Market Cap"
                    value={formatMarketCap(company.marketCap)}
                />

                <StatCard
                    label="P/E Ratio"
                    value={company.fundamentals?.peRatio ?? "-"}
                />

                <StatCard
                    label="EPS"
                    value={company.fundamentals?.eps ?? "-"}
                />

                <StatCard
                    label="Dividend Yield"
                    value={
                        company.fundamentals?.dividendYield != null
                            ? `${company.fundamentals.dividendYield}%`
                            : "-"
                    }
                />

            </div>


            {/* ================= BOTTOM SECTION ================= */}

            <div className="grid gap-6 lg:grid-cols-3">

                {/* About */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        About {company.name}
                    </h2>

                    <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-400">
                        {company.description}
                    </p>
                </div>


                {/* Company Details */}

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Company Details
                    </h2>

                    <div className="mt-5 space-y-4">

                        <DetailRow
                            label="Founded"
                            value={company.foundedYear}
                        />

                        <DetailRow
                            label="Employees"
                            value={company.employees?.toLocaleString()}
                        />

                        <DetailRow
                            label="Exchange"
                            value={company.exchange}
                        />

                        <DetailRow
                            label="Sector"
                            value={company.sector}
                        />

                        <DetailRow
                            label="Currency"
                            value={company.currency}
                        />

                    </div>
                </div>

            </div>


            {/* ================= PRICE CHANGES ================= */}

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Price Performance
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                    <ChangeCard
                        label="1 Hour"
                        value={company.changes?.ONE_HOUR}
                    />

                    <ChangeCard
                        label="6 Hours"
                        value={company.changes?.SIX_HOUR}
                    />

                    <ChangeCard
                        label="1 Day"
                        value={company.changes?.TWENTY_FOUR_HOURS}
                    />

                    <ChangeCard
                        label="1 Week"
                        value={company.changes?.ONE_WEEK}
                    />

                    <ChangeCard
                        label="1 Month"
                        value={company.changes?.ONE_MONTH}
                    />

                    <ChangeCard
                        label="1 Year"
                        value={company.changes?.ONE_YEAR}
                    />

                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <PriceRange
                    label="1 Hour Range"
                    range={company.ranges?.ONE_HOUR}
                    currentPrice={company.currentPrice}
                    currency={company.currency}
                />

                <PriceRange
                    label="6 Hour Range"
                    range={company.ranges?.SIX_HOUR}
                    currentPrice={company.currentPrice}
                    currency={company.currency}
                />

                <PriceRange
                    label="24 Hour Range"
                    range={company.ranges?.TWENTY_FOUR_HOURS}
                    currentPrice={company.currentPrice}
                    currency={company.currency}
                />

                <PriceRange
                    label="1 Week Range"
                    range={company.ranges?.ONE_WEEK}
                    currentPrice={company.currentPrice}
                    currency={company.currency}
                />

                <PriceRange
                    label="1 Month Range"
                    range={company.ranges?.ONE_MONTH}
                    currentPrice={company.currentPrice}
                    currency={company.currency}
                />

                <PriceRange
                    label="1 Year Range"
                    range={company.ranges?.ONE_YEAR}
                    currentPrice={company.currentPrice}
                    currency={company.currency}
                />

            </div>

        </div>
    );
}


function StatCard({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                {label}
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                {value}
            </p>
        </div>
    );
}


function DetailRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">

            <span className="text-sm text-gray-500 dark:text-gray-400">
                {label}
            </span>

            <span className="text-sm font-medium text-gray-900 dark:text-white">
                {value ?? "-"}
            </span>

        </div>
    );
}


function ChangeCard({ label, value }) {
    const isPositive = value >= 0;

    return (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-zinc-800/60">

            <p className="text-xs text-gray-500 dark:text-gray-400">
                {label}
            </p>

            <p
                className={`mt-2 font-semibold ${
                    isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                }`}
            >
                {isPositive ? "+" : ""}
                {value ?? 0}%
            </p>

        </div>
    );
}


export default CompanyPage;