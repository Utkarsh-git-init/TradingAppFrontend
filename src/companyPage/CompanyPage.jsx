import {useParams} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {createChart,CandlestickSeries} from "lightweight-charts";

function CompanyPage(){
    const {companyId} = useParams()
    const [candle, setCandle] = useState([])
    const chartContainerRef = useRef(null);
    useEffect(()=>{
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        fetch(baseUrl+"/company/price_history/"+companyId,{
            method: 'GET',
        }).then(response => response.json())
        .then((data)=>{
            console.log(data)
            setCandle(data)
        })
    },[companyId])
    useEffect(() => {
        if (!chartContainerRef.current || candle.length === 0) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth || 800,
            height: 400,
            layout: {
                background: { color: '#ffffff' },
                textColor: '#333',
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
        });

        const formattedData = candle
            .map(item => ({
                // Map your API properties (right side) to the chart properties (left side)
                time: Math.floor(new Date(item.timestamp).getTime() / 1000),
                open: parseFloat(item.openPrice),
                high: parseFloat(item.highPrice),
                low: parseFloat(item.lowPrice),
                close: parseFloat(item.closePrice)
            }))
            // Filter out rows containing NaN values from incomplete data fields
            .filter(item =>
                !isNaN(item.time) &&
                !isNaN(item.open) &&
                !isNaN(item.high) &&
                !isNaN(item.low) &&
                !isNaN(item.close)
            )
            // Sort chronologically from oldest to newest
            .sort((a, b) => a.time - b.time)
            // Deduplicate matching timestamps
            .filter((item, index, self) => index === 0 || item.time > self[index - 1].time);


        // If all records were filtered out due to errors, skip setting data
        if (formattedData.length > 0) {
            candlestickSeries.setData(formattedData);
            chart.timeScale().fitContent();
        } else {
            console.warn("No valid data available to render the chart.");
        }

        return () => {
            chart.remove();
        };
    }, [candle]);


    return (
        <>
            <div ref={chartContainerRef}
                 style={{ width: '100%', height: '400px', position: 'relative' }}
            >

            </div>
        </>
    )
}
export default CompanyPage;