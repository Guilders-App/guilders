export function Diversification({
  diversificationScore,
}: {
  diversificationScore: number;
}) {
  const maxDiversificationScore = 8;
  return (
    <div className="mb-6">
      <h2 className="text-lg font-light text-gray-400 mb-2">
        Diversification Score
      </h2>
      <div className="flex items-center">
        <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2 flex">
          {[...Array(maxDiversificationScore)].map((_, index) => (
            <div
              key={index}
              className={`h-2.5 flex-1 ${
                index < maxDiversificationScore - 1
                  ? "bg-green-400"
                  : "bg-gray-700"
              } ${index === 0 ? "rounded-l-full" : ""} ${
                index === maxDiversificationScore - 1 ? "rounded-r-full" : ""
              }`}
              style={{ marginRight: index < 7 ? "2px" : "0" }}
            ></div>
          ))}
        </div>
        <span className="text-green-400 font-mono">7/8</span>
      </div>
    </div>
  );
}
