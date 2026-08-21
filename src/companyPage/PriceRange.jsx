function PriceRange({ label, range, currentPrice, currency }) {
    if (!range) return null;

    const low = range.low;
    const high = range.high;

    // Calculate current price position
    let position = ((currentPrice - low) / (high - low)) * 100;

    // Prevent pointer from going outside the range
    position = Math.max(0, Math.min(100, position));

    const formatPrice = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-zinc-800/40">

            {/* Range Title */}
            <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                    Price Range
                </span>
            </div>

            {/* Price Labels */}
            <div className="mb-3 flex justify-between">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Low
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(low)}
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        High
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(high)}
                    </p>
                </div>
            </div>

            {/* Range Bar */}
            <div className="relative pt-8">

                {/* Current Price Label */}
                <div
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${position}%` }}
                >
                    <div className="whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
                        {formatPrice(currentPrice)}
                    </div>
                </div>

                {/* Line */}
                <div className="relative h-2 rounded-full bg-gray-200 dark:bg-zinc-700">

                    {/* Current Price Pointer */}
                    <div
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-900 shadow dark:border-zinc-900 dark:bg-white"
                        style={{ left: `${position}%` }}
                    />
                </div>

            </div>

        </div>
    );
}

export default PriceRange;