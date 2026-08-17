import { useParams } from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";
import {useTheme} from "../../context/theme/ThemeProvider.jsx";

function Graph() {
    const {theme} = useTheme()

    const { companyId } = useParams();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [interval, setInterval] = useState('1h');
    const intervals = ['1h', '6h', '24h', '1w', '1m'];
    const [candles, setCandles] = useState([]);

    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const candlesRef = useRef([]);
    // Fetch history
    useEffect(() => {
        fetch(`${baseUrl}/company/candles/${companyId}?range=${interval}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setCandles(data)
            });
    }, [baseUrl, companyId, interval]);

    // Create chart once (with proper cleanup)
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: 400,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",
        });

        chartRef.current = chart;
        seriesRef.current = series;

        // Handle auto-resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener("resize", handleResize);

        // CLEANUP: Destroy chart on unmount / re-render
        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!chartRef.current) return;

        const isDark = theme === "dark";

        chartRef.current.applyOptions({
            layout: {
                background: { color: isDark ? "oklch(21% 0.006 285.885)" : "#ffffff" },
                textColor: isDark ? "#ffffff" : "#333333",
            },
            grid: {
                vertLines: { color: isDark ? "oklch(21% 0.006 285.885)" : "#ffffff"},
                horzLines: { color: isDark ? "oklch(21% 0.006 285.885)" : "#ffffff" },
                // vertLines: { color: isDark ? "#1f2937" : "#f0f3fa" },
                // horzLines: { color: isDark ? "#1f2937" : "#f0f3fa" },
            },
        });
    }, [theme]);

    // Populate chart whenever history changes
    useEffect(() => {
        if (!seriesRef.current || candles.length === 0) return;
        const IST_OFFSET_SECONDS = 5.5 * 60 * 60; // 19800 seconds
        const formatted = candles
            .map(item => ({
                time: Math.floor(new Date(item.timestamp).getTime() / 1000) + IST_OFFSET_SECONDS,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
            }))
            .filter(c =>
                !isNaN(c.time) &&
                !isNaN(c.open) &&
                !isNaN(c.high) &&
                !isNaN(c.low) &&
                !isNaN(c.close)
            )
            .sort((a, b) => a.time - b.time);

        candlesRef.current = formatted;
        seriesRef.current.setData(formatted);
        chartRef.current.timeScale().fitContent();
    }, [candles]);

    function updateCurrentCandle(price) {
        if (!seriesRef.current) return;

        const data = candlesRef.current;
        if (data.length === 0) return;

        // Note: mutating objects in place can lead to state tracking issues;
        // consider spreading last candle if you encounter edge-case rendering bugs:
        const last = { ...data[data.length - 1] };

        last.high = Math.max(last.high, price);
        last.low = Math.min(last.low, price);
        last.close = price;

        data[data.length - 1] = last;
        seriesRef.current.update(last);
    }

    // Live price updates
    useEffect(() => {
        const eventSource = new EventSource(`${baseUrl}/stream/prices`);

        eventSource.onmessage = event => {
            const prices = JSON.parse(event.data);

            const company = prices.find(
                p => Number(p.companyId) === Number(companyId)
            );

            if (company) {
                updateCurrentCandle(Number(company.currentPrice));
            }
        };

        return () => eventSource.close();
    }, [baseUrl, companyId]);
    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <div className="w-19/20">
                    <div
                        ref={chartContainerRef}
                    />
                    <div className="flex flex-row p-2">
                        {
                            intervals.map(item => {
                                const isActive=interval===item;
                                return (
                                    <button key={item.id}
                                            className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                                                isActive
                                                    ? "bg-gray-300 dark:bg-white text-black shadow-sm"
                                                    : "hover:bg-gray-200/60 hover:text-gray-900 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                                            }`}
                                            onClick={() => setInterval(item)}
                                    >
                                        {item}
                                    </button>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
export default Graph;