import { useEffect, useRef, useState } from "react";
import {
    createChart,
    CandlestickSeries,
    LineSeries,
    AreaSeries,
} from "lightweight-charts";
import { useTheme } from "../../context/theme/ThemeProvider.jsx";

function Graph({ companySymbol, companyId, currentPrice }) {
    const { theme } = useTheme();

    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [interval, setInterval] = useState("1h");
    const [chartType, setChartType] = useState("area");
    const [candles, setCandles] = useState([]);

    const intervals = ["1h", "6h", "24h", "1w", "1m"];

    const chartTypes = [
        { key: "area", label: "Area" },
        { key: "line", label: "Line" },
        { key: "candle", label: "Candle" },
    ];

    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    // Holds all candles currently displayed.
    // The LAST candle is always the currently-forming candle.
    const candlesRef = useRef([]);

    // SSE should stay connected when interval changes.
    const intervalRef = useRef(interval);

    // --------------------------------------------------
    // Keep intervalRef synchronized with interval
    // --------------------------------------------------

    useEffect(() => {
        intervalRef.current = interval;
    }, [interval]);

    // --------------------------------------------------
    // Get candle duration in seconds
    // --------------------------------------------------

    function getIntervalSeconds(selectedInterval) {
        switch (selectedInterval) {
            case "1h":
                return 60;        // 1 minute candles

            case "6h":
                return 5 * 60;    // 5 minute candles

            case "24h":
                return 15 * 60;   // 15 minute candles

            case "1w":
                return 60 * 60;   // 1 hour candles

            case "1m":
                return 6 * 60 * 60; // 6 hour candles

            default:
                return 60;
        }
    }

    // --------------------------------------------------
    // Convert backend candle to lightweight-charts format
    // --------------------------------------------------

    function formatCandle(item) {
        const IST_OFFSET_SECONDS = 5.5 * 60 * 60;

        return {
            time:
                Math.floor(
                    new Date(item.timestamp).getTime() / 1000
                ) + IST_OFFSET_SECONDS,

            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
        };
    }

    // --------------------------------------------------
    // Create a new currently-forming candle
    // --------------------------------------------------

    function createFormingCandle(completedCandle, selectedInterval) {
        const intervalSeconds =
            getIntervalSeconds(selectedInterval);

        const price = completedCandle.close;

        return {
            time: completedCandle.time + intervalSeconds,
            open: price,
            high: price,
            low: price,
            close: price,
        };
    }

    // --------------------------------------------------
    // Get the correct candle list from CandleStreamDto
    // --------------------------------------------------

    function getCandlesForInterval(data, selectedInterval) {
        switch (selectedInterval) {
            case "1h":
                return data.minuteCandles ?? [];

            case "6h":
                return data.fiveMinuteCandles ?? [];

            case "24h":
                return data.fifteenMinuteCandles ?? [];

            case "1w":
                return data.hourCandles ?? [];

            case "1m":
                return data.sixHourCandles ?? [];

            default:
                return [];
        }
    }

    // --------------------------------------------------
    // Convert OHLC candles to line/area format
    // --------------------------------------------------

    function toLineData(data) {
        return data.map(candle => ({
            time: candle.time,
            value: candle.close,
        }));
    }

    // --------------------------------------------------
    // Fetch historical candles
    // --------------------------------------------------

    useEffect(() => {
        if (!companyId) return;

        fetch(
            `${baseUrl}/company/candles/${companyId}?range=${interval}`
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch candle history"
                    );
                }

                return response.json();
            })
            .then(data => {
                const formatted = data
                    .map(formatCandle)
                    .filter(
                        candle =>
                            !isNaN(candle.time) &&
                            !isNaN(candle.open) &&
                            !isNaN(candle.high) &&
                            !isNaN(candle.low) &&
                            !isNaN(candle.close)
                    )
                    .sort((a, b) => a.time - b.time);

                if (formatted.length === 0) {
                    candlesRef.current = [];
                    setCandles([]);
                    return;
                }

                /*
                 * The API gives us COMPLETED candles.
                 *
                 * Example:
                 *
                 * 10:18
                 * 10:19
                 * 10:20
                 * 10:21  <- completed
                 *
                 * We create:
                 *
                 * 10:22  <- currently forming
                 */

                const lastCompleted =
                    formatted[formatted.length - 1];

                const formingCandle =
                    createFormingCandle(
                        lastCompleted,
                        interval
                    );

                const allCandles = [
                    ...formatted,
                    formingCandle,
                ];

                candlesRef.current = allCandles;
                setCandles(allCandles);
            })
            .catch(error => {
                console.error(
                    "Error fetching candle history:",
                    error
                );
            });
    }, [baseUrl, companyId, interval]);

    // --------------------------------------------------
    // SSE candle stream
    // --------------------------------------------------

    useEffect(() => {
        if (!companyId) return;

        const eventSource = new EventSource(
            `${baseUrl}/stream/candles`
        );

        eventSource.onopen = () => {
            console.log("Candle stream connected");
        };

        eventSource.onmessage = event => {
            try {
                const data = JSON.parse(event.data);

                const selectedInterval =
                    intervalRef.current;

                const selectedCandles =
                    getCandlesForInterval(
                        data,
                        selectedInterval
                    );

                if (
                    !selectedCandles ||
                    selectedCandles.length === 0
                ) {
                    return;
                }

                // Stream contains candles for all companies.
                // Keep only this company's candle.
                const companyCandle =
                    selectedCandles.find(
                        candle =>
                            Number(candle.company?.id) ===
                            Number(companyId)
                    );

                if (!companyCandle) {
                    return;
                }

                const incoming =
                    formatCandle(companyCandle);

                if (
                    isNaN(incoming.time) ||
                    isNaN(incoming.open) ||
                    isNaN(incoming.high) ||
                    isNaN(incoming.low) ||
                    isNaN(incoming.close)
                ) {
                    return;
                }

                const existingCandles =
                    candlesRef.current;

                if (existingCandles.length === 0) {
                    return;
                }

                /*
                 * The LAST candle is currently forming.
                 *
                 * Example before SSE:
                 *
                 * 10:19
                 * 10:20
                 * 10:21  <- completed
                 * 10:22  <- forming
                 *
                 * SSE sends:
                 * 10:21
                 *
                 * Therefore:
                 *
                 * 10:21 -> completed
                 * 10:22 -> create new forming candle
                 */

                const lastFormingCandle =
                    existingCandles.at(-1);

                /*
                 * The incoming candle should be the
                 * currently-forming candle from our
                 * previous state.
                 *
                 * Replace it with the now-completed candle.
                 */
                if (
                    lastFormingCandle.time ===
                    incoming.time
                ) {
                    existingCandles[
                    existingCandles.length - 1
                        ] = incoming;
                } else {
                    /*
                     * Normally this happens when the
                     * frontend has just loaded/reloaded
                     * history and SSE starts from the
                     * next completed candle.
                     *
                     * Replace the last forming candle
                     * with the incoming completed candle.
                     */
                    existingCandles[
                    existingCandles.length - 1
                        ] = incoming;
                }

                // Create the NEXT currently-forming candle.
                const newFormingCandle =
                    createFormingCandle(
                        incoming,
                        selectedInterval
                    );

                existingCandles.push(
                    newFormingCandle
                );

                candlesRef.current =
                    existingCandles;

                setCandles([
                    ...existingCandles,
                ]);
            } catch (error) {
                console.error(
                    "Error parsing candle stream:",
                    error
                );
            }
        };

        eventSource.onerror = error => {
            console.error(
                "Candle stream error:",
                error
            );
        };

        return () => {
            eventSource.close();

            console.log(
                "Candle stream disconnected"
            );
        };
    }, [baseUrl, companyId]);

    // --------------------------------------------------
    // Create chart
    // --------------------------------------------------

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(
            chartContainerRef.current,
            {
                width:
                    chartContainerRef.current.clientWidth ||
                    800,

                height: 400,

                layout: {
                    background: {
                        color: "transparent",
                    },
                },

                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                    borderVisible: false,
                },

                rightPriceScale: {
                    borderVisible: false,
                },
            }
        );

        chartRef.current = chart;

        const handleResize = () => {
            if (!chartContainerRef.current) return;

            chart.applyOptions({
                width:
                chartContainerRef.current.clientWidth,
            });
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );

            chart.remove();

            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    // --------------------------------------------------
    // Theme
    // --------------------------------------------------

    useEffect(() => {
        if (!chartRef.current) return;

        const isDark = theme === "dark";

        chartRef.current.applyOptions({
            layout: {
                background: {
                    color: "transparent",
                },

                textColor: isDark
                    ? "#a1a1aa"
                    : "#71717a",
            },

            grid: {
                vertLines: {
                    color: "transparent",
                },

                horzLines: {
                    color: "transparent",
                },
            },
        });
    }, [theme]);

    // --------------------------------------------------
    // Create selected chart series
    // --------------------------------------------------

    useEffect(() => {
        if (!chartRef.current) return;

        const chart = chartRef.current;

        if (seriesRef.current) {
            chart.removeSeries(
                seriesRef.current
            );

            seriesRef.current = null;
        }

        let series;

        if (chartType === "candle") {
            series = chart.addSeries(
                CandlestickSeries,
                {
                    upColor: "#26a69a",
                    downColor: "#ef5350",

                    borderUpColor:
                        "#26a69a",

                    borderDownColor:
                        "#ef5350",

                    wickUpColor:
                        "#26a69a",

                    wickDownColor:
                        "#ef5350",
                }
            );
        } else if (chartType === "line") {
            series = chart.addSeries(
                LineSeries,
                {
                    lineWidth: 2,
                }
            );
        } else {
            series = chart.addSeries(
                AreaSeries,
                {
                    lineWidth: 2,

                    topColor:
                        "rgba(38, 166, 154, 0.35)",

                    bottomColor:
                        "rgba(38, 166, 154, 0.02)",
                }
            );
        }

        seriesRef.current = series;

        if (candlesRef.current.length > 0) {
            if (chartType === "candle") {
                series.setData(
                    candlesRef.current
                );
            } else {
                series.setData(
                    toLineData(
                        candlesRef.current
                    )
                );
            }

            chart.timeScale().fitContent();
        }
    }, [chartType]);

    // --------------------------------------------------
    // Update series when candle data changes
    // --------------------------------------------------

    useEffect(() => {
        if (
            !seriesRef.current ||
            candles.length === 0
        ) {
            return;
        }

        if (chartType === "candle") {
            seriesRef.current.setData(
                candles
            );
        } else {
            seriesRef.current.setData(
                toLineData(candles)
            );
        }

        chartRef.current
            ?.timeScale()
            .fitContent();
    }, [candles, chartType]);

    // --------------------------------------------------
    // Update currently-forming candle from current price
    // --------------------------------------------------

    function updateCurrentCandle(price) {
        if (!seriesRef.current) return;

        if (!price || isNaN(price)) return;

        const data = candlesRef.current;

        if (data.length === 0) return;

        /*
         * The LAST candle is always the
         * currently-forming candle.
         */
        const lastIndex = data.length - 1;

        const last = {
            ...data[lastIndex],
        };

        /*
         * Open does NOT change.
         *
         * It is the price at which this
         * time period started.
         */

        last.high = Math.max(
            last.high,
            price
        );

        last.low = Math.min(
            last.low,
            price
        );

        last.close = price;

        data[lastIndex] = last;

        if (chartType === "candle") {
            seriesRef.current.update(last);
        } else {
            seriesRef.current.update({
                time: last.time,
                value: last.close,
            });
        }
    }

    // --------------------------------------------------
    // Live price update
    // --------------------------------------------------

    useEffect(() => {
        if (currentPrice != null) {
            updateCurrentCandle(
                Number(currentPrice)
            );
        }
    }, [
        currentPrice,
        chartType,
    ]);

    return (
        <div>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Price Chart
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {companySymbol} price movement
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">

                    {/* Range buttons */}

                    <div className="flex w-fit overflow-x-auto rounded-lg border border-gray-200 p-1 dark:border-zinc-800">
                        {intervals.map(item => {
                            const isActive =
                                interval === item;

                            return (
                                <button
                                    key={item}
                                    className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                                        isActive
                                            ? "bg-gray-300 text-black shadow-sm dark:bg-white"
                                            : "hover:bg-gray-200/60 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                                    }`}
                                    onClick={() =>
                                        setInterval(item)
                                    }
                                >
                                    {item}
                                </button>
                            );
                        })}
                    </div>

                    {/* Chart type buttons */}

                    <div className="flex w-fit overflow-x-auto rounded-lg border border-gray-200 p-1 dark:border-zinc-800">
                        {chartTypes.map(type => {
                            const isActive =
                                chartType ===
                                type.key;

                            return (
                                <button
                                    key={type.key}
                                    className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                                        isActive
                                            ? "bg-gray-300 text-black shadow-sm dark:bg-white"
                                            : "hover:bg-gray-200/60 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                                    }`}
                                    onClick={() =>
                                        setChartType(
                                            type.key
                                        )
                                    }
                                >
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div ref={chartContainerRef} />
        </div>
    );
}

export default Graph;