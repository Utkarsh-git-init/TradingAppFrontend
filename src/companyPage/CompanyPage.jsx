import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

function CompanyPage() {
    const { companyId } = useParams();
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const [candles, setCandles] = useState([]);

    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const candlesRef = useRef([]);

    // Fetch history
    useEffect(() => {
        fetch(`${baseUrl}/company/price_history/${companyId}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setCandles(data)
            });
    }, [baseUrl, companyId]);

    // Create chart once (with proper cleanup)
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: 400,
            layout: {
                background: { color: "#ffffff" },
                textColor: "#333",
            },
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

    // Populate chart whenever history changes
    useEffect(() => {
        if (!seriesRef.current || candles.length === 0) return;

        const formatted = candles
            .map(item => ({
                time: Math.floor(new Date(item.timestamp).getTime() / 1000),
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
        <div
            ref={chartContainerRef}
            style={{
                width: "100%",
                height: "400px",
                position: "relative",
            }}
        />
    );
}

export default CompanyPage;