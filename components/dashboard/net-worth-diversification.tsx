export function NetWorthDiversification({
  diversificationScore,
}: {
  diversificationScore: number;
}) {
  const maxDiversificationScore = 8;
  return (
    <div className="mb-4">
      <h2 className="text-lg font-light text-gray-600 dark:text-gray-400 mb-2">
        Diversification Score
      </h2>
      <div className="flex items-center">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mr-2 flex">
          {[...Array(maxDiversificationScore)].map((_, index) => (
            <div
              key={index}
              className={`h-3 flex-1 ${
                index < diversificationScore
                  ? "bg-green-500 dark:bg-green-400"
                  : "bg-gray-200 dark:bg-gray-700"
              } ${index === 0 ? "rounded-l-full" : ""} ${
                index === maxDiversificationScore - 1 ? "rounded-r-full" : ""
              }`}
              style={{
                marginRight: index < maxDiversificationScore - 1 ? "2px" : "0",
              }}
            ></div>
          ))}
        </div>
        <span className="text-green-600 dark:text-green-400 font-mono">
          {diversificationScore}/{maxDiversificationScore}
        </span>
      </div>
    </div>
  );
}
